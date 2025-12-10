import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/auth"
import { getAllSales, createSale } from "@/lib/services/sales"

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const searchParams = request.nextUrl.searchParams
    const filters = {
      status: searchParams.get("status") || undefined,
      vendor_id: searchParams.get("vendor_id") || undefined,
      date_from: searchParams.get("date_from") || undefined,
      date_to: searchParams.get("date_to") || undefined,
    }

    const sales = await getAllSales(filters)
    return NextResponse.json({ sales })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { error, profile } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const sale = await createSale(body)
    return NextResponse.json({ sale }, { status: 201 })
  } catch (err: any) {
    console.error("[v0] Error creating sale:", err)
    return NextResponse.json({ error: err.message || "Error al crear la venta" }, { status: 500 })
  }
}
