import { createClient } from "@/lib/supabase/server"
import { VendorCommissionsContent } from "./content"

export default async function VendorCommissionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: commissions } = await supabase
    .from("commissions")
    .select("*, sales(sale_id), products(name, sku)")
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: false })

  const pending =
    commissions
      ?.filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + Number.parseFloat(c.commission_amount.toString()), 0) || 0

  const paid =
    commissions
      ?.filter((c) => c.status === "paid")
      .reduce((sum, c) => sum + Number.parseFloat(c.commission_amount.toString()), 0) || 0

  return (
    <VendorCommissionsContent
      commissions={commissions}
      pendingAmount={pending}
      paidAmount={paid}
    />
  )
}
