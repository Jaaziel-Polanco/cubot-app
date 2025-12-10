import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/auth"
import { getAllBanks, createBank } from "@/lib/services/banks"

export async function GET() {
  const { error, profile } = await requireAdmin()
  if (error) return error

  try {
    const banks = await getAllBanks()
    return NextResponse.json({ banks })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { error, profile } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    
    if (!body.name || !body.code) {
      return NextResponse.json({ error: "Nombre y código son requeridos" }, { status: 400 })
    }

    const bank = await createBank({
      name: body.name,
      code: body.code,
      country: body.country,
      account_number_format: body.account_number_format,
      admin_id: profile!.id,
    })

    return NextResponse.json({ bank }, { status: 201 })
  } catch (err: any) {
    console.error("[v0] Error creating bank:", err)
    return NextResponse.json({ error: err.message || "Error al crear el banco" }, { status: 500 })
  }
}

