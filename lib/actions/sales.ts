"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"
import { validateImei } from "@/lib/utils/imei"
import { checkInventoryByImei } from "@/lib/services/inventory"
import { calculateRisk } from "@/lib/utils/risk"
import { createCommission } from "@/lib/services/commissions"

// Schema for single IMEI entry
const imeiEntrySchema = z.object({
    imei: z.string().length(15, "El IMEI debe tener 15 dígitos"),
    productId: z.string().uuid("Producto inválido"),
})

// Schema for multiple IMEI data
const imeiDataSchema = z.array(imeiEntrySchema).min(1, "Se requiere al menos un dispositivo")

// Schemas
const registerSaleSchema = z.object({
    channel: z.enum(["Online", "Tienda Fisica", "Marketplace", "Venta Telefonica"]),
    saleDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Fecha inválida"),
    notes: z.string().optional(),
})

const validateSaleSchema = z.object({
    saleId: z.string().uuid(),
    action: z.enum(["approve", "reject"]),
    reason: z.string().nullish(),
}).refine((data) => {
    if (data.action === "reject") {
        return data.reason != null && data.reason.trim().length > 0;
    }
    return true;
}, {
    message: "La razón del rechazo es obligatoria",
    path: ["reason"]
})

export type ActionState = {
    error?: string
    success?: boolean
    message?: string
}

export async function registerSale(prevState: ActionState, formData: FormData): Promise<ActionState> {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return { error: "Usuario no autenticado" }
        }

        // 1. Extract and Validate Base Data
        const rawData = {
            channel: formData.get("channel"),
            saleDate: formData.get("saleDate"),
            notes: formData.get("notes"),
        }

        const validated = registerSaleSchema.safeParse(rawData)
        if (!validated.success) {
            return { error: validated.error.errors[0].message }
        }

        const { channel, saleDate, notes } = validated.data

        // 2. Parse and Validate IMEI Data
        const imeiDataRaw = formData.get("imeiData")
        if (!imeiDataRaw || typeof imeiDataRaw !== "string") {
            return { error: "Datos de dispositivos no válidos" }
        }

        let imeiEntries: { imei: string; productId: string }[]
        try {
            imeiEntries = JSON.parse(imeiDataRaw)
        } catch {
            return { error: "Error al procesar datos de dispositivos" }
        }

        const validatedImeis = imeiDataSchema.safeParse(imeiEntries)
        if (!validatedImeis.success) {
            return { error: validatedImeis.error.errors[0].message }
        }

        const devices = validatedImeis.data

        // 3. Handle File Upload (Evidence) - shared by all devices
        const evidenceFile = formData.get("evidence") as File
        if (!evidenceFile || evidenceFile.size === 0) {
            return { error: "La evidencia de venta es requerida" }
        }

        const fileExt = evidenceFile.name.split(".").pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        const serviceSupabase = createServiceClient()
        const { error: uploadError } = await serviceSupabase.storage
            .from("evidence")
            .upload(fileName, evidenceFile)

        if (uploadError) {
            console.error("Upload Error:", uploadError)
            return { error: "Error al subir la evidencia" }
        }

        const evidenceUrl = fileName

        // 4. Validate all IMEIs before creating any sales
        const validationResults: Array<{
            entry: typeof devices[0]
            product: any
            inventoryResult: any
            riskLevel: string
        }> = []

        for (const entry of devices) {
            // Check if IMEI already exists in approved sales
            const { data: existingSale } = await supabase
                .from("sales")
                .select("sale_id, status")
                .eq("imei", entry.imei)
                .eq("status", "approved")
                .maybeSingle()

            if (existingSale) {
                return {
                    error: `El IMEI ${entry.imei} ya fue registrado en la venta ${existingSale.sale_id}. Elimina este dispositivo de la lista para continuar.`
                }
            }

            // Check if same IMEI appears twice in this batch
            const duplicateInBatch = devices.filter(d => d.imei === entry.imei).length > 1
            if (duplicateInBatch) {
                return {
                    error: `El IMEI ${entry.imei} aparece más de una vez en esta venta. Cada IMEI debe ser único.`
                }
            }

            // Get product details
            const { data: product } = await supabase
                .from("products")
                .select("*")
                .eq("id", entry.productId)
                .single()

            if (!product) {
                return { error: `Producto no encontrado para IMEI ${entry.imei}` }
            }

            // Check external inventory
            const inventoryResult = await checkInventoryByImei(entry.imei)

            // Calculate Risk
            const riskLevel = await calculateRisk({
                imei: entry.imei,
                vendorId: user.id,
                inventoryResult,
                selectedProduct: product
            })

            validationResults.push({
                entry,
                product,
                inventoryResult,
                riskLevel
            })
        }

        // 5. Create sales for all devices
        const createdSaleIds: string[] = []
        const batchId = `BATCH-${Date.now()}`

        for (const result of validationResults) {
            let saleId = ""
            let insertSuccess = false
            let attempts = 0
            const maxAttempts = 3

            while (!insertSuccess && attempts < maxAttempts) {
                attempts++

                const { data: lastSale } = await supabase
                    .from("sales")
                    .select("sale_id")
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .single()

                let nextId = 1
                if (lastSale?.sale_id) {
                    const match = lastSale.sale_id.match(/VT-(\d+)/)
                    if (match) {
                        nextId = parseInt(match[1]) + 1
                    }
                }

                saleId = `VT-${nextId.toString().padStart(4, "0")}`

                const { error: insertError } = await supabase
                    .from("sales")
                    .insert({
                        sale_id: saleId,
                        vendor_id: user.id,
                        product_id: result.entry.productId,
                        imei: result.entry.imei,
                        sale_price: result.product.price,
                        sale_date: saleDate,
                        channel,
                        status: "pending",
                        evidence_url: evidenceUrl,
                        risk_level: result.riskLevel,
                        notes: devices.length > 1
                            ? `${notes || ""} [Lote: ${batchId} - ${devices.length} dispositivos]`.trim()
                            : notes,
                        inventory_check_status: result.inventoryResult ? "verified" : "not_found",
                        inventory_data: result.inventoryResult,
                    })

                if (!insertError) {
                    insertSuccess = true
                    createdSaleIds.push(saleId)
                } else {
                    if (insertError.code === "23505" && insertError.message.includes("sale_id")) {
                        console.warn(`Sale ID collision for ${saleId}, retrying...`)
                        continue
                    }

                    console.error("Insert Error:", insertError)
                    return { error: `Error al registrar venta para IMEI ${result.entry.imei}` }
                }
            }

            if (!insertSuccess) {
                return { error: "Error al generar ID de venta único. Intente nuevamente." }
            }
        }

        revalidatePath("/vendor/sales")

        const message = devices.length === 1
            ? "Venta registrada exitosamente"
            : `${devices.length} ventas registradas exitosamente`

        return { success: true, message }

    } catch (error: unknown) {
        console.error("Server Action Error:", error)
        const errorMessage = error instanceof Error ? error.message : "Error desconocido"
        return { error: "Error interno del servidor: " + errorMessage }
    }
}


