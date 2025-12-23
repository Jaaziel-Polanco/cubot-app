"use client"

import { useLanguage } from "@/components/contexts/LanguageContext"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, DollarSign, FileText, CheckCircle2, XCircle, Clock, FileImage, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"

interface VendorBankAccount {
    id: string
    account_number: string
    account_holder_name: string
    account_type: string
    banks: {
        name: string
    }
}

interface PaymentRequest {
    id: string
    amount: number
    commission_ids: string[]
    status: string
    receipt_url: string | null
    requested_at: string
    approved_at: string | null
    rejected_reason: string | null
    vendor_bank_accounts: VendorBankAccount | null
}

interface VendorPaymentsContentProps {
    requests: PaymentRequest[] | null
}

export function VendorPaymentsContent({ requests }: VendorPaymentsContentProps) {
    const { t } = useLanguage()
    const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null)
    const [signedUrl, setSignedUrl] = useState<string | null>(null)
    const [loadingReceipt, setLoadingReceipt] = useState(false)

    const openReceiptModal = async (receiptPath: string | null) => {
        if (!receiptPath) return
        setSelectedReceipt(receiptPath)
        setLoadingReceipt(true)
        setSignedUrl(null)

        try {
            const res = await fetch(`/api/storage/signed-url?path=${encodeURIComponent(receiptPath)}`)
            const data = await res.json()
            if (data.signedUrl) {
                setSignedUrl(data.signedUrl)
            }
        } catch (error) {
            console.error("Error fetching signed URL:", error)
        } finally {
            setLoadingReceipt(false)
        }
    }

    const closeReceiptModal = () => {
        setSelectedReceipt(null)
        setSignedUrl(null)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return { label: "Aprobado", className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2 }
            case "rejected":
                return { label: "Rechazado", className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400", icon: XCircle }
            case "paid":
                return { label: "Pagado", className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400", icon: CheckCircle2 }
            default:
                return { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock }
        }
    }

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
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fecha Solicitud</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Comisiones</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monto</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cuenta</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Comprobante</th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                            {requests?.map((request) => {
                                const statusInfo = getStatusBadge(request.status)
                                const StatusIcon = statusInfo.icon
                                return (
                                    <tr key={request.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                                {new Date(request.requested_at).toLocaleDateString("es-DO")}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-muted-foreground" />
                                                {request.commission_ids.length}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-700 dark:text-green-400">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" />
                                                RD${request.amount.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {request.vendor_bank_accounts ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-foreground font-medium text-xs">{request.vendor_bank_accounts.banks.name}</span>
                                                    <span className="text-muted-foreground font-mono text-xs">****{request.vendor_bank_accounts.account_number.slice(-4)}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant="outline" className={`border ${statusInfo.className}`}>
                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                {statusInfo.label}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {request.receipt_url ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openReceiptModal(request.receipt_url)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <FileImage className="w-4 h-4" />
                                                    Ver Comprobante
                                                </Button>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">-</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                {(!requests || requests.length === 0) && (
                    <div className="p-12 text-center text-muted-foreground">
                        <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">{t("vendor.payments.empty.title")}</p>
                        <p className="text-sm mt-2">{t("vendor.payments.empty.desc")}</p>
                    </div>
                )}
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
                {requests?.map((request) => {
                    const statusInfo = getStatusBadge(request.status)
                    const StatusIcon = statusInfo.icon
                    return (
                        <div key={request.id} className="bg-card rounded-xl shadow-sm border border-border p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        {new Date(request.requested_at).toLocaleDateString("es-DO")}
                                    </div>
                                </div>
                                <Badge variant="outline" className={`border ${statusInfo.className}`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusInfo.label}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t border-border">
                                <div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <FileText className="w-3 h-3" />
                                        Comisiones
                                    </div>
                                    <div className="font-medium text-foreground mt-1">{request.commission_ids.length}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" />
                                        Monto
                                    </div>
                                    <div className="font-semibold text-green-700 dark:text-green-400 text-lg mt-1">
                                        RD${request.amount.toFixed(2)}
                                    </div>
                                </div>
                                {request.vendor_bank_accounts && (
                                    <div className="col-span-2 mt-2 pt-2 border-t border-border">
                                        <div className="text-xs text-muted-foreground">Cuenta Bancaria</div>
                                        <div className="mt-1 space-y-0.5">
                                            <div className="text-sm font-medium text-foreground">{request.vendor_bank_accounts.banks.name}</div>
                                            <div className="font-mono text-xs text-muted-foreground">****{request.vendor_bank_accounts.account_number.slice(-4)}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {request.receipt_url && (
                                <div className="border-t border-border pt-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full flex items-center justify-center gap-2"
                                        onClick={() => openReceiptModal(request.receipt_url)}
                                    >
                                        <FileImage className="w-4 h-4" />
                                        Ver Comprobante de Pago
                                    </Button>
                                </div>
                            )}
                            {request.rejected_reason && (
                                <div className="border-t border-border pt-3">
                                    <p className="text-xs text-muted-foreground mb-1">Razón del rechazo:</p>
                                    <p className="text-sm text-red-600 dark:text-red-400">{request.rejected_reason}</p>
                                </div>
                            )}
                        </div>
                    )
                })}
                {(!requests || requests.length === 0) && (
                    <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center text-muted-foreground">
                        <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">{t("vendor.payments.empty.title")}</p>
                        <p className="text-sm mt-2">{t("vendor.payments.empty.desc")}</p>
                    </div>
                )}
            </div>

            {/* Receipt Image Modal */}
            <Dialog open={!!selectedReceipt} onOpenChange={closeReceiptModal}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Comprobante de Pago</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-4 min-h-[300px]">
                        {loadingReceipt ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                <p className="text-muted-foreground">Cargando comprobante...</p>
                            </div>
                        ) : signedUrl ? (
                            <img
                                src={signedUrl}
                                alt="Comprobante de pago"
                                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                            />
                        ) : (
                            <p className="text-muted-foreground">No se pudo cargar la imagen</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
