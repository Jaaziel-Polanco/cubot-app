import { NextResponse } from "next/server"
import { requireVendor } from "@/lib/middleware/auth"
import { getPrimaryBankAccount } from "@/lib/services/banks"

export async function GET() {
  const { error, profile } = await requireVendor()
  if (error) return error

  try {
    const account = await getPrimaryBankAccount(profile!.id)
    return NextResponse.json({ account })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

