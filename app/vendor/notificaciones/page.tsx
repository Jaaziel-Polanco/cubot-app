"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle } from "lucide-react"
import { useLanguage } from "@/components/contexts/LanguageContext"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
  metadata?: Record<string, any>
}

export default function VendorNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/vendor/notifications")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/vendor/notifications/${id}/read`, {
        method: "PUT",
      })
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      }
    } catch (error) {
      console.error("[v0] Failed to mark notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/vendor/notifications/read-all", {
        method: "PUT",
      })
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      }
    } catch (error) {
      console.error("[v0] Failed to mark all as read:", error)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) return <div className="p-8">{t("common.loading")}</div>

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("vendor.notifications.title")}</h1>
          <p className="text-muted-foreground">
            {t("vendor.notifications.subtitle").replace("{unread}", unreadCount.toString()).replace("{total}", notifications.length.toString())}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead}>
            <CheckCircle className="mr-2 h-4 w-4" />
            {t("vendor.notifications.mark_all")}
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Bell className="mx-auto h-12 w-12 mb-2 opacity-20" />
              {t("vendor.notifications.empty")}
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className={notification.read ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {/* This could be translated if title is known or sent as key from backend, assuming raw for now */}
                      {notification.title}
                      {!notification.read && (
                        <Badge variant="default" className="text-xs">
                          {t("vendor.notifications.new")}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">{notification.message}</CardDescription>
                  </div>
                  {!notification.read && (
                    <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                      {t("vendor.notifications.mark_read")}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Badge variant="outline">{notification.type}</Badge>
                  <span>{new Date(notification.created_at).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
