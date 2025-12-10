import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/auth"
import { rejectSale } from "@/lib/services/validation"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, profile } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params
    const body = await request.json()
    const { reason } = body

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "La razón de rechazo es requerida" }, { status: 400 })
    }

    const sale = await rejectSale({
      sale_id: id,
      admin_id: profile!.id,
      reason: reason.trim(),
    })
    return NextResponse.json({ sale })
  } catch (err: any) {
    console.error("[v0] Error rejecting sale:", err)
    return NextResponse.json({ error: err.message || "Error al rechazar la venta" }, { status: 500 })
  }
}
