import { createClient } from "@/lib/supabase/server"
import type { KycDocument, User } from "@/lib/types"
import { logAudit } from "./audit"

/**
 * Gets all KYC documents for a vendor
 */
export async function getVendorKycDocuments(vendorId: string): Promise<KycDocument[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("kyc_documents")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Gets all pending KYC documents (admin only)
 */
export async function getPendingKycDocuments(): Promise<(KycDocument & { vendor?: User })[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("kyc_documents")
    .select("*, users(*)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Approves KYC for a vendor
 */
export async function approveVendorKyc(
  vendorId: string,
  adminId: string,
  documentIds?: string[],
): Promise<User> {
  const supabase = await createClient()

  // Update user KYC status
  const { data: user, error: userError } = await supabase
    .from("users")
    .update({
      kyc_status: "approved",
      kyc_verified_at: new Date().toISOString(),
    })
    .eq("id", vendorId)
    .select()
    .single()

  if (userError) throw userError

  // Update KYC documents if specific documents are provided
  if (documentIds && documentIds.length > 0) {
    const { error: docError } = await supabase
      .from("kyc_documents")
      .update({
        status: "approved",
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .in("id", documentIds)
      .eq("vendor_id", vendorId)

    if (docError) throw docError
  } else {
    // Approve all pending documents for this vendor
    const { error: docError } = await supabase
      .from("kyc_documents")
      .update({
        status: "approved",
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("vendor_id", vendorId)
      .eq("status", "pending")

    if (docError) throw docError
  }

  // Log audit
  try {
    await logAudit({
      actor_id: adminId,
      action: "approve_kyc",
      entity: "users",
      entity_id: vendorId,
      diff: { new_values: { kyc_status: "approved" } },
    })
  } catch (auditError) {
    console.warn("[v0] Failed to log audit, continuing:", auditError)
  }

  return user
}

/**
 * Rejects KYC for a vendor
 */
export async function rejectVendorKyc(
  vendorId: string,
  adminId: string,
  reason: string,
  documentIds?: string[],
): Promise<User> {
  const supabase = await createClient()

  // Update user KYC status
  const { data: user, error: userError } = await supabase
    .from("users")
    .update({
      kyc_status: "rejected",
      kyc_verified_at: null,
    })
    .eq("id", vendorId)
    .select()
    .single()

  if (userError) throw userError

  // Update KYC documents if specific documents are provided
  if (documentIds && documentIds.length > 0) {
    const { error: docError } = await supabase
      .from("kyc_documents")
      .update({
        status: "rejected",
        rejection_reason: reason,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .in("id", documentIds)
      .eq("vendor_id", vendorId)

    if (docError) throw docError
  } else {
    // Reject all pending documents for this vendor
    const { error: docError } = await supabase
      .from("kyc_documents")
      .update({
        status: "rejected",
        rejection_reason: reason,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("vendor_id", vendorId)
      .eq("status", "pending")

    if (docError) throw docError
  }

  // Log audit
  try {
    await logAudit({
      actor_id: adminId,
      action: "reject_kyc",
      entity: "users",
      entity_id: vendorId,
      diff: { new_values: { kyc_status: "rejected", rejection_reason: reason } },
    })
  } catch (auditError) {
    console.warn("[v0] Failed to log audit, continuing:", auditError)
  }

  return user
}

