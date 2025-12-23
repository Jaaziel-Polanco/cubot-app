import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { VendorNotificationsContent } from "./content"

export default async function VendorNotificationsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Verify vendor role
    const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()

    if (userData?.role !== "vendor") redirect("/admin")

    // Fetch notifications for vendor
    const { data: notifications } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100)

    return <VendorNotificationsContent notifications={notifications || []} userId={user.id} />
}
