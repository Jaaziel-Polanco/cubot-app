"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type ActionState = {
    error?: string
    success?: boolean
    message?: string
}

/**
 * Creates a payment request for all pending commissions
 */
export async function createPaymentRequest(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    console.log("[createPaymentRequest] Starting...")
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return { error: "Usuario no autenticado" }
        }

        console.log("[createPaymentRequest] User:", user.id)

        // Check if vendor
        const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single()

        if (!profile || profile.role !== "vendor") {
            return { error: "Solo los vendedores pueden solicitar pagos" }
        }

        // Get all pending commissions
        const { data: pendingCommissions, error: commissionsError } = await supabase
            .from("commissions")
            .select("*")
            .eq("vendor_id", user.id)
            .eq("status", "pending")

        if (commissionsError) {
            console.error("[createPaymentRequest] Error fetching commissions:", commissionsError)
            return { error: "Error al obtener comisiones" }
        }

        if (!pendingCommissions || pendingCommissions.length === 0) {
            return { error: "No tienes comisiones pendientes para solicitar" }
        }

        console.log("[createPaymentRequest] Pending commissions:", pendingCommissions.length)

        // Check for existing pending request (not approved)
        const { data: existingRequest } = await supabase
            .from("payment_requests")
            .select("*")
            .eq("vendor_id", user.id)
            .eq("status", "pending")
            .maybeSingle()

        if (existingRequest) {
            console.log("[createPaymentRequest] Existing pending request found")
            return { error: "Ya tienes una solicitud de pago pendiente" }
        }

        // Calculate total amount
        const totalAmount = pendingCommissions.reduce(
            (sum, comm) => sum + Number.parseFloat(comm.commission_amount.toString()),
            0
        )

        const commissionIds = pendingCommissions.map((c) => c.id)

        console.log("[createPaymentRequest] Total amount:", totalAmount, "Commission IDs:", commissionIds.length)

        // Create payment request
        const { error: requestError } = await supabase
            .from("payment_requests")
            .insert({
                vendor_id: user.id,
                amount: totalAmount,
                commission_ids: commissionIds,
                status: "pending",
            })

        if (requestError) {
            console.error("[createPaymentRequest] Error creating request:", requestError)
            return { error: "Error al crear solicitud de pago" }
        }

        // Update commissions status to 'processing'
        const { error: updateError } = await supabase
            .from("commissions")
            .update({ status: "processing" })
            .in("id", commissionIds)

        if (updateError) {
            console.error("[createPaymentRequest] Error updating commissions:", updateError)
            return { error: "Error al actualizar comisiones" }
        }

        console.log("[createPaymentRequest] Success!")
        revalidatePath("/vendor/commissions")
        revalidatePath("/admin/payments")

        return {
            success: true,
            message: `Solicitud de pago por RD$${totalAmount.toFixed(2)} creada exitosamente`,
        }
    } catch (error) {
        console.error("[createPaymentRequest] Unexpected error:", error)
        return { error: "Error al procesar la solicitud" }
    }
}

/**
 * Approves a payment request with receipt upload (Admin only)
 */
