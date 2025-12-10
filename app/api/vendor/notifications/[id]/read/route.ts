import { NextResponse } from "next/server"
import { requireVendor } from "@/lib/middleware/auth"
import { createClient } from "@/lib/supabase/server"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await requireVendor(request)
    const supabase = await createClient()

    const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id).eq("user_id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
