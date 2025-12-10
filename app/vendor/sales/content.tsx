"use client"

import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Info, ShoppingCart, Calendar, DollarSign, User, Smartphone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/components/contexts/LanguageContext"

interface VendorSalesContentProps {
    sales: any[] | null
}

export function VendorSalesContent({ sales }: VendorSalesContentProps) {
    const { t } = useLanguage()

    const totalSales = sales?.length || 0
    const approvedSales = sales?.filter((s: any) => s.status === "approved").length || 0
    const pendingSales = sales?.filter((s: any) => s.status === "pending").length || 0
    const totalRevenue = sales?.reduce((sum: number, s: any) => sum + (parseFloat(s.sale_price) || 0), 0) || 0

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t("vendor.sales.list.title")}</h1>
                    <p className="text-sm text-muted-foreground mt-1">{t("vendor.sales.list.subtitle")}</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">{t("vendor.sales.list.stat.total")}</p>
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
                                <p className="text-xs text-muted-foreground mb-1">{t("vendor.sales.list.stat.approved")}</p>
                                <p className="text-2xl font-bold text-green-600">{approvedSales}</p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Info className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">{t("vendor.sales.list.stat.pending")}</p>
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
                                <p className="text-xs text-muted-foreground mb-1">{t("vendor.sales.list.stat.revenue")}</p>
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
                                        {t("vendor.sales.list.table.id")}
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
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("vendor.sales.list.table.product")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("vendor.sales.list.table.client")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("vendor.sales.list.table.imei")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("vendor.sales.list.table.price")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("vendor.sales.list.table.status")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("vendor.sales.list.table.date")}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                            {sales?.map((sale: any) => (
                                <tr key={sale.id} className="hover:bg-accent transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">{sale.sale_id}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="font-medium text-foreground">{sale.products?.sku}</div>
                                        <div className="text-xs text-muted-foreground mt-1">{sale.products?.name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium text-foreground">{sale.customer_name}</div>
                                                <div className="text-xs text-muted-foreground mt-1">{sale.customer_phone}</div>
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
                                            {sale.status === "approved"
                                                ? t("vendor.sales.list.status.approved")
                                                : sale.status === "rejected"
                                                    ? t("vendor.sales.list.status.rejected")
                                                    : t("vendor.sales.list.status.pending")}
                                        </Badge>
                                        {sale.status === "rejected" && sale.rejection_reason && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="w-4 h-4 text-red-500 mt-1 cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="max-w-xs">{sale.rejection_reason}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
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
                            <EmptyTitle>{t("vendor.sales.list.empty.title")}</EmptyTitle>
                            <EmptyDescription>{t("vendor.sales.list.empty.desc")}</EmptyDescription>
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
                                    {sale.status === "approved"
                                        ? t("vendor.sales.list.status.approved")
                                        : sale.status === "rejected"
                                            ? t("vendor.sales.list.status.rejected")
                                            : t("vendor.sales.list.status.pending")}
                                </Badge>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">{t("vendor.sales.list.table.product")}</div>
                                    <div className="font-medium text-foreground">{sale.products?.sku}</div>
                                    <div className="text-xs text-muted-foreground">{sale.products?.name}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">{t("vendor.sales.list.table.price")}</div>
                                    <div className="font-semibold text-foreground">RD${sale.sale_price}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">{t("vendor.sales.list.table.client")}</div>
                                    <div className="font-medium text-foreground">{sale.customer_name}</div>
                                    <div className="text-xs text-muted-foreground">{sale.customer_phone}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">{t("vendor.sales.list.table.imei")}</div>
                                    <div className="font-mono text-muted-foreground">***{sale.imei.slice(-4)}</div>
                                </div>
                            </div>
                            {sale.status === "rejected" && sale.rejection_reason && (
                                <>
                                    <Separator />
                                    <div className="pt-2">
                                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{sale.rejection_reason}</div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                ))}
                {(!sales || sales.length === 0) && (
                    <Empty className="py-12">
                        <EmptyMedia variant="icon">
                            <ShoppingCart className="w-12 h-12 text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyHeader>
                            <EmptyTitle>{t("vendor.sales.list.empty.title")}</EmptyTitle>
                            <EmptyDescription>{t("vendor.sales.list.empty.desc")}</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )}
            </div>
        </div>
    )
}
