import { createClient } from "@/lib/supabase/server"
import { VendorPaymentsContent } from "./content"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function VendorPaymentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get payment requests with bank account info
  const { data: paymentRequests } = await supabase
    .from("payment_requests")
    .select(`
      *,
      vendor_bank_accounts!vendor_bank_account_id(
        id,
        account_number,
        account_holder_name,
        account_type,
        banks(name)
      )
    `)
    .eq("vendor_id", user.id)
    .order("requested_at", { ascending: false })

  return (
    <VendorPaymentsContent requests={paymentRequests} />
  )
}
