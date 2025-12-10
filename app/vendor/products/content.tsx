"use client"

import { useLanguage } from "@/components/contexts/LanguageContext"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Package, Info, TrendingUp } from "lucide-react"

interface VendorProductsContentProps {
    products: any[] | null
}

export function VendorProductsContent({ products }: VendorProductsContentProps) {
    const { t } = useLanguage()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t("vendor.products.title")}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t("vendor.products.subtitle")}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {products?.map((product) => {
                    const commissionAmount =
                        product.commission_amount > 0
                            ? product.commission_amount
                            : product.commission_percent > 0
                                ? (product.price * product.commission_percent) / 100
                                : 0

                    let commissionText = t("vendor.products.commission_none");
                    if (product.commission_amount > 0) {
                        commissionText = t("vendor.products.commission_fixed");
                    } else if (product.commission_percent > 0) {
                        commissionText = t("vendor.products.commission_percent").replace("{percent}", product.commission_percent.toString());
                    }

                    return (
                        <Card key={product.id} className="hover:shadow-lg transition-all duration-200 border-border">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Package className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{product.name}</CardTitle>
                                            <CardDescription className="mt-1 font-mono text-xs">{product.sku}</CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        {t("vendor.products.active")}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Separator />
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                                            {t("vendor.products.price")}
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info className="w-3 h-3 text-muted-foreground" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{t("vendor.products.price_tooltip")}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </span>
                                        <span className="font-semibold text-foreground text-lg">RD${product.price}</span>
                                    </div>
                                    <Separator />
                                    <div className="bg-linear-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-green-900 flex items-center gap-2">
                                                {t("vendor.products.your_commission")}
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Info className="w-3 h-3 text-green-600" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{commissionText}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </span>
                                            <TrendingUp className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold text-green-700">
                                                {product.commission_amount > 0
                                                    ? `RD$${product.commission_amount.toFixed(2)}`
                                                    : product.commission_percent > 0
                                                        ? `${product.commission_percent}%`
                                                        : "N/A"}
                                            </span>
                                            {product.commission_percent > 0 && (
                                                <span className="text-sm text-green-600">
                                                    (RD${commissionAmount.toFixed(2)})
                                                </span>
                                            )}
                                        </div>
                                        {product.commission_amount === 0 && product.commission_percent === 0 && (
                                            <p className="text-xs text-muted-foreground mt-1">{t("vendor.products.commission_none")}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
                {(!products || products.length === 0) && (
                    <div className="col-span-full">
                        <Empty className="py-12">
                            <EmptyMedia variant="icon">
                                <Package className="w-12 h-12 text-slate-400" />
                            </EmptyMedia>
                            <EmptyHeader>
                                <EmptyTitle>{t("vendor.products.empty.title")}</EmptyTitle>
                                <EmptyDescription>{t("vendor.products.empty.desc")}</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    </div>
                )}
            </div>
        </div>
    )
}
