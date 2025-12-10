import { createClient } from "@/lib/supabase/server"
import { AdminPaymentsContent } from "./content"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminPaymentsPage() {
  const supabase = await createClient()

  // Fetch payment requests with vendor information
  const { data: requests } = await supabase
    .from("payment_requests")
    .select("*, users!vendor_id(name, vendor_id, bank_account)")
    .order("requested_at", { ascending: true })

  const pendingCount = requests?.filter((r) => r.status === "pending").length || 0
  const approvedCount = requests?.filter((r) => r.status === "approved").length || 0
  const totalPending =
    requests?.filter((r) => r.status === "pending").reduce((sum, r) => sum + parseFloat(r.amount.toString()), 0) || 0

  return (
    <AdminPaymentsContent
      requests={requests}
      pendingCount={pendingCount}
      approvedCount={approvedCount}
      totalPending={totalPending}
    />
  )
}
