import { createClient } from "@/lib/supabase/server"
import { VendorDashboardContent } from "./content"

export default async function VendorDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: totalSales } = await supabase
    .from("sales")
    .select("*", { count: "exact", head: true })
    .eq("vendor_id", user?.id)

  const { data: pendingSales } = await supabase
    .from("sales")
    .select("*", { count: "exact", head: true })
    .eq("vendor_id", user?.id)
    .eq("status", "pending")

  const { data: monthSales } = await supabase
    .from("sales")
    .select("*", { count: "exact", head: true })
    .eq("vendor_id", user?.id)
    .gte("sale_date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

  const { data: commissions } = await supabase.from("commissions").select("commission_amount, status").eq("vendor_id", user?.id)

  const totalEarned = commissions?.reduce((sum, comm) => sum + (comm.commission_amount || 0), 0) || 0
  const pendingCommissions =
    commissions?.filter((c) => c.status === "pending").reduce((sum, comm) => sum + (comm.commission_amount || 0), 0) || 0
  const paidCommissions =
    commissions?.filter((c) => c.status === "paid").reduce((sum, comm) => sum + (comm.commission_amount || 0), 0) || 0

  return (
    <VendorDashboardContent
      totalSalesCount={totalSales?.length || 0}
      pendingSalesCount={pendingSales?.length || 0}
      monthSalesCount={monthSales?.length || 0}
      totalEarned={totalEarned}
      pendingCommissionsAmount={pendingCommissions}
      paidCommissionsAmount={paidCommissions}
    />
  )
}
