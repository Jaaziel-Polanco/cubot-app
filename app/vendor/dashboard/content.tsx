"use client"

import { StatCard } from "@/components/dashboard/stat-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, TrendingUp, Wallet, Clock, CheckCircle, DollarSign, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/components/contexts/LanguageContext"

interface VendorDashboardContentProps {
    totalSalesCount: number
    pendingSalesCount: number
    monthSalesCount: number
    totalEarned: number
    pendingCommissionsAmount: number
    paidCommissionsAmount: number
}

export function VendorDashboardContent({
    totalSalesCount,
    pendingSalesCount,
    monthSalesCount,
    totalEarned,
    pendingCommissionsAmount,
    paidCommissionsAmount,
}: VendorDashboardContentProps) {
    const { t } = useLanguage()

    return (
        <div className="space-y-6 sm:space-y-8 container-padding section-spacing">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl glass-card border-primary/20 p-6 sm:p-8">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-purple-500/10 animate-gradient bg-[length:200%_200%]" />
                <div className="relative">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">
                        {t("common.welcome")}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        {t("vendor.hero.subtitle")}
                    </p>
                </div>
            </div>

            {/* Sales Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <StatCard
                    title={t("vendor.stats.total_sales")}
                    value={totalSalesCount}
                    icon="ShoppingCart"
                    iconColor="text-blue-600"
                    delay={0}
                />
                <StatCard
                    title={t("vendor.stats.validation")}
                    value={pendingSalesCount}
                    icon="Clock"
                    iconColor="text-orange-600"
                    delay={0.1}
                />
                <StatCard
                    title={t("vendor.stats.month_sales")}
                    value={monthSalesCount}
                    change="+8.2%"
                    changeType="positive"
                    icon="TrendingUp"
                    iconColor="text-green-600"
                    delay={0.2}
                />
            </div>

            {/* Commission Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <StatCard
                    title={t("vendor.stats.total_earned")}
                    value={`RD$${totalEarned.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`}
                    icon="DollarSign"
                    iconColor="text-purple-600"
                    delay={0.3}
                />
                <StatCard
                    title={t("vendor.stats.pending_commissions")}
                    value={`RD$${pendingCommissionsAmount.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`}
                    icon="CheckCircle"
                    iconColor="text-yellow-600"
                    delay={0.4}
                />
                <StatCard
                    title={t("vendor.stats.paid_commissions")}
                    value={`RD$${paidCommissionsAmount.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`}
                    icon="Wallet"
                    iconColor="text-green-600"
                    delay={0.5}
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <Card className="glass-card border-primary/10 hover-lift group">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                <Plus className="w-5 h-5" />
                            </div>
                            {t("vendor.actions.new_sale.title")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            {t("vendor.actions.new_sale.desc")}
                        </p>
                        <Button asChild className="w-full">
                            <Link href="/vendor/sales/new">{t("vendor.actions.new_sale.btn")}</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="glass-card border-primary/10 hover-lift group">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <div className="p-2 rounded-lg bg-green-500/10 text-green-600 group-hover:scale-110 transition-transform">
                                <Wallet className="w-5 h-5" />
                            </div>
                            {t("vendor.actions.commissions.title")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            {t("vendor.actions.commissions.desc")}
                        </p>
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/vendor/commissions">{t("vendor.actions.commissions.btn")}</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
