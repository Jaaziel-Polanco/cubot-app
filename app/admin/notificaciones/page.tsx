import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminNotificationsContent } from "./content"

export default async function AdminNotificationsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Verify admin role
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (userData?.role !== "admin") redirect("/vendor")

  // Fetch notifications for admin
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100)

  return <AdminNotificationsContent notifications={notifications || []} userId={user.id} />
}
