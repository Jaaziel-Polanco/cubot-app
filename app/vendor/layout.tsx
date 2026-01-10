import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layouts/sidebar"
import { Header } from "@/components/layouts/header"
import { LanguageProvider } from "@/components/contexts/LanguageContext"

export default async function VendorLayout({
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

  if (!profile || profile.role !== "vendor") {
    redirect("/admin/dashboard")
  }

  const navItems = [
    { title: "vendor.nav.dashboard", href: "/vendor/dashboard", icon: "LayoutDashboard" },
    { title: "vendor.nav.register_sale", href: "/vendor/sales/new", icon: "Plus" },
    { title: "vendor.nav.my_sales", href: "/vendor/sales", icon: "ShoppingCart" },
    { title: "vendor.nav.commissions", href: "/vendor/commissions", icon: "DollarSign" },
    { title: "vendor.nav.payments", href: "/vendor/payments", icon: "CreditCard" },
    { title: "vendor.nav.products", href: "/vendor/products", icon: "Package" },
    { title: "vendor.nav.profile", href: "/vendor/profile", icon: "User" },
    { title: "vendor.nav.help", href: "/vendor/help", icon: "HelpCircle" },
    { title: "vendor.nav.notifications", href: "/vendor/notificaciones", icon: "Bell" },
  ]

  return (
    <LanguageProvider>
      <div className="h-screen overflow-hidden flex flex-col lg:flex-row bg-background">
        <Sidebar title={`CUBOT Vendor`} items={navItems} />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Header userName={profile.name || "Vendor"} userRole={`Vendor ID: ${profile.vendor_id}`} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background overflow-y-auto">{children}</main>
        </div>
      </div>
    </LanguageProvider>
  )
}
