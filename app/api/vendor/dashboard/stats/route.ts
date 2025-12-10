import { NextResponse } from "next/server"
import { requireVendor } from "@/lib/middleware/auth"
import { createClient } from "@/lib/supabase/server"
import { getVendorCommissionSummary } from "@/lib/services/commissions"

export async function GET() {
  const { error, profile } = await requireVendor()
  if (error) return error

  try {
    const supabase = await createClient()

    // Total sales count
    const { count: totalSales } = await supabase
      .from("sales")
      .select("*", { count: "exact", head: true })
      .eq("vendor_id", profile!.id)

    // Pending sales
    const { count: pendingSales } = await supabase
      .from("sales")
      .select("*", { count: "exact", head: true })
      .eq("vendor_id", profile!.id)
      .eq("status", "pending")

    // Approved sales this month
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    const { count: monthSales } = await supabase
      .from("sales")
      .select("*", { count: "exact", head: true })
      .eq("vendor_id", profile!.id)
      .eq("status", "approved")
      .gte("sale_date", firstDayOfMonth.toISOString().split("T")[0])

    // Commission summary
    const commissionSummary = await getVendorCommissionSummary(profile!.id)

    return NextResponse.json({
      stats: {
        total_sales: totalSales || 0,
        pending_sales: pendingSales || 0,
        month_sales: monthSales || 0,
        total_earned: commissionSummary.total_earned,
        pending_commissions: commissionSummary.pending,
        paid_commissions: commissionSummary.paid,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
