import { createClient } from "@/lib/supabase/server"
import type { Sale } from "@/lib/types"
import { createNotification } from "./notifications"
import { logAudit } from "./audit"

interface ApproveSaleData {
  sale_id: string
  admin_id: string
}

interface RejectSaleData {
  sale_id: string
  admin_id: string
  reason: string
}

/**
 * Approves a sale, calculates commission, and updates vendor_commissions for period
 */
export async function approveSale(data: ApproveSaleData): Promise<Sale> {
  const supabase = await createClient()

  // Get sale details with product
  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .select("*, products(*)")
    .eq("id", data.sale_id)
    .single()

  if (saleError || !sale) throw new Error("Sale not found")

  if (sale.status !== "pending") {
    throw new Error("Sale is not pending validation")
  }

  // Calculate commission based on product scheme
  let commissionAmount = 0
  if (sale.products.commission_percent > 0) {
    commissionAmount = (sale.price * sale.products.commission_percent) / 100
  } else if (sale.products.commission_amount > 0) {
    commissionAmount = sale.products.commission_amount
  }

  // Update sale status with commission
  const { data: updatedSale, error: updateError } = await supabase
    .from("sales")
    .update({
      status: "approved",
      commission_amount: commissionAmount,
      validated_at: new Date().toISOString(),
      validated_by: data.admin_id,
    })
    .eq("id", data.sale_id)
    .select()
    .single()

  if (updateError) throw updateError

  // Update or create vendor_commissions for current period
  await updateVendorCommissions(sale.vendor_id, sale.sale_date, commissionAmount, sale.price)

  // Notify vendor
  await createNotification({
    user_id: sale.vendor_id,
    title: "Sale approved!",
    message: `Your sale ${sale.sale_id} has been approved. Commission: $${commissionAmount.toFixed(2)}`,
    type: "sale_approved",
    metadata: { sale_id: data.sale_id, commission: commissionAmount },
  })

  // Log audit (don't fail if audit fails)
  try {
    await logAudit({
      actor_id: data.admin_id,
      action: "approve_sale",
      entity: "sales",
      entity_id: data.sale_id,
      diff: {
        old_values: { status: "pending" },
        new_values: { status: "approved", commission_amount: commissionAmount },
      },
    })
  } catch (auditError) {
    console.warn("[v0] Failed to log audit for sale approval, continuing:", auditError)
  }

  return updatedSale
}

/**
 * Rejects a sale
 */
export async function rejectSale(data: RejectSaleData): Promise<Sale> {
  const supabase = await createClient()

  const { data: sale, error: saleError } = await supabase.from("sales").select("*").eq("id", data.sale_id).single()

  if (saleError || !sale) throw new Error("Sale not found")

  if (sale.status !== "pending") {
    throw new Error("Sale is not pending validation")
  }

  // Update sale status
  const { data: updatedSale, error: updateError } = await supabase
    .from("sales")
    .update({
      status: "rejected",
      rejection_reason: data.reason,
      validated_at: new Date().toISOString(),
      validated_by: data.admin_id,
    })
    .eq("id", data.sale_id)
    .select()
    .single()

  if (updateError) throw updateError

  // Notify vendor
  await createNotification({
    user_id: sale.vendor_id,
    title: "Sale rejected",
    message: `Your sale ${sale.sale_id} was rejected. Reason: ${data.reason}`,
    type: "sale_rejected",
    metadata: { sale_id: data.sale_id, reason: data.reason },
  })

  // Log audit (don't fail if audit fails)
  try {
    await logAudit({
      actor_id: data.admin_id,
      action: "reject_sale",
      entity: "sales",
      entity_id: data.sale_id,
      diff: {
        old_values: { status: "pending" },
        new_values: { status: "rejected", rejection_reason: data.reason },
      },
    })
  } catch (auditError) {
    console.warn("[v0] Failed to log audit for sale rejection, continuing:", auditError)
  }

  return updatedSale
}

/**
 * Updates vendor_commissions aggregation for the period containing the sale date
 */
