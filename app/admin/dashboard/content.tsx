"use client"

import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, Users as UsersIcon, ShoppingCart, DollarSign } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/components/contexts/LanguageContext"

interface AdminDashboardContentProps {
    activeVendorsCount: number
    pendingSalesCount: number
    monthRevenue: number
    pendingCommissionsTotal: number
}

export function AdminDashboardContent({
    activeVendorsCount,
    pendingSalesCount,
    monthRevenue,
    pendingCommissionsTotal,
}: AdminDashboardContentProps) {
    const { t } = useLanguage()

    return (
        <div className="space-y-6 sm:space-y-8 container-padding section-spacing">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-2xl glass-card border-primary/20 p-6 sm:p-8 lg:p-10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-accent/10 animate-gradient bg-[length:200%_200%]" />
                <div className="relative">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">
                        {t("admin.hero.title")}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                        {t("admin.hero.subtitle")}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                <StatCard title={t("admin.stats.active_vendors")} value={activeVendorsCount} icon="Users" iconColor="text-blue-600" delay={0} />
                <StatCard
                    title={t("admin.stats.pending_sales")}
                    value={pendingSalesCount}
                    icon="ShoppingCart"
                    iconColor="text-orange-600"
                    delay={0.1}
                />
                <StatCard
                    title={t("admin.stats.month_revenue")}
                    value={`RD$${monthRevenue.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`}
                    change="+12.5%"
                    changeType="positive"
                    icon="DollarSign"
                    iconColor="text-green-600"
                    delay={0.2}
                />
                <StatCard
                    title={t("admin.stats.pending_commissions")}
                    value={`RD$${pendingCommissionsTotal.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`}
                    icon="TrendingUp"
                    iconColor="text-purple-600"
                    delay={0.3}
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card className="glass-card border-primary/10 hover-lift group">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                <UsersIcon className="w-5 h-5" />
                            </div>
                            {t("admin.actions.manage_vendors.title")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            {t("admin.actions.manage_vendors.desc")}
                        </p>
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/admin/users">{t("admin.actions.manage_vendors.btn")}</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="glass-card border-primary/10 hover-lift group">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 group-hover:scale-110 transition-transform">
                                <Plus className="w-5 h-5" />
                            </div>
                            {t("admin.actions.validation.title")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            {t("admin.actions.validation.desc_prefix")} {pendingSalesCount} {t("admin.actions.validation.desc_suffix")}
                        </p>
                        <Button asChild className="w-full">
                            <Link href="/admin/validation">{t("admin.actions.validation.btn")}</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="glass-card border-primary/10 hover-lift group">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <div className="p-2 rounded-lg bg-green-500/10 text-green-600 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            {t("admin.actions.reports.title")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            {t("admin.actions.reports.desc")}
                        </p>
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/admin/reports">{t("admin.actions.reports.btn")}</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
