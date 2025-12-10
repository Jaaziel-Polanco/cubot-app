import { createClient } from "@/lib/supabase/server"
import type { Sale } from "@/lib/types"
import { generateSaleId } from "@/lib/utils/ids"
import { validateImei } from "@/lib/utils/imei"
import { checkInventoryByImei, maskImeiForLog } from "./inventory"
import { calculateRisk } from "@/lib/utils/risk"
import { createNotification } from "./notifications"
import { logAudit } from "./audit"

interface CreateSaleData {
  vendor_id: string
  product_id: string
  imei: string
  price: number
  channel: string
  sale_date: string
  evidence_url?: string
  notes?: string
  ip?: string
  user_agent?: string
}

/**
 * Creates a new sale with complete validations per spec
 */
export async function createSale(data: CreateSaleData): Promise<Sale> {
  const supabase = await createClient()

  const imeiValidation = validateImei(data.imei)
  if (!imeiValidation.valid) {
    throw new Error(imeiValidation.error || "Invalid IMEI")
  }

  const { data: approvedDuplicate } = await supabase
    .from("sales")
    .select("id, sale_id")
    .eq("imei", data.imei)
    .eq("status", "approved")
    .single()

  if (approvedDuplicate) {
    console.log(`[v0] Blocked duplicate approved IMEI: ${maskImeiForLog(data.imei)}`)
    throw new Error("This IMEI has already been approved in the system")
  }

  let inventoryMismatch = false
  try {
    const inventory = await checkInventoryByImei(data.imei)
    if (!inventory) {
      throw new Error("IMEI not found in external inventory system")
    }

    // Get product to compare model
    const { data: product } = await supabase.from("products").select("name").eq("id", data.product_id).single()

    if (product && inventory.model && !product.name.includes(inventory.model)) {
      inventoryMismatch = true
      console.log(`[v0] Model mismatch detected: ${maskImeiForLog(data.imei)}`)
    }
  } catch (error) {
    console.error("[v0] Inventory check failed:", error)
    throw new Error("Unable to verify inventory availability")
  }

  const riskLevel = await calculateRisk({
    vendorId: data.vendor_id,
    imei: data.imei,
    ip: data.ip,
  })

  // Increase risk if model mismatch
  let finalRiskLevel = riskLevel
  if (inventoryMismatch && finalRiskLevel === "low") {
    finalRiskLevel = "medium"
  } else if (inventoryMismatch && finalRiskLevel === "medium") {
    finalRiskLevel = "high"
  }

  // Generate sale ID
  const saleDate = new Date(data.sale_date)
  const { count } = await supabase
    .from("sales")
    .select("*", { count: "exact", head: true })
    .gte("sale_date", saleDate.toISOString().split("T")[0])
    .lt("sale_date", new Date(saleDate.getTime() + 86400000).toISOString().split("T")[0])

  const sale_id = generateSaleId(saleDate, count || 0)

  // Create sale with risk level
  const { data: sale, error } = await supabase
    .from("sales")
    .insert({
      sale_id,
      vendor_id: data.vendor_id,
      product_id: data.product_id,
      imei: data.imei,
      price: data.price,
      channel: data.channel,
      sale_date: data.sale_date,
      evidence_url: data.evidence_url,
      notes: data.notes,
      ip: data.ip,
      user_agent: data.user_agent,
      status: "pending",
      risk_level: finalRiskLevel,
      commission_amount: 0, // Will be calculated on approval
    })
    .select()
    .single()

  if (error) throw error

  console.log(`[v0] Sale created: ${sale_id}, Risk: ${finalRiskLevel}, IMEI: ${maskImeiForLog(data.imei)}`)

  const { data: staff } = await supabase.from("users").select("id").in("role", ["admin", "validator"])

  if (staff) {
    for (const user of staff) {
      await createNotification({
        user_id: user.id,
        title: "New sale pending validation",
        message: `Sale ${sale_id} requires validation (Risk: ${finalRiskLevel})`,
        type: "sale_pending",
        metadata: { sale_id: sale.id, risk_level: finalRiskLevel },
      })
    }
  }

  // Log audit (don't fail if audit fails)
  try {
    await logAudit({
      actor_id: data.vendor_id,
      action: "create_sale",
      entity: "sales",
      entity_id: sale.id,
      diff: { new_values: sale },
    })
  } catch (auditError) {
    console.warn("[v0] Failed to log audit for sale creation, continuing:", auditError)
  }

  return sale
}

/**
 * Gets sales for a vendor
 */
export async function getVendorSales(vendorId: string): Promise<Sale[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

/**
 * Gets all sales (admin only)
 */
export async function getAllSales(filters?: {
  status?: string
  vendor_id?: string
  date_from?: string
  date_to?: string
}): Promise<Sale[]> {
  const supabase = await createClient()

  let query = supabase.from("sales").select("*").order("created_at", { ascending: false })

  if (filters?.status) {
    query = query.eq("status", filters.status)
  }
  if (filters?.vendor_id) {
    query = query.eq("vendor_id", filters.vendor_id)
  }
  if (filters?.date_from) {
    query = query.gte("sale_date", filters.date_from)
  }
  if (filters?.date_to) {
    query = query.lte("sale_date", filters.date_to)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

/**
 * Gets pending sales for validation
 */
export async function getPendingSales(): Promise<Sale[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })

  if (error) throw error
  return data
}
