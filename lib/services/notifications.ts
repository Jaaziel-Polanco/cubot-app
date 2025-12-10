import { createClient } from "@/lib/supabase/server"
import type { Notification } from "@/lib/types"

interface CreateNotificationData {
  user_id: string
  title: string
  message: string
  type: string
  metadata?: Record<string, any>
}

/**
 * Creates a notification for a user
 */
export async function createNotification(data: CreateNotificationData): Promise<Notification> {
  const supabase = await createClient()

  const { data: notification, error } = await supabase.from("notifications").insert(data).select().single()

  if (error) throw error

  return notification
}

/**
 * Gets notifications for a user
 */
export async function getUserNotifications(userId: string): Promise<Notification[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) throw error
  return data
}

/**
 * Marks notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", notificationId)

  if (error) throw error
}

/**
 * Marks all notifications as read for a user
 */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false)

  if (error) throw error
}

/**
 * Gets unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false)

  if (error) throw error
  return count || 0
}
