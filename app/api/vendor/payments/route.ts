import { NextResponse } from "next/server"
import { requireVendor } from "@/lib/middleware/auth"
import { getVendorPaymentBatches } from "@/lib/services/payments"

export async function GET() {
  const { error, profile } = await requireVendor()
  if (error) return error

  try {
    const batches = await getVendorPaymentBatches(profile!.id)
    return NextResponse.json({ batches })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
