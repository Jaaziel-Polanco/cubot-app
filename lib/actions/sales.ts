"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { validateImei } from "@/lib/utils/imei"
import { checkInventoryByImei } from "@/lib/services/inventory"
import { calculateRisk } from "@/lib/utils/risk"
import { createCommission } from "@/lib/services/commissions"

// Schemas
const registerSaleSchema = z.object({
    imei: z.string().length(15, "El IMEI debe tener 15 dígitos"),
    productId: z.string().uuid("Producto inválido"),
    channel: z.enum(["Online", "Tienda Fisica", "Marketplace", "Venta Telefonica"]),
    saleDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Fecha inválida"),
    // evidenceUrl is handled separately via file upload
    notes: z.string().optional(),
})

const validateSaleSchema = z.object({
    saleId: z.string().uuid(),
    action: z.enum(["approve", "reject"]),
    reason: z.string().optional(),
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

        // 1. Extract and Validate Data
        const rawData = {
            imei: formData.get("imei"),
            productId: formData.get("productId"),
            channel: formData.get("channel"),
            saleDate: formData.get("saleDate"),
            notes: formData.get("notes"),
        }

        const validated = registerSaleSchema.safeParse(rawData)
        if (!validated.success) {
            return { error: validated.error.errors[0].message }
        }

        const { imei, productId, channel, saleDate, notes } = validated.data

        // 2. Handle File Upload (Evidence)
        const evidenceFile = formData.get("evidence") as File
        if (!evidenceFile || evidenceFile.size === 0) {
            return { error: "La evidencia de venta es requerida" }
        }

        // Upload to Supabase Storage
        const fileExt = evidenceFile.name.split(".").pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
            .from("evidence")
            .upload(fileName, evidenceFile)

        if (uploadError) {
            console.error("Upload Error:", uploadError)
            return { error: "Error al subir la evidencia" }
        }

        const { data: { publicUrl: evidenceUrl } } = supabase.storage
            .from("evidence")
            .getPublicUrl(fileName)

        // 3. Inventory Check & Risk Analysis
        // Get product details for risk calc
        const { data: product } = await supabase
            .from("products")
            .select("*")
            .eq("id", productId)
            .single()

        if (!product) return { error: "Producto no encontrado" }

        // Check external inventory
        const inventoryResult = await checkInventoryByImei(imei)

        // Calculate Risk
        const riskLevel = await calculateRisk({
            imei,
            vendorId: user.id,
            inventoryResult,
            selectedProduct: product
        })

        // 4. Register Sale
        // Generate Sale ID (VT-XXXX) manually with retry for concurrency
        let saleId = ""
        let insertSuccess = false
        let attempts = 0
        const maxAttempts = 3

        // Get vendor profile once
        const { data: vendorProfile } = await supabase
            .from("users")
            .select("vendor_id")
            .eq("id", user.id)
            .single()

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
                    vendor_id: user.id, // User is the vendor
                    product_id: productId,
                    imei,
                    sale_price: product.price, // Base price
                    sale_date: saleDate,
                    channel,
                    status: "pending",
                    evidence_url: evidenceUrl,
                    risk_level: riskLevel,
                    notes,
                    inventory_check_status: inventoryResult ? "verified" : "not_found",
                    inventory_data: inventoryResult,
                })

            if (!insertError) {
                insertSuccess = true
            } else {
                // Check if error is unique violation on sale_id
                if (insertError.code === "23505" && insertError.message.includes("sale_id")) {
                    console.warn(`Sale ID collision for ${saleId}, retrying...`)
                    continue
                }

                console.error("Insert Error:", insertError)
                return { error: "Error al registrar la venta en base de datos" }
            }
        }

        if (!insertSuccess) {
            return { error: "Error al generar ID de venta único. Intente nuevamente." }
        }

        revalidatePath("/vendor/sales")
        return { success: true, message: "Venta registrada exitosamente" }

    } catch (error: unknown) {
        console.error("Server Action Error:", error)
        const errorMessage = error instanceof Error ? error.message : "Error desconocido"
        return { error: "Error interno del servidor: " + errorMessage }
    }
}

export async function validateSale(prevState: ActionState, formData: FormData): Promise<ActionState> {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        // Check if user is admin/validator
        const { data: profile } = await supabase.from("users").select("role").eq("id", user?.id).single()
        if (!profile || !["admin", "validator"].includes(profile.role)) {
            return { error: "No tiene permisos para validar ventas" }
        }

        const rawData = {
            saleId: formData.get("saleId"),
            action: formData.get("action"),
            reason: formData.get("reason"),
        }

        const validated = validateSaleSchema.safeParse(rawData)
        if (!validated.success) {
            return { error: validated.error.errors[0].message }
        }

        const { saleId, action, reason } = validated.data

        if (action === "reject") {
            const { error } = await supabase
                .from("sales")
                .update({
                    status: "rejected",
                    rejection_reason: reason,
                    validated_by: user?.id,
                    validated_at: new Date().toISOString()
                })
                .eq("id", saleId)

            if (error) return { error: "Error al rechazar la venta" }
        } else {
            // Approve logic
            // 1. Get sale details
            const { data: sale } = await supabase
                .from("sales")
                .select("*, products(*)")
                .eq("id", saleId)
                .single()

            if (!sale) return { error: "Venta no encontrada" }

            // 2. Create Commission Record (Source of Truth for Payments)
            try {
                const commission = await createCommission({
                    sale_id: sale.sale_id,
                    vendor_id: sale.vendor_id,
                    product_id: sale.product_id,
                    sale_price: Number(sale.sale_price)
                })

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

                if (error) throw error

            } catch (err: unknown) {
                console.error("Error creating commission:", err)
                const msg = err instanceof Error ? err.message : "Error desconocido"
                return { error: "Error al crear la comisión: " + msg }
            }
        }

        revalidatePath("/admin/validation")
        return { success: true, message: `Venta ${action === 'approve' ? 'aprobada' : 'rechazada'} correctamente` }

    } catch (error) {
        console.error("Validation Error:", error)
        return { error: "Error al procesar la validación" }
    }
}
