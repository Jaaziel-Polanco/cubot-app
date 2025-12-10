import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/auth"
import { approveVendorKyc, rejectVendorKyc } from "@/lib/services/kyc"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, profile } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params
    const body = await request.json()
    const { action, reason, document_ids } = body

    if (action === "approve") {
      const user = await approveVendorKyc(id, profile!.id, document_ids)
      return NextResponse.json({ user, message: "KYC aprobado exitosamente" })
    } else if (action === "reject") {
      if (!reason || !reason.trim()) {
        return NextResponse.json({ error: "Se requiere una razón para rechazar" }, { status: 400 })
      }
      const user = await rejectVendorKyc(id, profile!.id, reason, document_ids)
      return NextResponse.json({ user, message: "KYC rechazado" })
    } else {
      return NextResponse.json({ error: "Acción inválida" }, { status: 400 })
    }
  } catch (err: any) {
    console.error("[v0] Error updating KYC status:", err)
    return NextResponse.json({ error: err.message || "Error al actualizar estado KYC" }, { status: 500 })
  }
}

