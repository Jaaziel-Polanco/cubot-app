import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/auth"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const supabase = await createClient()

    // Total vendors
    const { count: vendorCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "vendor")
      .eq("is_active", true)

    // Pending sales
    const { count: pendingSales } = await supabase
      .from("sales")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")

    // This month sales
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    const { data: monthSales } = await supabase
      .from("sales")
      .select("sale_price")
      .eq("status", "approved")
      .gte("sale_date", firstDayOfMonth.toISOString().split("T")[0])

    const monthRevenue = monthSales?.reduce((sum, sale) => sum + Number.parseFloat(sale.sale_price.toString()), 0) || 0

    // Pending commissions
    const { data: pendingCommissions } = await supabase
      .from("commissions")
      .select("commission_amount")
      .eq("status", "pending")

    const pendingCommissionsTotal =
      pendingCommissions?.reduce((sum, comm) => sum + Number.parseFloat(comm.commission_amount.toString()), 0) || 0

    return NextResponse.json({
      stats: {
        active_vendors: vendorCount || 0,
        pending_sales: pendingSales || 0,
        month_revenue: monthRevenue,
        pending_commissions: pendingCommissionsTotal,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
