import { type NextRequest, NextResponse } from "next/server"
import { requireVendor } from "@/lib/middleware/auth"
import { getUserById, upsertUserProfile } from "@/lib/services/users"

export async function GET() {
  const { error, profile } = await requireVendor()
  if (error) return error

  try {
    const userProfile = await getUserById(profile!.id)
    return NextResponse.json({ profile: userProfile })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const { error, profile } = await requireVendor()
  if (error) return error

  try {
    const body = await request.json()

    // Vendors can only update specific fields
    // Map full_name to name (database field)
    const updates: Record<string, any> = {}
    
    if (body.full_name !== undefined) {
      updates.name = body.full_name
    }
    if (body.phone !== undefined) {
      updates.phone = body.phone
    }
    if (body.identification_number !== undefined) {
      updates.identification_number = body.identification_number
    }
    if (body.address !== undefined) {
      updates.address = body.address
    }
    if (body.city !== undefined) {
      updates.city = body.city
    }
    if (body.state !== undefined) {
      updates.state = body.state
    }
    if (body.postal_code !== undefined) {
      updates.postal_code = body.postal_code
    }
    if (body.country !== undefined) {
      updates.country = body.country
    }
    if (body.bank_account !== undefined) {
      updates.bank_account = body.bank_account
    }

    // Validate that updates object is not empty
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    const updatedProfile = await upsertUserProfile(profile!.id, updates)
    return NextResponse.json({ profile: updatedProfile })
  } catch (err: any) {
    console.error("[v0] Error updating vendor profile:", err)
    return NextResponse.json({ error: err.message || "Error al actualizar el perfil" }, { status: 500 })
  }
}
