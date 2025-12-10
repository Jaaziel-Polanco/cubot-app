import { createClient } from "@/lib/supabase/server"
import { AdminDashboardContent } from "./content"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Get active vendors count
  const { count: activeVendorsCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "vendor")
    .eq("status", "active")

  // Get pending sales count
  const { count: pendingSalesCount } = await supabase
    .from("sales")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  // Get month sales for revenue calculation
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const { data: monthSales } = await supabase
    .from("sales")
    .select("sale_price")
    .eq("status", "approved")
    .gte("sale_date", startOfMonth)

  // Get pending commissions total
  const { data: pendingCommissions } = await supabase
    .from("commissions")
    .select("commission_amount")
    .eq("status", "pending")

  const activeVendors = activeVendorsCount || 0
  const pendingSales = pendingSalesCount || 0
  const monthRevenue = monthSales?.reduce((sum, sale) => sum + (parseFloat(sale.sale_price) || 0), 0) || 0
  const pendingCommissionsTotal = pendingCommissions?.reduce((sum, comm) => sum + (parseFloat(comm.commission_amount) || 0), 0) || 0

  return (
    <AdminDashboardContent
      activeVendorsCount={activeVendors}
      pendingSalesCount={pendingSales}
      monthRevenue={monthRevenue}
      pendingCommissionsTotal={pendingCommissionsTotal}
    />
  )
}
