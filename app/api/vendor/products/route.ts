import { NextResponse } from "next/server"
import { requireVendor } from "@/lib/middleware/auth"
import { getActiveProducts } from "@/lib/services/products"

export async function GET() {
  const { error } = await requireVendor()
  if (error) return error

  try {
    const products = await getActiveProducts()
    return NextResponse.json({ products })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
