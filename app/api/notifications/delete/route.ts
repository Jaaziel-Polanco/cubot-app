import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest) {
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

        // Delete notification
        const { error } = await supabase
            .from("notifications")
            .delete()
            .eq("id", notificationId)
            .eq("user_id", user.id) // Ensure user owns the notification

        if (error) {
            console.error("Error deleting notification:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error in delete notification API:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
