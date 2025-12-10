import { NextResponse } from "next/server"
import { requireVendor } from "@/lib/middleware/auth"
import { getVendorCommissions, getVendorCommissionSummary } from "@/lib/services/commissions"

export async function GET() {
  const { error, profile } = await requireVendor()
  if (error) return error

  try {
    const [commissions, summary] = await Promise.all([
      getVendorCommissions(profile!.id),
      getVendorCommissionSummary(profile!.id),
    ])

    return NextResponse.json({ commissions, summary })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
