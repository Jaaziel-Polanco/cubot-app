import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/auth"
import { getAllProducts, createProduct } from "@/lib/services/products"

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const products = await getAllProducts()
    return NextResponse.json({ products })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { error, profile } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const product = await createProduct(body, profile!.id)
    return NextResponse.json({ product }, { status: 201 })
  } catch (err: any) {
    console.error("[v0] Error creating product:", err)
    return NextResponse.json({ error: err.message || "Error al crear el producto" }, { status: 500 })
  }
}