async function updateVendorCommissions(
  vendorId: string,
  saleDate: string,
  commissionAmount: number,
  saleAmount: number,
) {
  const supabase = await createClient()

  // Determine period (using monthly for now, can be configured)
  const date = new Date(saleDate)
  const periodStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split("T")[0]
  const periodEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split("T")[0]

  // Check if period record exists
  const { data: existing } = await supabase
    .from("vendor_commissions")
    .select("*")
    .eq("vendor_id", vendorId)
    .eq("period_start", periodStart)
    .eq("period_end", periodEnd)
    .single()

  if (existing) {
    // Update existing
    await supabase
      .from("vendor_commissions")
      .update({
        total_sales: existing.total_sales + 1,
        total_sales_amount: Number(existing.total_sales_amount) + saleAmount,
        total_commissions: Number(existing.total_commissions) + commissionAmount,
      })
      .eq("id", existing.id)
  } else {
    // Create new
    await supabase.from("vendor_commissions").insert({
      vendor_id: vendorId,
      period_start: periodStart,
      period_end: periodEnd,
      total_sales: 1,
      total_sales_amount: saleAmount,
      total_commissions: commissionAmount,
      bonuses: 0,
      status: "pending",
    })
  }
}

/**
 * Recalculates commissions for a specific period
 */
export async function recalculateCommissionsForPeriod(periodStart: string, periodEnd: string) {
  const supabase = await createClient()

  // Get all approved sales in period
  const { data: sales } = await supabase
    .from("sales")
    .select("vendor_id, price, commission_amount")
    .eq("status", "approved")
    .gte("sale_date", periodStart)
    .lte("sale_date", periodEnd)

  if (!sales || sales.length === 0) return

  // Group by vendor
  const vendorTotals = sales.reduce((acc: Record<string, any>, sale) => {
    if (!acc[sale.vendor_id]) {
      acc[sale.vendor_id] = {
        total_sales: 0,
        total_sales_amount: 0,
        total_commissions: 0,
      }
    }
    acc[sale.vendor_id].total_sales += 1
    acc[sale.vendor_id].total_sales_amount += Number(sale.price)
    acc[sale.vendor_id].total_commissions += Number(sale.commission_amount)
    return acc
  }, {})

  // Upsert vendor_commissions
  for (const [vendorId, totals] of Object.entries(vendorTotals)) {
    await supabase.from("vendor_commissions").upsert(
      {
        vendor_id: vendorId,
        period_start: periodStart,
        period_end: periodEnd,
        ...totals,
        status: "pending",
      },
      {
        onConflict: "vendor_id,period_start,period_end",
      },
    )
  }
}

/**
 * Gets risk analysis for a vendor (last 30 days)
 */
export async function getVendorRiskAnalysis(vendorId: string) {
  const supabase = await createClient()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: sales } = await supabase
    .from("sales")
    .select("*")
    .eq("vendor_id", vendorId)
    .gte("created_at", thirtyDaysAgo.toISOString())

  if (!sales || sales.length === 0) {
    return {
      total_sales: 0,
      rejected_count: 0,
      rejection_rate: 0,
      duplicate_attempts: 0,
      risk_level: "low",
    }
  }

  const rejectedCount = sales.filter((s) => s.status === "rejected").length
  const rejectionRate = (rejectedCount / sales.length) * 100

  // Check for duplicate IMEI attempts
  const imeis = sales.map((s) => s.imei)
  const duplicateAttempts = imeis.length - new Set(imeis).size

  let riskLevel = "low"
  if (rejectionRate > 50 || duplicateAttempts > 5) {
    riskLevel = "high"
  } else if (rejectionRate > 30 || duplicateAttempts > 2) {
    riskLevel = "medium"
  }

  return {
    total_sales: sales.length,
    rejected_count: rejectedCount,
    rejection_rate: rejectionRate,
    duplicate_attempts: duplicateAttempts,
    risk_level: riskLevel,
  }
}