export async function approvePaymentRequest(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const requestId = formData.get("requestId") as string
    const receiptFile = formData.get("receipt") as File | null
    const vendorBankAccountId = formData.get("vendorBankAccountId") as string

    console.log("[approvePaymentRequest] Starting for request:", requestId)
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return { error: "Usuario no autenticado" }
        }

        // Check admin role
        const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single()

        if (!profile || !["admin", "finance"].includes(profile.role)) {
            return { error: "No tienes permisos para aprobar solicitudes" }
        }

        // Get payment request with vendor info
        const { data: request, error: requestError } = await supabase
            .from("payment_requests")
            .select("*, users!vendor_id(bank_account)")
            .eq("id", requestId)
            .single()

        if (requestError || !request) {
            return { error: "Solicitud no encontrada" }
        }

        if (request.status !== "pending") {
            return { error: "Esta solicitud ya fue procesada" }
        }

        console.log("[approvePaymentRequest] Commission IDs:", request.commission_ids.length)

        let receiptUrl: string | null = null

        // Upload receipt if provided
        if (receiptFile && receiptFile.size > 0) {
            console.log("[approvePaymentRequest] Uploading receipt:", receiptFile.name)

            const fileExt = receiptFile.name.split(".").pop()
            const fileName = `${requestId}-${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from("payments")
                .upload(fileName, receiptFile)

            if (uploadError) {
                console.error("[approvePaymentRequest] Upload error:", uploadError)
                return { error: "Error al subir el comprobante de pago" }
            }

            const { data: publicUrlData } = supabase.storage
                .from("payments")
                .getPublicUrl(fileName)

            receiptUrl = publicUrlData.publicUrl
            console.log("[approvePaymentRequest] Receipt uploaded:", receiptUrl)
        }

        // Get vendor's bank account (remove after migration)
        const vendorBankAccount = (request.users as any)?.bank_account || null

        // Update payment request to approved
        const { error: updateRequestError } = await supabase
            .from("payment_requests")
            .update({
                status: "approved",
                approved_at: new Date().toISOString(),
                approved_by: user.id,
                receipt_url: receiptUrl,
                vendor_bank_account_id: vendorBankAccountId || null,
            })
            .eq("id", requestId)

        if (updateRequestError) {
            console.error("[approvePaymentRequest] Error updating request:", updateRequestError)
            return { error: "Error al aprobar solicitud" }
        }

        // Update commissions to paid
        const { error: updateCommsError } = await supabase
            .from("commissions")
            .update({ status: "paid" })
            .in("id", request.commission_ids)

        if (updateCommsError) {
            console.error("[approvePaymentRequest] Error updating commissions:", updateCommsError)
            return { error: "Error al actualizar comisiones" }
        }

        console.log("[approvePaymentRequest] Success!")
        revalidatePath("/admin/payments")
        revalidatePath("/vendor/commissions")

        return {
            success: true,
            message: `Solicitud aprobada. RD$${request.amount.toFixed(2)} marcados como pagados${receiptUrl ? " con comprobante" : ""}.`,
        }
    } catch (error) {
        console.error("[approvePaymentRequest] Unexpected error:", error)
        return { error: "Error al procesar la aprobación" }
    }
}

/**
 * Rejects a payment request (Admin only)
 */
export async function rejectPaymentRequest(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const requestId = formData.get("requestId") as string
    const reason = formData.get("reason") as string
    console.log("[rejectPaymentRequest] Starting for request:", requestId)
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return { error: "Usuario no autenticado" }
        }

        // Check admin role
        const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single()

        if (!profile || !["admin", "finance"].includes(profile.role)) {
            return { error: "No tienes permisos para rechazar solicitudes" }
        }

        // Get payment request
        const { data: request, error: requestError } = await supabase
            .from("payment_requests")
            .select("*")
            .eq("id", requestId)
            .single()

        if (requestError || !request) {
            return { error: "Solicitud no encontrada" }
        }

        if (request.status !== "pending") {
            return { error: "Esta solicitud ya fue procesada" }
        }

        // Update payment request to rejected
        const { error: updateRequestError } = await supabase
            .from("payment_requests")
            .update({
                status: "rejected",
                rejected_reason: reason,
            })
            .eq("id", requestId)

        if (updateRequestError) {
            console.error("[rejectPaymentRequest] Error updating request:", updateRequestError)
            return { error: "Error al rechazar solicitud" }
        }

        // Revert commissions back to pending
        const { error: updateCommsError } = await supabase
            .from("commissions")
            .update({ status: "pending" })
            .in("id", request.commission_ids)

        if (updateCommsError) {
            console.error("[rejectPaymentRequest] Error updating commissions:", updateCommsError)
            return { error: "Error al actualizar comisiones" }
        }

        console.log("[rejectPaymentRequest] Success!")
        revalidatePath("/admin/payments")
        revalidatePath("/vendor/commissions")

        return {
            success: true,
            message: "Solicitud rechazada. Comisiones revertidas a pendientes.",
        }
    } catch (error) {
        console.error("[rejectPaymentRequest] Unexpected error:", error)
        return { error: "Error al procesar el rechazo" }
    }
}
