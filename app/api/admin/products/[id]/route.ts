import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/auth"
import { updateProduct } from "@/lib/services/products"
import { createClient } from "@/lib/supabase/server"

async function handleUpdate(request: NextRequest, params: Promise<{ id: string }>) {
  const { error, profile } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params
    const body = await request.json()
    const product = await updateProduct(id, body, profile!.id)
    return NextResponse.json({ product })
  } catch (err: any) {
    console.error("[v0] Error updating product:", err)
    return NextResponse.json({ error: err.message || "Error al actualizar el producto" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleUpdate(request, params)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, profile } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { error: deleteError } = await supabase.from("products").delete().eq("id", id)
    
    if (deleteError) {
      console.error("[v0] Error deleting product:", deleteError)
      throw new Error(`Error al eliminar producto: ${deleteError.message}`)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[v0] Error deleting product:", err)
    return NextResponse.json({ error: err.message || "Error al eliminar el producto" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleUpdate(request, params)
}
