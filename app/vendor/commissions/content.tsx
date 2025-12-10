"use client"

import { useState, useActionState, useEffect } from "react"
import { useLanguage } from "@/components/contexts/LanguageContext"
import { type Commission } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { createPaymentRequest } from "@/lib/actions/payment-requests"
import { toast } from "sonner"
import { DollarSign, Clock, CheckCircle2, AlertCircle } from "lucide-react"

interface VendorCommissionsContentProps {
    commissions: Commission[] | null
    pendingAmount: number
    paidAmount: number
    paymentRequest: any | null
}

export function VendorCommissionsContent({
    commissions,
    pendingAmount,
    paidAmount,
    paymentRequest,
}: VendorCommissionsContentProps) {
    const { t } = useLanguage()
    const initialState = { message: "", error: "", success: false }
    const [state, formAction, isPending] = useActionState(createPaymentRequest, initialState)

    useEffect(() => {
        if (state.success) {
            toast.success("Solicitud enviada", { description: state.message })
        } else if (state.error) {
            toast.error("Error", { description: state.error })
        }
    }, [state])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "paid":
                return {
                    label: "Pagado",
                    className: "bg-green-100 text-green-800 border-green-200",
                    icon: CheckCircle2
                }
            case "processing":
                return {
                    label: "En Proceso de Pago",
                    className: "bg-blue-100 text-blue-800 border-blue-200",
                    icon: Clock
                }
            case "pending":
            default:
                return {
                    label: "Pendiente",
                    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
                    icon: AlertCircle
                }
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t("vendor.commissions.title")}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t("vendor.commissions.subtitle")}</p>
            </div>

            {/* Payment Request Status Card */}
            {paymentRequest && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                                    Solicitud de Pago Activa
                                </h3>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-blue-700 dark:text-blue-300">Monto solicitado:</span>
                                    <span className="font-bold text-blue-900 dark:text-blue-100">
                                        RD${paymentRequest.amount.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-700 dark:text-blue-300">Estado:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentRequest.status === "approved"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                        }`}>
                                        {paymentRequest.status === "approved" ? "Aprobado" : "Pendiente de Aprobación"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-700 dark:text-blue-300">Solicitado:</span>
                                    <span className="text-blue-900 dark:text-blue-100">
                                        {new Date(paymentRequest.requested_at).toLocaleDateString("es-DO")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 p-6 rounded-xl shadow-sm border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">{t("vendor.commissions.pending")}</p>
                    <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">RD${pendingAmount.toFixed(2)}</p>

                    {/* Request Payment Button */}
                    {!paymentRequest && pendingAmount > 0 && (
                        <form action={formAction} className="mt-4">
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                            >
                                {isPending ? "Procesando..." : `Solicitar Pago`}
                            </Button>
                        </form>
                    )}
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-6 rounded-xl shadow-sm border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">{t("vendor.commissions.paid")}</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">RD${paidAmount.toFixed(2)}</p>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("vendor.commissions.table.sale_id")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("vendor.commissions.table.product")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("vendor.commissions.table.base_amount")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("vendor.commissions.table.commission")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("vendor.commissions.table.status")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("vendor.commissions.table.date")}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                            {commissions?.map((comm: any) => (
                                <tr key={comm.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">{comm.sales?.sale_id}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="font-medium text-foreground">{comm.products?.sku}</div>
                                        <div className="text-xs text-muted-foreground mt-1">{comm.products?.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">RD${comm.base_amount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-700">RD${comm.commission_amount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {(() => {
                                            const statusInfo = getStatusBadge(comm.status)
                                            const Icon = statusInfo.icon
                                            return (
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.className}`}>
                                                    <Icon className="w-3 h-3" />
                                                    {statusInfo.label}
                                                </span>
                                            )
                                        })()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{new Date(comm.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {(!commissions || commissions.length === 0) && (
                    <div className="p-12 text-center text-muted-foreground">
                        <p className="text-lg">{t("vendor.commissions.empty.title")}</p>
                        <p className="text-sm mt-2">{t("vendor.commissions.empty.desc")}</p>
                    </div>
                )}
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
                {commissions?.map((comm: any) => (
                    <div key={comm.id} className="bg-card rounded-xl shadow-sm border border-border p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-mono text-sm font-semibold text-foreground">{comm.sales?.sale_id}</div>
                                <div className="text-xs text-muted-foreground mt-1">{new Date(comm.created_at).toLocaleDateString()}</div>
                            </div>
                            {(() => {
                                const statusInfo = getStatusBadge(comm.status)
                                const Icon = statusInfo.icon
                                return (
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.className}`}>
                                        <Icon className="w-3 h-3" />
                                        {statusInfo.label}
                                    </span>
                                )
                            })()}
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <div className="text-xs text-muted-foreground">{t("vendor.commissions.table.product")}</div>
                                <div className="font-medium text-foreground mt-1">{comm.products?.sku}</div>
                                <div className="text-xs text-muted-foreground">{comm.products?.name}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">{t("vendor.commissions.table.base_amount")}</div>
                                <div className="font-medium text-foreground mt-1">RD${comm.base_amount}</div>
                            </div>
                            <div className="col-span-2 pt-2 border-t border-border">
                                <div className="text-xs text-muted-foreground">{t("vendor.commissions.table.commission")}</div>
                                <div className="font-semibold text-green-700 text-lg mt-1">RD${comm.commission_amount}</div>
                            </div>
                        </div>
                    </div>
                ))}
                {(!commissions || commissions.length === 0) && (
                    <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center text-muted-foreground">
                        <p className="text-lg">{t("vendor.commissions.empty.title")}</p>
                        <p className="text-sm mt-2">{t("vendor.commissions.empty.desc")}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
