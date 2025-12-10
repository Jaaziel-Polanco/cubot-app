import { createClient } from "@/lib/supabase/server"
import { AdminSalesContent } from "./content"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminSalesPage() {
  const supabase = await createClient()

  const { data: sales } = await supabase
    .from("sales")
    .select("*, users!vendor_id(name, vendor_id), products(name, sku)")
    .order("created_at", { ascending: false })
    .limit(100)

  return <AdminSalesContent sales={sales || []} />
}
