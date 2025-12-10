import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/auth"
import { updateUserStatus } from "@/lib/services/users"

async function handleUserUpdate(request: NextRequest, params: Promise<{ id: string }>) {
  const { error, profile } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params
    const body = await request.json()

    // Normalize is_active to status
    let isActive: boolean | undefined
    if (body.is_active !== undefined) {
      isActive = body.is_active
    } else if (body.status !== undefined) {
      isActive = body.status === "active"
    }

    if (isActive !== undefined) {
      await updateUserStatus(id, isActive, profile!.id)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[v0] Error updating user:", err)
    return NextResponse.json({ error: err.message || "Error al actualizar el usuario" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleUserUpdate(request, params)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleUserUpdate(request, params)
}
