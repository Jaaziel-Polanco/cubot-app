import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/auth"
import { getPendingSales } from "@/lib/services/sales"

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const sales = await getPendingSales()
    return NextResponse.json({ sales })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
