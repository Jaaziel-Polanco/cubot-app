import { createClient } from "@/lib/supabase/server"
import { AdminSalesContent } from "./content"

export default async function AdminSalesPage() {
  const supabase = await createClient()

  const { data: sales } = await supabase
    .from("sales")
    .select("*, users(name, vendor_id), products(name, sku)")
    .order("created_at", { ascending: false })
    .limit(100)

  return <AdminSalesContent sales={sales || []} />
}
