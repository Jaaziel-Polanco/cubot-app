import { createClient } from "@/lib/supabase/server"
import { AdminReportsContent } from "./content"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminReportsPage() {
  const supabase = await createClient()

  // Fetch all sales with related data
  const { data: sales } = await supabase
    .from("sales")
    .select("*, users!vendor_id(name, vendor_id), products(name, sku, price)")
    .order("created_at", { ascending: false })

  // Fetch all commissions
  const { data: commissions } = await supabase
    .from("commissions")
    .select("*, users!vendor_id(name, vendor_id)")
    .order("created_at", { ascending: false })

  // Fetch all payment requests
  const { data: paymentRequests } = await supabase
    .from("payment_requests")
    .select("*, users!vendor_id(name, vendor_id)")
    .order("requested_at", { ascending: false })

  // Fetch all vendors
  const { data: vendors } = await supabase
    .from("users")
    .select("*")
    .eq("role", "vendor")
    .order("created_at", { ascending: false })

  // Fetch all products
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true })

  return (
    <AdminReportsContent
      sales={sales || []}
      commissions={commissions || []}
      paymentRequests={paymentRequests || []}
      vendors={vendors || []}
      products={products || []}
    />
  )
}
