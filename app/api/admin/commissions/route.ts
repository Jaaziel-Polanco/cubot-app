import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/auth"
import { getPendingCommissionsByVendor } from "@/lib/services/commissions"

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const commissions = await getPendingCommissionsByVendor()
    return NextResponse.json({ commissions })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
