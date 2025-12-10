import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/auth"
import { approveSale } from "@/lib/services/validation"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, profile } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params
    const sale = await approveSale({
      sale_id: id,
      admin_id: profile!.id,
    })
    return NextResponse.json({ sale })
  } catch (err: any) {
    console.error("[v0] Error approving sale:", err)
    return NextResponse.json({ error: err.message || "Error al aprobar la venta" }, { status: 500 })
  }
}
