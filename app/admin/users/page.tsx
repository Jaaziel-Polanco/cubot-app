"use client"

import { useState, useEffect, useMemo } from "react"
import type { User } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Users, Shield, UserCheck, UserX, Mail, Phone, Calendar } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, CheckCircle2, XCircle, FileCheck, FileX } from "lucide-react"
import { toast } from "@/lib/utils/toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/components/contexts/LanguageContext"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "admins" | "vendors">("all")
  const { t } = useLanguage()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setUsers(data.users || [])
    } catch (error: any) {
      toast.error(t("common.error"), error.message || t("common.error"))
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = useMemo(() => {
    let filtered = users

    // Filter by tab
    if (activeTab === "admins") {
      filtered = filtered.filter((u) => u.role === "admin" || u.role === "validator" || u.role === "finance")
    } else if (activeTab === "vendors") {
      filtered = filtered.filter((u) => u.role === "vendor")
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.vendor_id?.toLowerCase().includes(query) ||
          u.phone?.toLowerCase().includes(query),
      )
    }

    return filtered
  }, [users, searchQuery, activeTab])

  const adminUsers = filteredUsers.filter((u) => u.role === "admin" || u.role === "validator" || u.role === "finance")
  const vendorUsers = filteredUsers.filter((u) => u.role === "vendor")

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "suspended" : "active"
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Error")
      }

      toast.success(
        t("common.updated"),
        t("common.updated")
      )
      loadUsers()
    } catch (error: any) {
      toast.error(t("common.error"), error.message || t("common.error"))
    }
  }

  const handleKycAction = async (userId: string, action: "approve" | "reject", reason?: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/kyc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Error")
      }

      toast.success(
        t("common.updated"),
        t("common.updated")
      )
      loadUsers()
    } catch (error: any) {
      toast.error(
        t("common.error"),
        error.message || t("common.error")
      )
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "validator":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "finance":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "vendor":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return t("admin.users.role.admin")
      case "validator": return t("admin.users.role.validator")
      case "finance": return t("admin.users.role.finance")
      case "vendor": return t("admin.users.role.vendor")
      default: return role
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">{t("admin.users.loading")}</div>
        <div className="text-muted-foreground">{t("admin.users.loading")}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("admin.users.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("admin.users.subtitle")}</p>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder={t("admin.users.search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "admins" | "vendors")}>
        <TabsList className="grid w-full sm:w-auto grid-cols-3">
          <TabsTrigger value="all">{t("admin.users.tabs.all")} ({users.length})</TabsTrigger>
          <TabsTrigger value="admins">
            <Shield className="w-4 h-4 mr-2" />
            {t("admin.users.tabs.admins")} ({adminUsers.length})
          </TabsTrigger>
          <TabsTrigger value="vendors">
            <Users className="w-4 h-4 mr-2" />
            {t("admin.users.tabs.vendors")} ({vendorUsers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <UsersGrid
            users={filteredUsers}
            searchQuery={searchQuery}
            getRoleBadgeColor={getRoleBadgeColor}
            getRoleLabel={getRoleLabel}
            getInitials={getInitials}
            onToggleStatus={handleToggleStatus}
            onKycAction={handleKycAction}
          />
        </TabsContent>

        <TabsContent value="admins" className="mt-6">
          <UsersGrid
            users={adminUsers}
            searchQuery={searchQuery}
            getRoleBadgeColor={getRoleBadgeColor}
            getRoleLabel={getRoleLabel}
            getInitials={getInitials}
            onToggleStatus={handleToggleStatus}
            onKycAction={handleKycAction}
          />
        </TabsContent>

        <TabsContent value="vendors" className="mt-6">
          <UsersGrid
            users={vendorUsers}
            searchQuery={searchQuery}
            getRoleBadgeColor={getRoleBadgeColor}
            getRoleLabel={getRoleLabel}
            getInitials={getInitials}
            onToggleStatus={handleToggleStatus}
            onKycAction={handleKycAction}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function UsersGrid({ users, searchQuery, getRoleBadgeColor, getRoleLabel, getInitials, onToggleStatus, onKycAction }: any) {
  const { t } = useLanguage()

  if (users.length === 0) {
    return (
      <Card className="col-span-full">
        <CardContent className="py-12 text-center text-slate-500">
          {searchQuery ? t("admin.users.empty_search") : t("admin.users.empty_all")}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map((user: User) => (
        <UserCard
          key={user.id}
          user={user}
          onToggleStatus={onToggleStatus}
          onKycAction={onKycAction}
          getRoleBadgeColor={getRoleBadgeColor}
          getRoleLabel={getRoleLabel}
          getInitials={getInitials}
        />
      ))}
    </div>
  )
}


interface UserCardProps {
  user: User
  onToggleStatus: (userId: string, currentStatus: string) => void
  onKycAction: (userId: string, action: "approve" | "reject", reason?: string) => void
  getRoleBadgeColor: (role: string) => string
  getRoleLabel: (role: string) => string
  getInitials: (name: string) => string
}

function UserCard({
  user,
  onToggleStatus,
  onKycAction,
  getRoleBadgeColor,
  getRoleLabel,
  getInitials,
}: UserCardProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const { t } = useLanguage()

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{user.name}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Mail className="w-3 h-3" />
                {user.email}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("admin.users.actions_label")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                {t("admin.users.actions.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(user.id, user.status)}>
                {user.status === "active" ? (
                  <>
                    <UserX className="w-4 h-4 mr-2" />
                    {t("admin.users.actions.suspend")}
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    {t("admin.users.actions.activate")}
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
            {getRoleLabel(user.role)}
          </Badge>
          <Badge
            variant={user.status === "active" ? "default" : "secondary"}
            className={user.status === "active" ? "bg-green-600" : "bg-red-600"}
          >
            {user.status === "active" ? (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {t("admin.users.status.active")}
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 mr-1" />
                {t("admin.users.status.suspended")}
              </>
            )}
          </Badge>
        </div>

        {user.vendor_id && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="font-medium">ID:</span>
            <span className="font-mono font-semibold">{user.vendor_id}</span>
          </div>
        )}

        {user.phone && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="w-4 h-4" />
            <span>{user.phone}</span>
          </div>
        )}

        {user.role === "vendor" && (
          <div className="pt-2 border-t space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-600">KYC:</span>
                <Badge
                  variant="outline"
                  className={
                    user.kyc_status === "approved"
                      ? "border-green-600 text-green-600"
                      : user.kyc_status === "rejected"
                        ? "border-red-600 text-red-600"
                        : "border-yellow-600 text-yellow-600"
                  }
                >
                  {user.kyc_status === "approved"
                    ? t("admin.users.kyc.approved")
                    : user.kyc_status === "rejected"
                      ? t("admin.users.kyc.rejected")
                      : t("admin.users.kyc.pending")}
                </Badge>
              </div>
              {user.kyc_status === "pending" && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => onKycAction(user.id, "approve")}
                  >
                    <FileCheck className="w-3 h-3 mr-1" />
                    {t("admin.users.actions.approve")}
                  </Button>
                  <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-red-600">
                        <FileX className="w-3 h-3 mr-1" />
                        {t("admin.users.actions.reject")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("admin.users.dialog.reject_title")}</DialogTitle>
                        <DialogDescription>
                          {t("admin.users.dialog.reject_desc").replace("{name}", user.name)}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">{t("admin.users.dialog.reject_reason")}</label>
                          <Textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder={t("admin.users.dialog.reject_placeholder")}
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                          {t("admin.users.dialog.cancel")}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            if (rejectReason.trim()) {
                              onKycAction(user.id, "reject", rejectReason)
                              setShowRejectDialog(false)
                              setRejectReason("")
                            }
                          }}
                          disabled={!rejectReason.trim()}
                        >
                          {t("admin.users.dialog.confirm_reject")}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <Calendar className="w-3 h-3" />
          <span>{t("admin.users.registered").replace("{date}", new Date(user.created_at).toLocaleDateString("es-DO"))}</span>
        </div>
      </CardContent>
    </Card>
  )
}
