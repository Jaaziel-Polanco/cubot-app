"use client"

import { useLanguage } from "@/components/contexts/LanguageContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Bell,
    CheckCircle2,
    XCircle,
    DollarSign,
    ShoppingCart,
    Trash2,
    Check,
    ExternalLink,
    AlertCircle
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface Notification {
    id: string
    type: string
    title: string
    message: string
    link?: string
    read: boolean
    created_at: string
}

interface AdminNotificationsContentProps {
    notifications: Notification[]
    userId: string
}

export function AdminNotificationsContent({ notifications, userId }: AdminNotificationsContentProps) {
    const { t } = useLanguage()
    const router = useRouter()
    const [items, setItems] = useState(notifications)
    const [loading, setLoading] = useState<string | null>(null)

    const unreadCount = items.filter(n => !n.read).length

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "sale_approved":
            case "sale_rejected":
                return <ShoppingCart className="w-5 h-5" />
            case "commission_paid":
                return <DollarSign className="w-5 h-5" />
            case "payment_approved":
            case "payment_rejected":
                return <CheckCircle2 className="w-5 h-5" />
            case "system":
                return <AlertCircle className="w-5 h-5" />
            default:
                return <Bell className="w-5 h-5" />
        }
    }

    const getNotificationColor = (type: string) => {
        switch (type) {
            case "sale_approved":
            case "payment_approved":
            case "commission_paid":
                return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30"
            case "sale_rejected":
            case "payment_rejected":
                return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30"
            case "system":
                return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30"
            default:
                return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/30"
        }
    }

    const markAsRead = async (id: string) => {
        setLoading(id)
        try {
            const response = await fetch("/api/notifications/mark-read", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId: id })
            })

            if (response.ok) {
                setItems(items.map(item =>
                    item.id === id ? { ...item, read: true } : item
                ))
            }
        } catch (error) {
            console.error("Error marking notification as read:", error)
        } finally {
            setLoading(null)
        }
    }

    const markAllAsRead = async () => {
        setLoading("all")
        try {
            const response = await fetch("/api/notifications/mark-all-read", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            })

            if (response.ok) {
                setItems(items.map(item => ({ ...item, read: true })))
            }
        } catch (error) {
            console.error("Error marking all as read:", error)
        } finally {
            setLoading(null)
        }
    }

    const deleteNotification = async (id: string) => {
        setLoading(id)
        try {
            const response = await fetch("/api/notifications/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId: id })
            })

            if (response.ok) {
                setItems(items.filter(item => item.id !== id))
            }
        } catch (error) {
            console.error("Error deleting notification:", error)
        } finally {
            setLoading(null)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
            return diffInMinutes < 1 ? t("notifications.time.now") : t("notifications.time.minutes").replace("{minutes}", diffInMinutes.toString())
        } else if (diffInHours < 24) {
            return t("notifications.time.hours").replace("{hours}", diffInHours.toString())
        } else {
            const diffInDays = Math.floor(diffInHours / 24)
            return diffInDays === 1 ? t("notifications.time.yesterday") : t("notifications.time.days").replace("{days}", diffInDays.toString())
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                            <Bell className="w-6 h-6 text-white" />
                        </div>
                        {t("admin.nav.notifications")}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {t("notifications.subtitle.admin")}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button
                        onClick={markAllAsRead}
                        disabled={loading === "all"}
                        variant="outline"
                        className="gap-2"
                    >
                        <Check className="w-4 h-4" />
                        {t("notifications.mark_all_read")} ({unreadCount})
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-border">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{items.length}</p>
                                <p className="text-xs text-muted-foreground">{t("notifications.stats.total")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
                                <p className="text-xs text-muted-foreground">{t("notifications.stats.unread")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{items.length - unreadCount}</p>
                                <p className="text-xs text-muted-foreground">{t("notifications.stats.read")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                                <ShoppingCart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {items.filter(n => n.type.includes("sale")).length}
                                </p>
                                <p className="text-xs text-muted-foreground">{t("notifications.stats.sales")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Notifications List */}
            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="text-lg">{t("notifications.recent")}</CardTitle>
                    <CardDescription>{t("notifications.recent.desc.admin")}</CardDescription>
                </CardHeader>
                <CardContent>
                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            <Bell className="w-12 h-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">{t("notifications.empty.title")}</h3>
                            <p className="text-sm text-muted-foreground">{t("notifications.empty.desc")}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((notification, index) => (
                                <div key={notification.id}>
                                    <div
                                        className={`p-4 rounded-lg transition-all ${!notification.read
                                            ? "bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500"
                                            : "bg-muted/30"
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                                                            {notification.title}
                                                            {!notification.read && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {t("notifications.badge.new")}
                                                                </Badge>
                                                            )}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            {formatDate(notification.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-3">
                                                    {notification.link && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="gap-2"
                                                            onClick={() => router.push(notification.link!)}
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                            {t("notifications.view_details")}
                                                        </Button>
                                                    )}
                                                    {!notification.read && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => markAsRead(notification.id)}
                                                            disabled={loading === notification.id}
                                                        >
                                                            <Check className="w-3 h-3 mr-1" />
                                                            {t("notifications.mark_read")}
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                        onClick={() => deleteNotification(notification.id)}
                                                        disabled={loading === notification.id}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {index < items.length - 1 && <Separator className="my-3" />}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
