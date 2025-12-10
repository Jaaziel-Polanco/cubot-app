import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/auth"
import { getAuditLogs } from "@/lib/services/audit"

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const searchParams = request.nextUrl.searchParams
    const filters = {
      user_id: searchParams.get("user_id") || undefined,
      entity_type: searchParams.get("entity_type") || undefined,
      entity_id: searchParams.get("entity_id") || undefined,
      date_from: searchParams.get("date_from") || undefined,
      date_to: searchParams.get("date_to") || undefined,
      limit: Number.parseInt(searchParams.get("limit") || "100"),
    }

    const logs = await getAuditLogs(filters)
    return NextResponse.json({ logs })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
