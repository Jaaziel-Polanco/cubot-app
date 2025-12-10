import { createClient } from "@/lib/supabase/server"
import type { PaymentBatch } from "@/lib/types"
import { generateBatchId } from "@/lib/utils/ids"
import { arrayToCSV } from "@/lib/utils/csv"
import { createNotification } from "./notifications"
import { logAudit } from "./audit"

interface CreatePaymentBatchData {
  admin_id: string
  period_start: string
  period_end: string
  payment_type: "weekly" | "biweekly" | "monthly"
}

/**
 * Creates a payment batch from vendor_commissions and generates CSV
 */
export async function createPaymentBatch(data: CreatePaymentBatchData): Promise<PaymentBatch> {
  const supabase = await createClient()

  // Get pending vendor commissions for period
  const { data: vendorCommissions, error: commissionsError } = await supabase
    .from("vendor_commissions")
    .select("*, users(vendor_id, name)")
    .eq("status", "pending")
    .gte("period_start", data.period_start)
    .lte("period_end", data.period_end)

  if (commissionsError || !vendorCommissions || vendorCommissions.length === 0) {
    throw new Error("No pending commissions found for this period")
  }

  // Get primary bank accounts for all vendors
  const vendorIds = vendorCommissions.map((vc) => vc.vendor_id)
  const { data: bankAccounts } = await supabase
    .from("vendor_bank_accounts")
    .select("*, banks(*)")
    .in("vendor_id", vendorIds)
    .eq("is_primary", true)
    .eq("verified", true)  // Only use verified accounts

  // Create map of vendor_id -> bank account
  const bankAccountMap = new Map(
    (bankAccounts || []).map((acc) => [acc.vendor_id, acc])
  )

  // Filter out vendors without verified primary bank accounts
  const vendorsWithAccounts = vendorCommissions.filter((vc) => bankAccountMap.has(vc.vendor_id))

  if (vendorsWithAccounts.length === 0) {
    throw new Error("No vendors with verified primary bank accounts found for this period")
  }

  // Calculate totals
  const totalAmount = vendorsWithAccounts.reduce((sum, c) => sum + Number(c.total_commissions) + Number(c.bonuses), 0)
  const vendorCount = vendorsWithAccounts.length

  // Generate batch ID
  const today = new Date()
  const { count } = await supabase
    .from("payment_batches")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString().split("T")[0])

  const batch_id = generateBatchId(today, count || 0)

  // Create payment batch
  const { data: batch, error: batchError } = await supabase
    .from("payment_batches")
    .insert({
      batch_id,
      period_start: data.period_start,
      period_end: data.period_end,
      payment_type: data.payment_type,
      total_amount: totalAmount,
      total_vendors: vendorCount,
      status: "pending",
      created_by: data.admin_id,
    })
    .select()
    .single()

  if (batchError) throw batchError

  // Generate CSV for bank transfer (as per spec format)
  const csvData = vendorsWithAccounts.map((c) => {
    const bankAccount = bankAccountMap.get(c.vendor_id)
    return {
      vendor_id: c.users.vendor_id,
      name: c.users.name,
      bank_name: bankAccount?.banks?.name || "N/A",
      bank_code: bankAccount?.banks?.code || "N/A",
      account_holder_name: bankAccount?.account_holder_name || "N/A",
      account_number: bankAccount?.account_number || "N/A",
      amount: (Number(c.total_commissions) + Number(c.bonuses)).toFixed(2),
      period_start: c.period_start,
      period_end: c.period_end,
      batch_id: batch_id,
    }
  })

  const csv = arrayToCSV(csvData)

  // Upload CSV to storage
  const csvFileName = `${batch_id}.csv`
  const { error: uploadError } = await supabase.storage.from("payments").upload(csvFileName, csv, {
    contentType: "text/csv",
    upsert: true,
  })

  if (uploadError) {
    console.error("[v0] CSV upload failed:", uploadError)
  }

  // Update vendor commissions with batch reference
  const { error: updateError } = await supabase
    .from("vendor_commissions")
    .update({
      status: "processing",
      payment_batch_id: batch.id,
      payment_receipt_id: batch_id,  // Store batch_id text for reference
    })
    .in(
      "id",
      vendorsWithAccounts.map((c) => c.id),
    )

  if (updateError) throw updateError

  // Notify vendors
  for (const commission of vendorsWithAccounts) {
    await createNotification({
      user_id: commission.vendor_id,
      title: "Payment batch created",
      message: `Your commissions for period ${data.period_start} to ${data.period_end} are being processed in batch ${batch_id}`,
      type: "payment_processing",
    })
  }

  // Log audit
  await logAudit({
    actor_id: data.admin_id,
    action: "create_payment_batch",
    entity: "payment_batches",
    entity_id: batch.id,
    diff: { new_values: batch },
  })

  return batch
}

/**
 * Marks payment batch as completed and commissions as paid
 */
export async function markBatchCompleted(batchId: string, adminId: string): Promise<void> {
  const supabase = await createClient()

  // Update batch
  const { error: batchError } = await supabase
    .from("payment_batches")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", batchId)

  if (batchError) throw batchError

  // Get batch
  const { data: batch } = await supabase.from("payment_batches").select("batch_id, id").eq("id", batchId).single()

  if (!batch) return

  // Update vendor commissions to paid
  const { error: commissionsError } = await supabase
    .from("vendor_commissions")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("payment_batch_id", batch.id)

  if (commissionsError) throw commissionsError

  // Log audit
  await logAudit({
    actor_id: adminId,
    action: "complete_payment_batch",
    entity: "payment_batches",
    entity_id: batchId,
    diff: { new_values: { status: "completed" } },
  })
}

/**
 * Gets all payment batches
 */
export async function getPaymentBatches(): Promise<PaymentBatch[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("payment_batches").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data
}

/**
 * Gets payment batches for a vendor
 */
export async function getVendorPaymentBatches(vendorId: string) {
  const supabase = await createClient()

  const { data: commissions } = await supabase
    .from("vendor_commissions")
    .select("*, payment_batches:payment_batch_id(*)")
    .eq("vendor_id", vendorId)
    .not("payment_batch_id", "is", null)

  if (!commissions) return []

  return commissions
}
