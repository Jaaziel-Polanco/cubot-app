import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layouts/sidebar"
import { Header } from "@/components/layouts/header"
import { LanguageProvider } from "@/components/contexts/LanguageContext"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/vendor/dashboard")
  }

  const navItems = [
    { title: "admin.nav.dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
    { title: "admin.nav.users", href: "/admin/users", icon: "Users" },
    { title: "admin.nav.products", href: "/admin/products", icon: "Package" },
    { title: "admin.nav.banks", href: "/admin/banks", icon: "Building2" },
    { title: "admin.nav.sales", href: "/admin/sales", icon: "ShoppingCart" },
    { title: "admin.nav.validation", href: "/admin/validation", icon: "CheckCircle" },
    { title: "admin.nav.commissions", href: "/admin/commissions", icon: "DollarSign" },
    { title: "admin.nav.payments", href: "/admin/payments", icon: "CreditCard" },
    { title: "admin.nav.reports", href: "/admin/reports", icon: "FileText" },
    { title: "admin.nav.notifications", href: "/admin/notificaciones", icon: "Bell" },
    { title: "admin.nav.configuration", href: "/admin/configuracion", icon: "Settings" },
  ]

  return (
    <LanguageProvider>
      <div className="h-screen overflow-hidden flex">
        <Sidebar title="CUBOT Admin" items={navItems} />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Header userName={profile.name || "Admin"} userRole="Administrator" />
          <main className="flex-1 p-8 bg-background overflow-y-auto">{children}</main>
        </div>
      </div>
    </LanguageProvider>
  )
}
