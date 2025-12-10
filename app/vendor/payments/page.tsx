import { createClient } from "@/lib/supabase/server"
import { VendorPaymentsContent } from "./content"

export default async function VendorPaymentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get payment batches for this vendor
  const { data: commissions } = await supabase
    .from("commissions")
    .select("payment_batch_id, commission_amount, payment_batches(*)")
    .eq("vendor_id", user.id)
    .not("payment_batch_id", "is", null)

  // Group by batch
  const batchMap = new Map()
  commissions?.forEach((c: any) => {
    if (c.payment_batches) {
      const batchId = c.payment_batch_id
      if (!batchMap.has(batchId)) {
        batchMap.set(batchId, {
          ...c.payment_batches,
          vendor_amount: 0,
          vendor_count: 0,
        })
      }
      const batch = batchMap.get(batchId)
      batch.vendor_amount += Number.parseFloat(c.commission_amount)
      batch.vendor_count++
    }
  })

  const batches = Array.from(batchMap.values())

  return (
    <VendorPaymentsContent batches={batches} />
  )
}
