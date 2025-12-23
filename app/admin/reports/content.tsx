"use client"

import { useLanguage } from "@/components/contexts/LanguageContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingCart,
    Users,
    Package,
    FileText,
    Download,
    Calendar,
    BarChart3,
    PieChart,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    CheckCircle2,
    Clock,
    XCircle
} from "lucide-react"
import { useState, useMemo } from "react"

interface AdminReportsContentProps {
    sales: any[]
    commissions: any[]
    paymentRequests: any[]
    vendors: any[]
    products: any[]
}

export function AdminReportsContent({
    sales,
    commissions,
    paymentRequests,
    vendors,
    products
}: AdminReportsContentProps) {
    const { t } = useLanguage()
    const [timeRange, setTimeRange] = useState("all")

    // Filter data by time range
    const filterByTimeRange = (data: any[], dateField: string) => {
        if (timeRange === "all") return data
        const now = new Date()
        const ranges: Record<string, number> = {
            "7d": 7,
            "30d": 30,
            "90d": 90,
            "365d": 365
        }
        const days = ranges[timeRange] || 0
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
        return data.filter(item => new Date(item[dateField]) >= cutoff)
    }

    const filteredSales = useMemo(() => filterByTimeRange(sales, "sale_date"), [sales, timeRange])
    const filteredCommissions = useMemo(() => filterByTimeRange(commissions, "created_at"), [commissions, timeRange])
    const filteredPayments = useMemo(() => filterByTimeRange(paymentRequests, "requested_at"), [paymentRequests, timeRange])

    // ============ SALES METRICS ============
    const approvedSales = filteredSales.filter(s => s.status === "approved")
    const pendingSales = filteredSales.filter(s => s.status === "pending")
    const rejectedSales = filteredSales.filter(s => s.status === "rejected")
    const totalRevenue = approvedSales.reduce((sum, s) => sum + (parseFloat(s.sale_price) || 0), 0)
    const avgSaleValue = approvedSales.length > 0 ? totalRevenue / approvedSales.length : 0

    // ============ COMMISSION METRICS ============
    const pendingCommissions = filteredCommissions.filter(c => c.status === "pending")
    const paidCommissions = filteredCommissions.filter(c => c.status === "paid")
    const totalCommissionsPending = pendingCommissions.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0)
    const totalCommissionsPaid = paidCommissions.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0)

    // ============ PAYMENT METRICS ============
    const pendingPayments = filteredPayments.filter(p => p.status === "pending")
    const approvedPayments = filteredPayments.filter(p => p.status === "approved")
    const rejectedPayments = filteredPayments.filter(p => p.status === "rejected")
    const totalPaymentsPending = pendingPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
    const totalPaymentsApproved = approvedPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)

    // ============ VENDOR METRICS ============
    const activeVendors = vendors.filter(v => v.status === "active").length
    const inactiveVendors = vendors.filter(v => v.status !== "active").length

    // ============ TOP PERFORMERS ============
    const vendorSalesCount = approvedSales.reduce((acc: Record<string, any>, sale) => {
        const vendorId = sale.vendor_id
        if (!acc[vendorId]) {
            acc[vendorId] = {
                vendor_id: sale.users?.vendor_id || vendorId,
                name: sale.users?.name || "Unknown",
                sales: 0,
                revenue: 0
            }
        }
        acc[vendorId].sales++
        acc[vendorId].revenue += parseFloat(sale.sale_price) || 0
        return acc
    }, {})
    const topVendors = Object.values(vendorSalesCount)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 5)

    // ============ TOP PRODUCTS ============
    const productSalesCount = approvedSales.reduce((acc: Record<string, any>, sale) => {
        const productId = sale.product_id
        if (!acc[productId]) {
            acc[productId] = {
                name: sale.products?.name || "Unknown",
                sku: sale.products?.sku || "-",
                sales: 0,
                revenue: 0
            }
        }
        acc[productId].sales++
        acc[productId].revenue += parseFloat(sale.sale_price) || 0
        return acc
    }, {})
    const topProducts = Object.values(productSalesCount)
        .sort((a: any, b: any) => b.sales - a.sales)
        .slice(0, 5)

    // ============ SALES BY CHANNEL ============
    const salesByChannel = approvedSales.reduce((acc: Record<string, number>, sale) => {
        const channel = sale.channel || "Unknown"
        acc[channel] = (acc[channel] || 0) + 1
        return acc
    }, {})

    // ============ MONTHLY TREND ============
    const monthlyData = approvedSales.reduce((acc: Record<string, { sales: number, revenue: number }>, sale) => {
        const date = new Date(sale.sale_date)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        if (!acc[key]) acc[key] = { sales: 0, revenue: 0 }
        acc[key].sales++
        acc[key].revenue += parseFloat(sale.sale_price) || 0
        return acc
    }, {})
    const monthlyTrend = Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)

    const formatCurrency = (value: number) => `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`

    // CSV Export functions
    const downloadCSV = (data: any[], filename: string, headers: string[]) => {
        const csvContent = [
            headers.join(","),
            ...data.map(row => headers.map(h => {
                const value = row[h.toLowerCase().replace(/ /g, "_")] ?? ""
                return typeof value === "string" && value.includes(",") ? `"${value}"` : value
            }).join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`
        link.click()
    }

    const exportSalesReport = () => {
        const data = filteredSales.map(s => ({
            sale_id: s.sale_id,
            vendor: s.users?.name || "",
            vendor_id: s.users?.vendor_id || "",
            product: s.products?.name || "",
            sku: s.products?.sku || "",
            imei: s.imei,
            price: s.sale_price,
            status: s.status,
            channel: s.channel,
            date: new Date(s.sale_date).toLocaleDateString("es-DO")
        }))
        downloadCSV(data, "ventas_reporte", ["sale_id", "vendor", "vendor_id", "product", "sku", "imei", "price", "status", "channel", "date"])
    }

    const exportCommissionsReport = () => {
        const data = filteredCommissions.map(c => ({
            id: c.id.slice(0, 8),
            vendor: c.users?.name || "",
            vendor_id: c.users?.vendor_id || "",
            amount: c.amount,
            status: c.status,
            created_at: new Date(c.created_at).toLocaleDateString("es-DO")
        }))
        downloadCSV(data, "comisiones_reporte", ["id", "vendor", "vendor_id", "amount", "status", "created_at"])
    }

    const exportPaymentsReport = () => {
        const data = filteredPayments.map(p => ({
            id: p.id.slice(0, 8),
            vendor: p.users?.name || "",
            vendor_id: p.users?.vendor_id || "",
            amount: p.amount,
            status: p.status,
            requested_at: new Date(p.requested_at).toLocaleDateString("es-DO"),
            approved_at: p.approved_at ? new Date(p.approved_at).toLocaleDateString("es-DO") : ""
        }))
        downloadCSV(data, "pagos_reporte", ["id", "vendor", "vendor_id", "amount", "status", "requested_at", "approved_at"])
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        {t("admin.reports.title")}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {t("admin.reports.subtitle")}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[180px]">
                            <Calendar className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Período" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">{t("admin.reports.period.7d")}</SelectItem>
                            <SelectItem value="30d">{t("admin.reports.period.30d")}</SelectItem>
                            <SelectItem value="90d">{t("admin.reports.period.90d")}</SelectItem>
                            <SelectItem value="365d">{t("admin.reports.period.365d")}</SelectItem>
                            <SelectItem value="all">{t("admin.reports.period.all")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-emerald-500 to-green-600 dark:from-emerald-600 dark:to-green-700 text-white border-0 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-emerald-100 text-sm font-medium">{t("admin.reports.stats.total_revenue")}</p>
                                <p className="text-xl lg:text-2xl font-bold mt-2 truncate">{formatCurrency(totalRevenue)}</p>
                                <p className="text-emerald-100 text-xs mt-3 flex items-center gap-1">
                                    <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
                                    {approvedSales.length} {t("admin.reports.stats.approved_sales")}
                                </p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl flex-shrink-0">
                                <DollarSign className="w-5 h-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white border-0 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-blue-100 text-sm font-medium">{t("admin.reports.stats.total_sales")}</p>
                                <p className="text-xl lg:text-2xl font-bold mt-2">{filteredSales.length}</p>
                                <div className="flex flex-wrap gap-1 mt-3">
                                    <Badge className="bg-green-400/30 text-white text-xs">{approvedSales.length} ✓</Badge>
                                    <Badge className="bg-yellow-400/30 text-white text-xs">{pendingSales.length} ⏳</Badge>
                                </div>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl flex-shrink-0">
                                <ShoppingCart className="w-5 h-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 text-white border-0 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-amber-100 text-sm font-medium">{t("admin.reports.stats.pending_commissions")}</p>
                                <p className="text-xl lg:text-2xl font-bold mt-2 truncate">{formatCurrency(totalCommissionsPending)}</p>
                                <p className="text-amber-100 text-xs mt-3">{pendingCommissions.length} {t("admin.reports.stats.pending")}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl flex-shrink-0">
                                <Wallet className="w-5 h-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-violet-500 to-purple-600 dark:from-violet-600 dark:to-purple-700 text-white border-0 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-violet-100 text-sm font-medium">{t("admin.reports.stats.active_vendors")}</p>
                                <p className="text-xl lg:text-2xl font-bold mt-2">{activeVendors}</p>
                                <p className="text-violet-100 text-xs mt-3">{vendors.length} {t("admin.reports.stats.registered")}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl flex-shrink-0">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Status Breakdown */}
                <Card className="shadow-sm border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                            <PieChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            {t("admin.reports.sales_status.title")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="text-sm text-muted-foreground">{t("admin.reports.sales_status.approved")}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{approvedSales.length}</span>
                                    <span className="text-xs text-muted-foreground">
                                        ({filteredSales.length > 0 ? ((approvedSales.length / filteredSales.length) * 100).toFixed(1) : 0}%)
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full transition-all"
                                    style={{ width: `${filteredSales.length > 0 ? (approvedSales.length / filteredSales.length) * 100 : 0}%` }}
                                ></div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <span className="text-sm text-muted-foreground">{t("admin.reports.sales_status.pending")}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{pendingSales.length}</span>
                                    <span className="text-xs text-muted-foreground">
                                        ({filteredSales.length > 0 ? ((pendingSales.length / filteredSales.length) * 100).toFixed(1) : 0}%)
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className="bg-yellow-500 h-2 rounded-full transition-all"
                                    style={{ width: `${filteredSales.length > 0 ? (pendingSales.length / filteredSales.length) * 100 : 0}%` }}
                                ></div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span className="text-sm text-muted-foreground">{t("admin.reports.sales_status.rejected")}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{rejectedSales.length}</span>
                                    <span className="text-xs text-muted-foreground">
                                        ({filteredSales.length > 0 ? ((rejectedSales.length / filteredSales.length) * 100).toFixed(1) : 0}%)
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className="bg-red-500 h-2 rounded-full transition-all"
                                    style={{ width: `${filteredSales.length > 0 ? (rejectedSales.length / filteredSales.length) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Commission Status */}
                <Card className="shadow-sm border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                            <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            {t("admin.reports.commissions.title")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl">
                                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-1">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm font-medium">{t("admin.reports.commissions.pending")}</span>
                                </div>
                                <p className="text-2xl font-bold text-amber-900 dark:text-amber-200">{formatCurrency(totalCommissionsPending)}</p>
                                <p className="text-xs text-amber-600 dark:text-amber-400">{pendingCommissions.length} {t("admin.reports.commissions.count")}</p>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl">
                                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-1">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-sm font-medium">{t("admin.reports.commissions.paid")}</span>
                                </div>
                                <p className="text-2xl font-bold text-green-900 dark:text-green-200">{formatCurrency(totalCommissionsPaid)}</p>
                                <p className="text-xs text-green-600 dark:text-green-400">{paidCommissions.length} {t("admin.reports.commissions.count")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Requests */}
                <Card className="shadow-sm border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                            <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            {t("admin.reports.payments.title")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                    <span className="text-sm text-foreground">{t("admin.reports.payments.pending")}</span>
                                </div>
                                <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200">{pendingPayments.length}</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    <span className="text-sm text-foreground">{t("admin.reports.payments.approved")}</span>
                                </div>
                                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">{approvedPayments.length}</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                    <span className="text-sm text-foreground">{t("admin.reports.payments.rejected")}</span>
                                </div>
                                <Badge variant="secondary" className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200">{rejectedPayments.length}</Badge>
                            </div>
                            <Separator />
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground">{t("admin.reports.payments.total_approved")}</p>
                                <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalPaymentsApproved)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Vendors */}
                <Card className="shadow-sm border-border">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                            {t("admin.reports.top_vendors.title")}
                        </CardTitle>
                        <CardDescription>{t("admin.reports.top_vendors.subtitle")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {topVendors.length > 0 ? (
                            <div className="space-y-4">
                                {topVendors.map((vendor: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? "bg-amber-500" :
                                                index === 1 ? "bg-gray-400" :
                                                    index === 2 ? "bg-orange-600" : "bg-slate-500"
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{vendor.name}</p>
                                                <p className="text-xs text-muted-foreground">{vendor.vendor_id}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600 dark:text-green-400">{formatCurrency(vendor.revenue)}</p>
                                            <p className="text-xs text-muted-foreground">{vendor.sales} {t("admin.reports.top_vendors.sales")}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">{t("admin.reports.top_vendors.empty")}</p>
                        )}
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card className="shadow-sm border-border">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                            <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            {t("admin.reports.top_products.title")}
                        </CardTitle>
                        <CardDescription>{t("admin.reports.top_products.subtitle")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {topProducts.length > 0 ? (
                            <div className="space-y-4">
                                {topProducts.map((product: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? "bg-blue-500" :
                                                index === 1 ? "bg-blue-400" :
                                                    index === 2 ? "bg-blue-300" : "bg-slate-400"
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{product.name}</p>
                                                <p className="text-xs text-muted-foreground">{t("admin.reports.top_products.sku")} {product.sku}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-foreground">{product.sales} {t("admin.reports.top_products.sales")}</p>
                                            <p className="text-xs text-muted-foreground">{formatCurrency(product.revenue)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">{t("admin.reports.top_products.empty")}</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Sales by Channel */}
            <Card className="shadow-sm border-border">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                        <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        {t("admin.reports.by_channel.title")}
                    </CardTitle>
                    <CardDescription>{t("admin.reports.by_channel.subtitle")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(salesByChannel).map(([channel, count]) => (
                            <div key={channel} className="p-4 bg-gradient-to-br from-muted/50 to-muted rounded-xl text-center hover:shadow-md transition-all">
                                <p className="text-3xl font-bold text-foreground">{count as number}</p>
                                <p className="text-sm text-muted-foreground mt-1">{channel}</p>
                                <div className="w-full bg-muted mt-3 rounded-full h-1.5">
                                    <div
                                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full"
                                        style={{ width: `${approvedSales.length > 0 ? ((count as number) / approvedSales.length) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {Object.keys(salesByChannel).length === 0 && (
                            <p className="col-span-4 text-center text-muted-foreground py-8">{t("admin.reports.by_channel.empty")}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Monthly Trend */}
            {monthlyTrend.length > 0 && (
                <Card className="shadow-sm border-border">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            {t("admin.reports.monthly_trend.title")}
                        </CardTitle>
                        <CardDescription>{t("admin.reports.monthly_trend.subtitle")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between gap-2 h-48">
                            {monthlyTrend.map(([month, data]: [string, { sales: number, revenue: number }]) => {
                                const maxRevenue = Math.max(...monthlyTrend.map(([, d]) => d.revenue))
                                const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0
                                return (
                                    <div key={month} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full flex flex-col items-center justify-end h-36">
                                            <div
                                                className="w-full max-w-16 bg-gradient-to-t from-emerald-500 to-green-400 rounded-t-lg transition-all hover:from-emerald-600 hover:to-green-500"
                                                style={{ height: `${height}%`, minHeight: "8px" }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium">{month.split("-")[1]}/{month.split("-")[0].slice(2)}</p>
                                        <p className="text-xs font-semibold text-foreground">{data.sales} {t("admin.reports.monthly_trend.sales")}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Export Section */}
            <Card className="shadow-sm border-dashed border-border">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                        <Download className="w-5 h-5 text-muted-foreground" />
                        {t("admin.reports.export.title")}
                    </CardTitle>
                    <CardDescription>{t("admin.reports.export.subtitle")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300 hover:text-foreground dark:hover:bg-blue-950/30 dark:hover:text-foreground"
                            onClick={exportSalesReport}
                        >
                            <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <span className="font-medium">{t("admin.reports.export.sales")}</span>
                            <span className="text-xs text-muted-foreground">{filteredSales.length} {t("admin.reports.export.records")}</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-amber-50 hover:border-amber-300 hover:text-foreground dark:hover:bg-amber-950/30 dark:hover:text-foreground"
                            onClick={exportCommissionsReport}
                        >
                            <Wallet className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            <span className="font-medium">{t("admin.reports.export.commissions")}</span>
                            <span className="text-xs text-muted-foreground">{filteredCommissions.length} {t("admin.reports.export.records")}</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-300 hover:text-foreground dark:hover:bg-green-950/30 dark:hover:text-foreground"
                            onClick={exportPaymentsReport}
                        >
                            <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                            <span className="font-medium">{t("admin.reports.export.payments")}</span>
                            <span className="text-xs text-muted-foreground">{filteredPayments.length} {t("admin.reports.export.records")}</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Footer */}
            <div className="p-8 bg-card border border-border rounded-2xl shadow-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div>
                        <p className="text-muted-foreground text-sm">{t("admin.reports.summary.avg_sale")}</p>
                        <p className="text-2xl font-bold mt-1 text-foreground">{formatCurrency(avgSaleValue)}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-sm">{t("admin.reports.summary.products")}</p>
                        <p className="text-2xl font-bold mt-1 text-foreground">{products.length}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-sm">{t("admin.reports.summary.approval_rate")}</p>
                        <p className="text-2xl font-bold mt-1 text-foreground">
                            {filteredSales.length > 0 ? ((approvedSales.length / filteredSales.length) * 100).toFixed(1) : 0}%
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-sm">{t("admin.reports.summary.total_commissions")}</p>
                        <p className="text-2xl font-bold mt-1 text-foreground">{formatCurrency(totalCommissionsPending + totalCommissionsPaid)}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
