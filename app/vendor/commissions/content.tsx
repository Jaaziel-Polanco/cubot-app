"use client"

import { useLanguage } from "@/components/contexts/LanguageContext"
import { type Commission } from "@/lib/types"

interface VendorCommissionsContentProps {
    commissions: Commission[] | null
    pendingAmount: number
    paidAmount: number
}

export function VendorCommissionsContent({
    commissions,
    pendingAmount,
    paidAmount,
}: VendorCommissionsContentProps) {
    const { t } = useLanguage()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t("vendor.commissions.title")}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t("vendor.commissions.subtitle")}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl shadow-sm border border-yellow-200">
                    <p className="text-sm font-medium text-yellow-800 mb-2">{t("vendor.commissions.pending")}</p>
                    <p className="text-3xl font-bold text-yellow-900">RD${pendingAmount.toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200">
                    <p className="text-sm font-medium text-green-800 mb-2">{t("vendor.commissions.paid")}</p>
                    <p className="text-3xl font-bold text-green-900">RD${paidAmount.toFixed(2)}</p>
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
                                        <span
                                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${comm.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                                }`}
                                        >
                                            {comm.status === "paid" ? t("vendor.commissions.paid") : comm.status.charAt(0).toUpperCase() + comm.status.slice(1)}
                                        </span>
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
                            <span
                                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${comm.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                    }`}
                            >
                                {comm.status}
                            </span>
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
