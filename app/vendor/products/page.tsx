import { createClient } from "@/lib/supabase/server"
import { VendorProductsContent } from "./content"

export default async function VendorProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase.from("products").select("*").eq("active", true).order("name")

  return <VendorProductsContent products={products} />
}
