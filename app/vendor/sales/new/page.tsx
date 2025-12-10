import { createClient } from "@/lib/supabase/server"
import SaleForm from "./sale-form"

export default async function NewSalePage() {
  const supabase = await createClient()

  const { data: products, error } = await supabase.from("products").select("*").eq("active", true).order("name")

  if (error) {
    console.error("Error fetching products:", error)
  }

  console.log("Products fetched:", products?.length || 0)

  return (
    <SaleForm products={products || []} />
  )
}
