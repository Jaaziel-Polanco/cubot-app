"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  CheckCircle,
  DollarSign,
  CreditCard,
  FileText,
  Bell,
  Settings,
  Plus,
  User,
  Menu,
  X,
  Building2,
  type LucideIcon,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useLanguage } from "@/components/contexts/LanguageContext"

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  CheckCircle,
  DollarSign,
  CreditCard,
  FileText,
  Bell,
  Settings,
  Plus,
  User,
  Building2,
}

interface NavItem {
  title: string
  href: string
  icon: string
}

interface SidebarProps {
  title: string
  items: NavItem[]
}

export function Sidebar({ title, items }: SidebarProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { t } = useLanguage()

  return (
    <>
      {/* Mobile menu button - now integrated with header */}
      <div className={cn("lg:hidden fixed top-3 left-3 z-50 transition-opacity duration-200", isMobileOpen ? "opacity-0 pointer-events-none" : "opacity-100")}>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(true)}
          className="glass shadow-lg border-primary/20 bg-background/95 backdrop-blur-sm"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40",
          "w-72 glass-sidebar border-r border-sidebar-border/50",
          "flex flex-col transition-transform duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Gradient Brand Header */}
        <div className="relative p-6 border-b border-sidebar-border/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />

          {/* Close button for mobile - positioned in header */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-background/50 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative pr-12 lg:pr-0">
            <h1 className="text-xl font-bold gradient-text animate-gradient bg-[length:200%_auto] truncate">
              {title}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">{t("common.app_name")}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {items.map((item, index) => {
            const exactMatch = pathname === item.href
            const isSubPath = pathname.startsWith(item.href + "/")
            const hasMoreSpecificMatch = items.some(
              (otherItem) =>
                otherItem.href !== item.href &&
                otherItem.href.startsWith(item.href + "/") &&
                pathname.startsWith(otherItem.href)
            )
            const isActive = exactMatch || (isSubPath && !hasMoreSpecificMatch)

            const Icon = iconMap[item.icon]
            if (!Icon) return null

            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  whileHover={{ x: 4 }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group",
                    isActive
                      ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary shadow-md border border-primary/30"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground border border-transparent",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-all",
                      isActive ? "scale-110 text-primary" : "group-hover:scale-105"
                    )}
                  />
                  <span className="font-medium text-sm">{t(item.title)}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Footer with Theme Toggle */}
        <div className="p-4 border-t border-sidebar-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t("common.settings")}</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  )
}
