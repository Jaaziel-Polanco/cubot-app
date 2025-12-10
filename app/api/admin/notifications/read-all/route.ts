import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/auth"
import { createClient } from "@/lib/supabase/server"

export async function PUT(request: Request) {
  try {
    const user = await requireAdmin(request)
    const supabase = await createClient()

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
