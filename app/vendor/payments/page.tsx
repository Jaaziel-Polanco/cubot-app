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

  // Get payment requests (bank account info will show after migration)
  const { data: paymentRequests } = await supabase
    .from("payment_requests")
    .select("*")
    .eq("vendor_id", user.id)
    .order("requested_at", { ascending: false })

  return (
    <VendorPaymentsContent requests={paymentRequests} />
  )
}
