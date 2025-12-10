import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/auth"
import { updateBank, deleteBank } from "@/lib/services/banks"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, profile } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params
    const body = await request.json()

    if (!body.name || !body.code) {
      return NextResponse.json({ error: "Nombre y código son requeridos" }, { status: 400 })
    }

    const bank = await updateBank(
      id,
      {
        name: body.name,
        code: body.code,
        country: body.country,
        account_number_format: body.account_number_format,
        active: body.active,
      },
      profile!.id,
    )

    return NextResponse.json({ bank })
  } catch (err: any) {
    console.error("[v0] Error updating bank:", err)
    return NextResponse.json({ error: err.message || "Error al actualizar el banco" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return PUT(request, params)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, profile } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params
    await deleteBank(id, profile!.id)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[v0] Error deleting bank:", err)
    return NextResponse.json({ error: err.message || "Error al eliminar el banco" }, { status: 500 })
  }
}