export async function validateSale(prevState: ActionState, formData: FormData): Promise<ActionState> {
    console.log("[validateSale] Starting validation process...")
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        console.log("[validateSale] User authenticated:", user?.id)

        // Check if user is admin/validator
        const { data: profile, error: profileError } = await supabase.from("users").select("role").eq("id", user?.id).single()
        console.log("[validateSale] User profile:", profile, "Error:", profileError)

        if (!profile || !["admin", "validator"].includes(profile.role)) {
            console.log("[validateSale] Permission denied for role:", profile?.role)
            return { error: "No tiene permisos para validar ventas" }
        }

        const rawData = {
            saleId: formData.get("saleId"),
            action: formData.get("action"),
            reason: formData.get("reason"),
        }
        console.log("[validateSale] Form data:", rawData)

        const validated = validateSaleSchema.safeParse(rawData)
        if (!validated.success) {
            console.log("[validateSale] Validation failed:", validated.error.errors)
            return { error: validated.error.errors[0].message }
        }

        const { saleId, action, reason } = validated.data
        console.log("[validateSale] Validated data - saleId:", saleId, "action:", action)

        if (action === "reject") {
            console.log("[validateSale] Rejecting sale...")
            const { error } = await supabase
                .from("sales")
                .update({
                    status: "rejected",
                    rejection_reason: reason,
                    validated_by: user?.id,
                    validated_at: new Date().toISOString()
                })
                .eq("id", saleId)

            if (error) {
                console.error("[validateSale] Reject error:", error)
                return { error: "Error al rechazar la venta: " + error.message }
            }
            console.log("[validateSale] Sale rejected successfully")
        } else {
            // Approve logic
            console.log("[validateSale] Approving sale...")

            // 1. Get sale details
            const { data: sale, error: saleError } = await supabase
                .from("sales")
                .select("*, products(*)")
                .eq("id", saleId)
                .single()

            console.log("[validateSale] Fetched sale:", sale?.sale_id, "Error:", saleError)

            if (!sale) {
                console.error("[validateSale] Sale not found for id:", saleId)
                return { error: "Venta no encontrada" }
            }

            // 2. Create Commission Record (Source of Truth for Payments)
            try {
                console.log("[validateSale] Creating commission with:", {
                    sale_id: sale.sale_id,
                    vendor_id: sale.vendor_id,
                    product_id: sale.product_id,
                    sale_price: Number(sale.sale_price)
                })

                const commission = await createCommission({
                    sale_id: sale.sale_id,
                    vendor_id: sale.vendor_id,
                    product_id: sale.product_id,
                    sale_price: Number(sale.sale_price)
                })

                console.log("[validateSale] Commission created:", commission)

                // 3. Update sale status and cache commission amount
                const { error } = await supabase
                    .from("sales")
                    .update({
                        status: "approved",
                        commission_amount: commission.commission_amount,
                        validated_by: user?.id,
                        validated_at: new Date().toISOString()
                    })
                    .eq("id", saleId)

                if (error) {
                    console.error("[validateSale] Update sale error:", error)
                    throw error
                }

                console.log("[validateSale] Sale approved successfully")

            } catch (err: unknown) {
                console.error("[validateSale] Error creating commission:", err)
                const msg = err instanceof Error ? err.message : "Error desconocido"
                return { error: "Error al crear la comisión: " + msg }
            }
        }

        revalidatePath("/admin/validation")
        revalidatePath("/admin/sales")
        console.log("[validateSale] Validation complete, paths revalidated")
        return { success: true, message: `Venta ${action === 'approve' ? 'aprobada' : 'rechazada'} correctamente` }

    } catch (error) {
        console.error("[validateSale] Unexpected error:", error)
        return { error: "Error al procesar la validación" }
    }
}
