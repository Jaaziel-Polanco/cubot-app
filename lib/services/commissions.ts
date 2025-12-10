import { createClient } from "@/lib/supabase/server"
import type { Commission, VendorCommissionSummary } from "@/lib/types"
import { calculateCommission } from "@/lib/utils/commission"

interface CreateCommissionData {
  sale_id: string
  vendor_id: string
  product_id: string
  sale_price: number
}

/**
 * Creates a commission for an approved sale
 */
export async function createCommission(data: CreateCommissionData): Promise<Commission> {
  const supabase = await createClient()

  // Get product details for commission calculation
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", data.product_id)
    .single()

  if (productError || !product) throw new Error("Product not found")

  const commissionAmount = calculateCommission(product, data.sale_price)

  // Get sale UUID from sale_id
  const { data: sale } = await supabase.from("sales").select("id").eq("sale_id", data.sale_id).single()
  if (!sale) throw new Error("Sale not found")

  // Create commission
  const { data: commission, error } = await supabase
    .from("commissions")
    .insert({
      sale_id: sale.id,
      vendor_id: data.vendor_id,
      product_id: data.product_id,
      base_amount: data.sale_price,
      commission_amount: commissionAmount,
      status: "pending",
    })
    .select()
    .single()

  if (error) throw error

  return commission
}

/**
 * Gets vendor commissions
 */
export async function getVendorCommissions(vendorId: string): Promise<Commission[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("commissions")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

/**
 * Gets all pending commissions grouped by vendor
 */
export async function getPendingCommissionsByVendor() {
  const supabase = await createClient()

  const { data: commissions, error } = await supabase
    .from("commissions")
    .select("*, users(name, vendor_id, bank_account)")
    .eq("status", "pending")
    .is("payment_batch_id", null)

  if (error) throw error

  // Group by vendor
  const grouped = commissions.reduce((acc: Record<string, VendorCommissionSummary>, comm: Commission & { users: { name: string; vendor_id: string | null; bank_account: string | null } }) => {
    const vendorId = comm.vendor_id
    if (!acc[vendorId]) {
      acc[vendorId] = {
        vendor_id: vendorId,
        vendor_name: comm.users.name,
        vendor_code: comm.users.vendor_id,
        bank_account: comm.users.bank_account,
        commissions: [],
        total: 0,
      }
    }
    acc[vendorId].commissions.push(comm)
    acc[vendorId].total += comm.commission_amount
    return acc
  }, {})

  return Object.values(grouped)
}

/**
 * Gets commission summary for a vendor
 */
export async function getVendorCommissionSummary(vendorId: string) {
  const supabase = await createClient()

  const { data: commissions } = await supabase.from("commissions").select("*").eq("vendor_id", vendorId)

  if (!commissions) {
    return {
      total_earned: 0,
      pending: 0,
      paid: 0,
      count: 0,
    }
  }

  const pending = commissions
    .filter((c) => c.status === "pending")
    .reduce((sum, c) => sum + Number.parseFloat(c.commission_amount.toString()), 0)

  const paid = commissions
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + Number.parseFloat(c.commission_amount.toString()), 0)

  return {
    total_earned: pending + paid,
    pending,
    paid,
    count: commissions.length,
  }
}
/**
 * Generates a commission statement for a vendor (Atomic Transaction)
 */
export async function generateCommissionStatement(vendorId: string, startDate: string, endDate: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("generate_vendor_statement", {
    p_vendor_id: vendorId,
    p_start_date: startDate,
    p_end_date: endDate,
  })

  if (error) throw error
  return data
}
