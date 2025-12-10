import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/auth"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const { error, profile } = await requireAdmin()
  if (error) return error

  try {
    const supabase = await createClient()
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })

    if (usersError) throw usersError

    return NextResponse.json({ users })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { error, profile } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const supabase = await createClient()

    // Normalize field names to match schema
    const normalizedBody: any = { ...body }
    
    // Map full_name to name
    if (normalizedBody.full_name !== undefined) {
      normalizedBody.name = normalizedBody.full_name
      delete normalizedBody.full_name
    }
    
    // Map is_active to status
    if (normalizedBody.is_active !== undefined) {
      normalizedBody.status = normalizedBody.is_active ? "active" : "suspended"
      delete normalizedBody.is_active
    }

    // This endpoint is for updating user metadata
    // Actual user creation happens via auth sign-up
    const { data, error: updateError } = await supabase.from("users").upsert(normalizedBody).select().single()

    if (updateError) throw updateError

    return NextResponse.json({ user: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
