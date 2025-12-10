import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/auth"
import { createPaymentBatch, getPaymentBatches } from "@/lib/services/payments"

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const batches = await getPaymentBatches()
    return NextResponse.json({ batches })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { error, profile } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { commission_ids } = body

    if (!commission_ids || commission_ids.length === 0) {
      return NextResponse.json({ error: "No commissions selected" }, { status: 400 })
    }

    const batch = await createPaymentBatch({
      admin_id: profile!.id,
      commission_ids,
    })

    return NextResponse.json({ batch })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
