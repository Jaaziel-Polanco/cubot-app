"use client"

import { useLanguage } from "@/components/contexts/LanguageContext"

interface VendorPaymentsContentProps {
    batches: any[]
}

export function VendorPaymentsContent({ batches }: VendorPaymentsContentProps) {
    const { t } = useLanguage()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t("vendor.payments.title")}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t("vendor.payments.subtitle")}</p>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("vendor.payments.table.batch_id")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("vendor.payments.table.commissions")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("vendor.payments.table.amount")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("vendor.payments.table.status")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("vendor.payments.table.date")}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                            {batches.map((batch: any) => (
                                <tr key={batch.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">{batch.batch_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{batch.vendor_count}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-700">RD${batch.vendor_amount.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${batch.status === "processed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                                }`}
                                        >
                                            {batch.status === "processed" ? "Procesado" : batch.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{new Date(batch.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {batches.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        <p className="text-lg">{t("vendor.payments.empty.title")}</p>
                        <p className="text-sm mt-2">{t("vendor.payments.empty.desc")}</p>
                    </div>
                )}
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
                {batches.map((batch: any) => (
                    <div key={batch.id} className="bg-card rounded-xl shadow-sm border border-border p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-mono text-sm font-semibold text-foreground">{batch.batch_id}</div>
                                <div className="text-xs text-muted-foreground mt-1">{new Date(batch.created_at).toLocaleDateString()}</div>
                            </div>
                            <span
                                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${batch.status === "processed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                    }`}
                            >
                                {batch.status}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t border-border">
                            <div>
                                <div className="text-xs text-muted-foreground">{t("vendor.payments.table.commissions")}</div>
                                <div className="font-medium text-foreground mt-1">{batch.vendor_count}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">{t("vendor.payments.table.amount")}</div>
                                <div className="font-semibold text-green-700 text-lg mt-1">RD${batch.vendor_amount.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                ))}
                {batches.length === 0 && (
                    <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center text-muted-foreground">
                        <p className="text-lg">{t("vendor.payments.empty.title")}</p>
                        <p className="text-sm mt-2">{t("vendor.payments.empty.desc")}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
