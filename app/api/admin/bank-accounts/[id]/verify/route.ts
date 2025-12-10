import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/auth"
import { verifyVendorBankAccount } from "@/lib/services/banks"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, profile } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params
    const account = await verifyVendorBankAccount(id, profile!.id)

    return NextResponse.json({ account })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

