import { NextResponse } from "next/server"
import { getActiveBanks } from "@/lib/services/banks"

/**
 * Public endpoint to get active banks (used by vendor registration form)
 */
export async function GET() {
  try {
    const banks = await getActiveBanks()
    return NextResponse.json({ banks })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

