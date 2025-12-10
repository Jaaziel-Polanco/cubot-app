import { createClient } from "@/lib/supabase/server"
import { AdminValidationContent } from "./content"

export default async function AdminValidationPage() {
  const supabase = await createClient()

  const { data: sales } = await supabase
    .from("sales")
    .select("*, users(name, vendor_id), products(name, sku)")
    .eq("status", "pending")
    .order("created_at", { ascending: true })

  return <AdminValidationContent pendingSales={sales || []} />
}
