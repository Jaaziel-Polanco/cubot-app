import { type NextRequest, NextResponse } from "next/server"
import { requireVendor } from "@/lib/middleware/auth"
import { createSale, getVendorSales } from "@/lib/services/sales"

export async function GET() {
  const { error, profile } = await requireVendor()
  if (error) return error

  try {
    const sales = await getVendorSales(profile!.id)
    return NextResponse.json({ sales })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { error, profile } = await requireVendor()
  if (error) return error

  try {
    const body = await request.json()

    // Ensure vendor can only create sales for themselves
    const saleData = {
      ...body,
      vendor_id: profile!.id,
    }

    const sale = await createSale(saleData)
    return NextResponse.json({ sale }, { status: 201 })
  } catch (err: any) {
    console.error("[v0] Error creating vendor sale:", err)
    return NextResponse.json({ error: err.message || "Error al crear la venta" }, { status: 500 })
  }
}
