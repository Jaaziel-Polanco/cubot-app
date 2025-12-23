import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { notificationId } = await request.json()

        if (!notificationId) {
            return NextResponse.json({ error: "Notification ID required" }, { status: 400 })
        }

        // Update notification as read
        const { error } = await supabase
            .from("notifications")
            .update({ read: true })
            .eq("id", notificationId)
            .eq("user_id", user.id) // Ensure user owns the notification

        if (error) {
            console.error("Error marking notification as read:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error in mark-read API:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
