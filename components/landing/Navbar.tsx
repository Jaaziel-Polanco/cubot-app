"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { Menu, X, LayoutDashboard, Globe, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanding } from "./LandingContext"
import { useTheme } from "next-themes"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavbarProps {
    isAuthenticated?: boolean
    userRole?: string | null
}

export function Navbar({ isAuthenticated = false, userRole = null }: NavbarProps) {
    const { t, language, setLanguage } = useLanding()
    const { theme, setTheme } = useTheme()
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { scrollY } = useScroll()

    const dashboardHref = userRole === "admin" ? "/admin/dashboard" : "/vendor/dashboard"

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50)
    })

    const navLinks = [
        { name: t("nav.phones"), href: "#dispositivos" },
        { name: t("nav.features"), href: "#features" },
        { name: t("nav.vendors"), href: "#vendors" },
        { name: t("nav.about"), href: "#about" },
    ]

    return (
        <motion.nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled
                    ? "bg-background/80 backdrop-blur-md border-b border-border/50 py-3 shadow-sm"
                    : "bg-transparent py-5"
            )}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 z-50">
                        <span className={cn(
                            "text-2xl font-bold tracking-tighter transition-colors",
                            isScrolled ? "text-primary" : "text-white"
                        )}>
                            CUBOT
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    isScrolled ? "text-foreground" : "text-white/90 hover:text-white"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* CTA Buttons & Language & Theme */}
                    <div className="hidden md:flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className={cn(
                                "rounded-full",
                                isScrolled ? "text-foreground" : "text-white hover:bg-white/20 hover:text-white"
                            )}
                        >
                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className={cn(
                                    isScrolled ? "text-foreground" : "text-white hover:bg-white/20 hover:text-white"
                                )}>
                                    <Globe className="w-5 h-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setLanguage("es")}>
                                    Español {language === "es" && "✓"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setLanguage("en")}>
                                    English {language === "en" && "✓"}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {isAuthenticated ? (
                            <Button asChild variant={isScrolled ? "default" : "secondary"} className="gap-2">
                                <Link href={dashboardHref}>
                                    <LayoutDashboard className="w-4 h-4" />
                                    {t("nav.dashboard")}
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    asChild
                                    className={cn(
                                        isScrolled ? "text-foreground hover:bg-accent" : "text-white hover:bg-white/20 hover:text-white"
                                    )}
                                >
                                    <Link href="/auth/login">{t("nav.login")}</Link>
                                </Button>
                                <Button
                                    asChild
                                    className={cn(
                                        isScrolled ? "" : "bg-white text-primary hover:bg-white/90"
                                    )}
                                >
                                    <Link href="#register">{t("nav.register")}</Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className={cn(
                            "md:hidden z-50 p-2 rounded-full transition-colors",
                            isScrolled ? "text-foreground hover:bg-accent" : "text-white hover:bg-white/20"
                        )}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-0 left-0 right-0 bg-background border-b border-border p-4 pt-20 md:hidden shadow-xl"
                >
                    <div className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-lg font-medium text-foreground p-2 hover:bg-accent rounded-md"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}

                        <div className="flex items-center justify-between p-2">
                            <span className="text-sm font-medium">Theme</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            >
                                {theme === "dark" ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                                {theme === "dark" ? "Light" : "Dark"}
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-2">
                            <span className="text-sm font-medium">Language</span>
                            <div className="flex gap-2">
                                <Button
                                    variant={language === "es" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setLanguage("es")}
                                >
                                    ES
                                </Button>
                                <Button
                                    variant={language === "en" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setLanguage("en")}
                                >
                                    EN
                                </Button>
                            </div>
                        </div>

                        <div className="h-px bg-border my-2" />

                        {isAuthenticated ? (
                            <Button asChild className="w-full justify-start gap-2">
                                <Link href={dashboardHref}>
                                    <LayoutDashboard className="w-4 h-4" />
                                    {t("nav.dashboard")}
                                </Link>
                            </Button>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Button variant="outline" asChild className="w-full justify-start">
                                    <Link href="/auth/login">{t("nav.login")}</Link>
                                </Button>
                                <Button asChild className="w-full justify-start">
                                    <Link href="#register">{t("nav.register")}</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.nav>
    )
}
