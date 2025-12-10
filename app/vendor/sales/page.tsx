import { createClient } from "@/lib/supabase/server"
import { VendorSalesContent } from "./content"

export default async function VendorSalesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: sales } = await supabase
    .from("sales")
    .select("*, products(name, sku)")
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <VendorSalesContent sales={sales} />
  )
}
