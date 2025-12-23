import { createClient } from "@/lib/supabase/server"
import { AdminPaymentsContent } from "./content"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminPaymentsPage() {
  const supabase = await createClient()

  // Fetch payment requests with vendor information (pending first, then by date)
  const { data: allRequests } = await supabase
    .from("payment_requests")
    .select(`
      *, 
      users!vendor_id(name, vendor_id, phone, email),
      vendor_bank_accounts!vendor_bank_account_id(
        id,
        account_number,
        account_holder_name,
        account_type,
        banks(name)
      )
    `)
    .order("requested_at", { ascending: false })

  // Sort to put pending first
  const requests = allRequests?.sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1
    if (a.status !== "pending" && b.status === "pending") return 1
    return new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()
  })

  // Get all vendor bank accounts for vendors with pending requests
  const pendingVendorIds = requests
    ?.filter((r) => r.status === "pending")
    .map((r) => r.vendor_id) || []

  const { data: vendorBankAccounts } = pendingVendorIds.length > 0 ? await supabase
    .from("vendor_bank_accounts")
    .select("*, banks(name)")
    .in("vendor_id", pendingVendorIds) : { data: [] }

  const pendingCount = requests?.filter((r) => r.status === "pending").length || 0
  const approvedCount = requests?.filter((r) => r.status === "approved").length || 0
  const totalPending =
    requests?.filter((r) => r.status === "pending").reduce((sum, r) => sum + parseFloat(r.amount.toString()), 0) || 0

  return (
    <AdminPaymentsContent
      requests={requests || null}
      vendorBankAccounts={vendorBankAccounts}
      pendingCount={pendingCount}
      approvedCount={approvedCount}
      totalPending={totalPending}
    />
  )
}
