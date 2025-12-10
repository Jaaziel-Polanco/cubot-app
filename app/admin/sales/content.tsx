"use client"

import { useLanguage } from "@/components/contexts/LanguageContext"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, User, Package, Smartphone, Calendar, DollarSign, Info, FileText } from "lucide-react"

interface AdminSalesContentProps {
    sales: any[]
}

export function AdminSalesContent({ sales }: AdminSalesContentProps) {
    const { t } = useLanguage()

    const totalSales = sales?.length || 0
    const approvedSales = sales?.filter((s: any) => s.status === "approved").length || 0
    const pendingSales = sales?.filter((s: any) => s.status === "pending").length || 0
    const totalRevenue = sales?.reduce((sum: number, s: any) => sum + (parseFloat(s.sale_price) || 0), 0) || 0

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{t("admin.sales.title")}</h1>
                    <p className="text-sm text-muted-foreground mt-1">{t("admin.sales.subtitle")}</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">{t("admin.sales.stats.total")}</p>
                                <p className="text-2xl font-bold text-foreground">{totalSales}</p>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <ShoppingCart className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">{t("admin.sales.stats.approved")}</p>
                                <p className="text-2xl font-bold text-green-600">{approvedSales}</p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-lg">
                                <FileText className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">{t("admin.sales.stats.pending")}</p>
                                <p className="text-2xl font-bold text-yellow-600">{pendingSales}</p>
                            </div>
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Calendar className="w-5 h-5 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">{t("admin.sales.stats.revenue")}</p>
                                <p className="text-2xl font-bold text-purple-600">RD${totalRevenue.toFixed(2)}</p>
                            </div>
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <DollarSign className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            {/* Desktop Table */}
            <div className="hidden lg:block bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        {t("admin.sales.table.sale_id")}
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Info className="w-3 h-3 text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Identificador único de la venta</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("admin.sales.table.vendor")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("admin.sales.table.product")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("admin.sales.table.imei")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("admin.sales.table.price")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("admin.sales.table.status")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("admin.sales.table.date")}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                            {sales?.map((sale: any) => (
                                <tr key={sale.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">{sale.sale_id}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium text-foreground">{sale.users?.vendor_id}</div>
                                                <div className="text-xs text-muted-foreground">{sale.users?.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium text-foreground">{sale.products?.sku}</div>
                                                <div className="text-xs text-muted-foreground">{sale.products?.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-mono text-muted-foreground">***{sale.imei.slice(-4)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">RD${sale.sale_price}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge
                                            variant="outline"
                                            className={
                                                sale.status === "approved"
                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                    : sale.status === "rejected"
                                                        ? "bg-red-50 text-red-700 border-red-200"
                                                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                            }
                                        >
                                            {sale.status === "approved" ? t("admin.sales.status.approved") : sale.status === "rejected" ? t("admin.sales.status.rejected") : t("admin.sales.status.pending")}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            {new Date(sale.sale_date).toLocaleDateString("es-DO")}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {(!sales || sales.length === 0) && (
                    <Empty className="py-12">
                        <EmptyMedia variant="icon">
                            <ShoppingCart className="w-12 h-12 text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyHeader>
                            <EmptyTitle>{t("admin.sales.empty.title")}</EmptyTitle>
                            <EmptyDescription>{t("admin.sales.empty.desc")}</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )}
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
                {sales?.map((sale: any) => (
                    <Card key={sale.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-mono text-sm font-semibold text-foreground">{sale.sale_id}</div>
                                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(sale.sale_date).toLocaleDateString("es-DO")}
                                    </div>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={
                                        sale.status === "approved"
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : sale.status === "rejected"
                                                ? "bg-red-50 text-red-700 border-red-200"
                                                : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                    }
                                >
                                    {sale.status === "approved" ? t("admin.sales.status.approved") : sale.status === "rejected" ? t("admin.sales.status.rejected") : t("admin.sales.status.pending")}
                                </Badge>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {t("admin.sales.table.vendor")}
                                    </div>
                                    <div className="font-medium text-foreground">{sale.users?.vendor_id}</div>
                                    <div className="text-xs text-muted-foreground">{sale.users?.name}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                        <Package className="w-3 h-3" />
                                        {t("admin.sales.table.product")}
                                    </div>
                                    <div className="font-medium text-foreground">{sale.products?.sku}</div>
                                    <div className="text-xs text-muted-foreground">{sale.products?.name}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                        <Smartphone className="w-3 h-3" />
                                        {t("admin.sales.table.imei")}
                                    </div>
                                    <div className="font-mono text-muted-foreground">***{sale.imei.slice(-4)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" />
                                        {t("admin.sales.table.price")}
                                    </div>
                                    <div className="font-semibold text-foreground">RD${sale.sale_price}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {(!sales || sales.length === 0) && (
                    <Empty className="py-12">
                        <EmptyMedia variant="icon">
                            <ShoppingCart className="w-12 h-12 text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyHeader>
                            <EmptyTitle>{t("admin.sales.empty.title")}</EmptyTitle>
                            <EmptyDescription>{t("admin.sales.empty.desc")}</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )}
            </div>
        </div>
    )
}
