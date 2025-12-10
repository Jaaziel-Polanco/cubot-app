"use client"

import { useLanguage } from "@/components/contexts/LanguageContext"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, User, Package, Smartphone, DollarSign, Mail, Phone, ImageIcon, FileCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ValidationActions } from "./actions"

interface AdminValidationContentProps {
    pendingSales: any[]
}

export function AdminValidationContent({ pendingSales }: AdminValidationContentProps) {
    const { t } = useLanguage()

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{t("admin.validation.title")}</h1>
                    <p className="text-sm text-muted-foreground mt-1">{t("admin.validation.subtitle")}</p>
                </div>
                <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-indigo-50 text-indigo-700 border-indigo-200">
                    {t("admin.validation.pending_badge").replace("{count}", (pendingSales?.length || 0).toString())}
                </Badge>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {pendingSales?.map((sale: any) => (
                    <Card key={sale.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-yellow-400">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
                                            {sale.sale_id}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(sale.sale_date).toLocaleDateString("es-DO", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>
                                    <CardTitle className="text-lg font-semibold text-foreground">{sale.products?.name}</CardTitle>
                                </div>
                                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200 shadow-none">
                                    {t("admin.sales.status.pending")}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                            {t("admin.validation.card.info_title")}
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                                                <User className="w-4 h-4 text-muted-foreground" />
                                                <div className="flex-1">
                                                    <p className="text-xs text-muted-foreground">{t("admin.validation.card.vendor")}</p>
                                                    <p className="font-medium text-sm text-foreground">{sale.users?.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                                                <Package className="w-4 h-4 text-muted-foreground" />
                                                <div className="flex-1">
                                                    <p className="text-xs text-muted-foreground">{t("admin.validation.card.product")}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm text-foreground">{sale.products?.name}</span>
                                                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-card border">
                                                            {sale.products?.category}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                                                <Smartphone className="w-4 h-4 text-muted-foreground" />
                                                <div className="flex-1">
                                                    <p className="text-xs text-muted-foreground">{t("admin.validation.card.imei")}</p>
                                                    <p className="font-mono font-medium text-sm text-foreground">{sale.imei}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                                                <DollarSign className="w-4 h-4 text-emerald-600" />
                                                <div className="flex-1">
                                                    <p className="text-xs text-emerald-600 font-medium">{t("admin.validation.card.price")}</p>
                                                    <p className="font-bold text-lg text-emerald-700">RD${sale.sale_price}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                            {t("admin.validation.card.customer_title")}
                                        </h4>
                                        <div className="space-y-3">
                                            {sale.customer_name && (
                                                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                                                    <User className="w-4 h-4 text-muted-foreground" />
                                                    <div className="flex-1">
                                                        <p className="text-xs text-muted-foreground">{t("admin.validation.card.customer_name")}</p>
                                                        <p className="font-medium text-sm text-foreground">{sale.customer_name}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {(sale.customer_phone || sale.customer_email) && (
                                                <div className="grid grid-cols-1 gap-2">
                                                    {sale.customer_phone && (
                                                        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                                            <div className="flex-1">
                                                                <p className="text-xs text-muted-foreground">{t("admin.validation.card.customer_phone")}</p>
                                                                <p className="font-medium text-sm text-foreground">{sale.customer_phone}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {sale.customer_email && (
                                                        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                                            <div className="flex-1">
                                                                <p className="text-xs text-muted-foreground">{t("admin.validation.card.customer_email")}</p>
                                                                <p className="font-medium text-sm text-foreground truncate max-w-[200px]" title={sale.customer_email}>
                                                                    {sale.customer_email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="w-full h-auto py-3">
                                                    <ImageIcon className="w-4 h-4 mr-2" />
                                                    {t("admin.validation.card.view_evidence")}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-3xl">
                                                <DialogHeader>
                                                    <DialogTitle>{t("admin.validation.card.view_evidence")}</DialogTitle>
                                                </DialogHeader>
                                                {sale.invoice_url ? (
                                                    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={sale.invoice_url}
                                                            alt="Evidence"
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center p-12 text-muted-foreground bg-muted/50 rounded-lg">
                                                        <ImageIcon className="w-12 h-12 mb-3 opacity-50" />
                                                        <p>No evidence image available</p>
                                                    </div>
                                                )}
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            <ValidationActions saleId={sale.id} />
                        </CardContent>
                    </Card>
                ))}
                {(!pendingSales || pendingSales.length === 0) && (
                    <div className="col-span-full">
                        <Empty className="py-16 bg-card border border-border rounded-xl shadow-xs">
                            <EmptyMedia variant="icon" className="mb-6">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                                </div>
                            </EmptyMedia>
                            <EmptyHeader>
                                <EmptyTitle className="text-xl">{t("admin.validation.empty.title")}</EmptyTitle>
                                <EmptyDescription className="text-lg mt-2">
                                    {t("admin.validation.empty.desc")}
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    </div>
                )}
            </div>
        </div>
    )
}
