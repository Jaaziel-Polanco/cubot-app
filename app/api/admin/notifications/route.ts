import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/auth"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const user = await requireAdmin(request)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message.includes("Unauthorized") ? 401 : 500 })
  }
}
