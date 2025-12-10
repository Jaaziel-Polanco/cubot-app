import { type NextRequest, NextResponse } from "next/server"
import { requireVendor } from "@/lib/middleware/auth"
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
} from "@/lib/services/notifications"

export async function GET(request: NextRequest) {
  const { error, profile } = await requireVendor()
  if (error) return error

  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get("action")

    if (action === "unread_count") {
      const count = await getUnreadCount(profile!.id)
      return NextResponse.json({ count })
    }

    const notifications = await getUserNotifications(profile!.id)
    return NextResponse.json({ notifications })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const { error, profile } = await requireVendor()
  if (error) return error

  try {
    const body = await request.json()
    const { notification_id, mark_all_read } = body

    if (mark_all_read) {
      await markAllNotificationsRead(profile!.id)
    } else if (notification_id) {
      await markNotificationRead(notification_id)
    } else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
