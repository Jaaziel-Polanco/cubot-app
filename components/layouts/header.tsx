"use client"

import { Bell, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/components/contexts/LanguageContext"

interface HeaderProps {
  userName?: string
  userRole?: string
  notificationCount?: number
}

export function Header({ userName = "User", userRole = "admin", notificationCount = 0 }: HeaderProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Error logging out:", error)
        alert("Error al cerrar sesión. Por favor, intenta de nuevo.")
        setIsLoggingOut(false)
        return
      }

      // Redirect to login page
      router.push("/auth/login")
      router.refresh()
    } catch (error) {
      console.error("Unexpected error during logout:", error)
      alert("Error inesperado al cerrar sesión.")
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-30 glass border-b border-border/50 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 pl-16 lg:pl-4">
        <div className="flex items-center gap-4">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-foreground truncate">{t("common.app_name")}</h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-destructive">
                {notificationCount}
              </Badge>
            )}
          </Button>

          <LanguageToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userRole}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{t("common.my_account")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                {t("common.profile")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isLoggingOut ? t("common.loading") : t("common.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
