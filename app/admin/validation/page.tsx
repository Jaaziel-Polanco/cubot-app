import { createClient } from "@/lib/supabase/server"
import { AdminValidationContent } from "./content"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminValidationPage() {
  const supabase = await createClient()

  const { data: sales } = await supabase
    .from("sales")
    .select("*, users!vendor_id(name, vendor_id), products(name, sku)")
    .eq("status", "pending")
    .order("created_at", { ascending: true })

  return <AdminValidationContent pendingSales={sales || []} />
}
