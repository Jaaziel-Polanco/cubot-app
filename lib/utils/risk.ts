import { createClient } from "@/lib/supabase/server"
import type { InventoryCheckResult } from "@/lib/types"

export type RiskLevel = "low" | "medium" | "high"

export interface RiskAnalysis {
  level: RiskLevel
  reasons: string[]
  score: number
  factors: {
    duplicateImei: boolean
    vendorRejectionRate: number
    recentRejections: number
    frequencyAnomaly: boolean
    ipAnomaly: boolean
    inventoryMismatch: boolean
  }
}

interface CalculateRiskParams {
  imei: string
  vendorId: string
  ip?: string
  inventoryResult?: InventoryCheckResult | null
  selectedProduct?: { name: string; category: string }
}

/**
 * Analyzes risk for a sale based on multiple factors
 */
export async function calculateRisk(params: CalculateRiskParams): Promise<RiskLevel> {
  const supabase = await createClient()
  const reasons: string[] = []
  let score = 0

  // 1. Inventory Mismatch (High Risk)
  let inventoryMismatch = false
  if (params.inventoryResult && params.selectedProduct) {
    // Simple string inclusion check (e.g. "CUBOT X90" vs "X90")
    const invModel = params.inventoryResult.model.toLowerCase()
    const prodName = params.selectedProduct.name.toLowerCase()

    if (!prodName.includes(invModel) && !invModel.includes(prodName)) {
      score += 60
      reasons.push(`Model mismatch: Selected ${params.selectedProduct.name} but Inventory says ${params.inventoryResult.model}`)
      inventoryMismatch = true
    }
  }

  // 2. Check for duplicate IMEI attempts
  const { data: existingSales } = await supabase.from("sales").select("status").eq("imei", params.imei)

  const duplicateImei = existingSales && existingSales.length > 0
  if (duplicateImei) {
    score += 30
    reasons.push("Duplicate IMEI found in system")
  }

  // 3. Check vendor rejection rate (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: recentSales } = await supabase
    .from("sales")
    .select("status")
    .eq("vendor_id", params.vendorId)
    .gte("created_at", thirtyDaysAgo.toISOString())

  const totalRecent = recentSales?.length || 0
  const recentRejections = recentSales?.filter((s) => s.status === "rejected").length || 0
  const vendorRejectionRate = totalRecent > 0 ? (recentRejections / totalRecent) * 100 : 0

  if (vendorRejectionRate > 50) {
    score += 40
    reasons.push(`High rejection rate: ${vendorRejectionRate.toFixed(1)}%`)
  } else if (vendorRejectionRate > 30) {
    score += 20
    reasons.push(`Elevated rejection rate: ${vendorRejectionRate.toFixed(1)}%`)
  }

  // 4. Check frequency anomaly (more than 10 sales in last 24h)
  const yesterday = new Date()
  yesterday.setHours(yesterday.getHours() - 24)

  const { data: last24h } = await supabase
    .from("sales")
    .select("id")
    .eq("vendor_id", params.vendorId)
    .gte("created_at", yesterday.toISOString())

  const frequencyAnomaly = (last24h?.length || 0) > 10
  if (frequencyAnomaly) {
    score += 15
    reasons.push("Unusual sales frequency detected")
  }

  // Determine risk level based on score
  let level: RiskLevel = "low"
  if (score >= 50) {
    level = "high"
  } else if (score >= 25) {
    level = "medium"
  }

  return level
}
