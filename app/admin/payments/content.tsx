"use client"

import { useState, useActionState, useEffect, useRef } from "react"
import { useLanguage } from "@/components/contexts/LanguageContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { approvePaymentRequest, rejectPaymentRequest } from "@/lib/actions/payment-requests"
import { DollarSign, User, Calendar, FileImage, CheckCircle2, XCircle, Clock, AlertCircle, Upload, ExternalLink, Building2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface VendorBankAccount {
    id: string
    vendor_id: string
    account_number: string
    account_holder_name: string
    account_type: string
    is_primary: boolean
    banks: {
        name: string
    }
}

interface PaymentRequest {
    id: string
    vendor_id: string
    amount: number
    commission_ids: string[]
    status: string
    receipt_url: string | null
    requested_at: string
    approved_at: string | null
    paid_at: string | null
    notes: string | null
    rejected_reason: string | null
    users: {
        name: string
        vendor_id: string | null
        phone: string | null
        email: string | null
    }
    vendor_bank_accounts: VendorBankAccount | null
}

interface AdminPaymentsContentProps {
    requests: PaymentRequest[] | null
    vendorBankAccounts: VendorBankAccount[] | null
    pendingCount: number
    approvedCount: number
    totalPending: number
}

export function AdminPaymentsContent({ requests, vendorBankAccounts, pendingCount, approvedCount, totalPending }: AdminPaymentsContentProps) {
    const { t } = useLanguage()
    const router = useRouter()
    const [showApproveDialog, setShowApproveDialog] = useState(false)
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null)
    const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>("")
    const [rejectReason, setRejectReason] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [receiptFile, setReceiptFile] = useState<File | null>(null)
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
    const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null)
    const [signedUrl, setSignedUrl] = useState<string | null>(null)
    const [loadingReceipt, setLoadingReceipt] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const itemsPerPage = 10

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

    const initialState = { message: "", error: "", success: false }
    const [approveState, approveFormAction, isApprovePending] = useActionState(approvePaymentRequest, initialState)
    const [rejectState, rejectFormAction, isRejectPending] = useActionState(rejectPaymentRequest, initialState)

    // Filter requests based on search query
    const filteredRequests = requests?.filter((request) => {
        if (!searchQuery.trim()) return true
        const query = searchQuery.toLowerCase()
        return (
            request.users.name.toLowerCase().includes(query) ||
            request.users.vendor_id?.toLowerCase().includes(query) ||
            request.users.email?.toLowerCase().includes(query) ||
            request.users.phone?.toLowerCase().includes(query) ||
            request.amount.toString().includes(query)
        )
    })

    // Pagination calculations
    const totalPages = Math.ceil((filteredRequests?.length || 0) / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedRequests = filteredRequests?.slice(startIndex, endIndex)

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

    useEffect(() => {
        if (approveState.success) {
            toast.success("Solicitud aprobada", { description: approveState.message })
            setShowApproveDialog(false)
            setSelectedRequest(null)
            setSelectedBankAccountId("")
            setReceiptFile(null)
            setReceiptPreview(null)
            router.refresh()
        } else if (approveState.error) {
            toast.error("Error", { description: approveState.error })
        }
    }, [approveState, router])

    // Handle file selection with preview
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setReceiptFile(file)
            setReceiptPreview(URL.createObjectURL(file))
        }
    }

    // Clear selected file
    const clearReceiptFile = () => {
        setReceiptFile(null)
        setReceiptPreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    useEffect(() => {
        if (rejectState.success) {
            toast.success("Solicitud rechazada", { description: rejectState.message })
            setShowRejectDialog(false)
            setSelectedRequest(null)
            setRejectReason("")
            router.refresh()
        } else if (rejectState.error) {
            toast.error("Error", { description: rejectState.error })
        }
    }, [rejectState, router])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return { label: "Aprobado", className: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 }
            case "rejected":
                return { label: "Rechazado", className: "bg-red-100 text-red-800 border-red-200", icon: XCircle }
            case "paid":
                return { label: "Pagado", className: "bg-blue-100 text-blue-800 border-blue-200", icon: CheckCircle2 }
            default:
                return { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock }
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Solicitudes de Pago</h1>
                <p className="text-sm text-muted-foreground mt-1">Gestiona las solicitudes de pago de comisiones de vendedores</p>
            </div>

            {/* Search Filter */}
            <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Input
                    type="text"
                    placeholder="Buscar por nombre, ID, email, teléfono o monto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Solicitudes Pendientes</p>
                                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                            </div>
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Aprobadas</p>
                                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Total Pendiente</p>
                                <p className="text-2xl font-bold text-purple-600">RD${totalPending.toFixed(2)}</p>
                            </div>
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <DollarSign className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Requests List */}
            <div className="space-y-4">
                {paginatedRequests && paginatedRequests.length > 0 ? (
                    paginatedRequests.map((request) => {
                        const statusInfo = getStatusBadge(request.status)
                        const StatusIcon = statusInfo.icon

                        return (
                            <Card key={request.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-muted-foreground" />
                                                        <span className="font-semibold text-foreground">{request.users.name}</span>
                                                        {request.users.vendor_id && (
                                                            <span className="text-xs text-muted-foreground font-mono">
                                                                ({request.users.vendor_id})
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-2 space-y-1">
                                                        {request.users.phone && (
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                </svg>
                                                                <span>{request.users.phone}</span>
                                                            </div>
                                                        )}
                                                        {request.users.email && (
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                </svg>
                                                                <span>{request.users.email}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {request.vendor_bank_accounts && (
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                                                            <Building2 className="w-3 h-3" />
                                                            <span>
                                                                {request.vendor_bank_accounts.banks.name} - {request.vendor_bank_accounts.account_type} - ****{request.vendor_bank_accounts.account_number.slice(-4)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <Badge variant="outline" className={`border ${statusInfo.className}`}>
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {statusInfo.label}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Monto</p>
                                                    <p className="font-bold text-lg text-foreground">RD${request.amount.toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Comisiones</p>
                                                    <p className="font-semibold text-foreground">{request.commission_ids.length}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        Solicitado
                                                    </p>
                                                    <p className="font-semibold text-foreground">
                                                        {new Date(request.requested_at).toLocaleDateString("es-DO")}
                                                    </p>
                                                </div>
                                                {request.receipt_url && (
                                                    <div className="col-span-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openReceiptModal(request.receipt_url)}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <FileImage className="w-4 h-4" />
                                                            Ver Comprobante
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {request.status === "pending" && (
                                            <div className="flex gap-2">
                                                <Dialog open={showApproveDialog && selectedRequest?.id === request.id} onOpenChange={(open) => {
                                                    setShowApproveDialog(open)
                                                    if (!open) setSelectedRequest(null)
                                                }}>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="default"
                                                            className="bg-green-600 hover:bg-green-700"
                                                            onClick={() => setSelectedRequest(request)}
                                                        >
                                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                                            Aprobar
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl">
                                                        <DialogHeader>
                                                            <DialogTitle>Aprobar Solicitud de Pago</DialogTitle>
                                                            <DialogDescription>
                                                                Aprueba el pago de RD${request.amount.toFixed(2)} para {request.users.name}
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <form action={(formData) => {
                                                            if (receiptFile) {
                                                                formData.append("receipt", receiptFile)
                                                            }
                                                            approveFormAction(formData)
                                                        }}>
                                                            <input type="hidden" name="requestId" value={request.id} />
                                                            <input type="hidden" name="vendorBankAccountId" value={selectedBankAccountId} />
                                                            <div className="space-y-4 py-4">
                                                                <div>
                                                                    <Label htmlFor="bankAccount">Cuenta Bancaria del Vendor *</Label>
                                                                    <Select value={selectedBankAccountId} onValueChange={setSelectedBankAccountId} required>
                                                                        <SelectTrigger className="mt-2">
                                                                            <SelectValue placeholder="Selecciona una cuenta..." />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {vendorBankAccounts
                                                                                ?.filter((acc) => acc.vendor_id === request.vendor_id)
                                                                                .map((account) => (
                                                                                    <SelectItem key={account.id} value={account.id}>
                                                                                        <div className="flex items-center gap-2">
                                                                                            <Building2 className="w-4 h-4" />
                                                                                            {account.banks.name} - {account.account_type} - ****{account.account_number.slice(-4)}
                                                                                            {account.is_primary && " (Principal)"}
                                                                                        </div>
                                                                                    </SelectItem>
                                                                                ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        Selecciona la cuenta bancaria a la que se enviará el pago
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <Label htmlFor="receipt">Comprobante de Pago (opcional)</Label>

                                                                    {receiptPreview ? (
                                                                        <div className="mt-2 relative inline-block">
                                                                            <img
                                                                                src={receiptPreview}
                                                                                alt="Preview del comprobante"
                                                                                className="max-w-[200px] max-h-[150px] object-contain rounded-lg border border-border"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={clearReceiptFile}
                                                                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md"
                                                                            >
                                                                                <XCircle className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <Input
                                                                            ref={fileInputRef}
                                                                            id="receipt"
                                                                            type="file"
                                                                            accept="image/*"
                                                                            className="mt-2"
                                                                            onChange={handleFileChange}
                                                                        />
                                                                    )}

                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        Sube una imagen del boucher/comprobante de transferencia
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <DialogFooter>
                                                                <Button type="button" variant="outline" onClick={() => setShowApproveDialog(false)}>
                                                                    Cancelar
                                                                </Button>
                                                                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isApprovePending || !selectedBankAccountId}>
                                                                    {isApprovePending ? "Procesando..." : "Confirmar Aprobación"}
                                                                </Button>
                                                            </DialogFooter>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>

                                                <Dialog open={showRejectDialog && selectedRequest?.id === request.id} onOpenChange={(open) => {
                                                    setShowRejectDialog(open)
                                                    if (!open) {
                                                        setSelectedRequest(null)
                                                        setRejectReason("")
                                                    }
                                                }}>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() => setSelectedRequest(request)}
                                                        >
                                                            <XCircle className="w-4 h-4 mr-2" />
                                                            Rechazar
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Rechazar Solicitud</DialogTitle>
                                                            <DialogDescription>
                                                                Rechaza la solicitud de pago de {request.users.name}
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <form action={(formData) => {
                                                            formData.append("requestId", request.id)
                                                            formData.append("reason", rejectReason)
                                                            rejectFormAction(formData)
                                                        }}>
                                                            <div className="space-y-4 py-4">
                                                                <div>
                                                                    <Label htmlFor="reason">Razón del Rechazo *</Label>
                                                                    <Textarea
                                                                        id="reason"
                                                                        value={rejectReason}
                                                                        onChange={(e) => setRejectReason(e.target.value)}
                                                                        placeholder="Explica por qué se rechaza esta solicitud..."
                                                                        rows={4}
                                                                        className="mt-2"
                                                                        required
                                                                    />
                                                                </div>
                                                            </div>
                                                            <DialogFooter>
                                                                <Button type="button" variant="outline" onClick={() => setShowRejectDialog(false)}>
                                                                    Cancelar
                                                                </Button>
                                                                <Button
                                                                    type="submit"
                                                                    variant="destructive"
                                                                    disabled={!rejectReason.trim() || isRejectPending}
                                                                >
                                                                    {isRejectPending ? "Procesando..." : "Confirmar Rechazo"}
                                                                </Button>
                                                            </DialogFooter>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center text-muted-foreground">
                            <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No hay solicitudes de pago</p>
                            <p className="text-sm mt-2">Las solicitudes aparecerán aquí cuando los vendedores las envíen</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="text-sm text-muted-foreground">
                        Mostrando {startIndex + 1} - {Math.min(endIndex, filteredRequests?.length || 0)} de {filteredRequests?.length || 0} solicitudes
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                // Show first page, last page, current page, and pages around current
                                if (
                                    page === 1 ||
                                    page === totalPages ||
                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                ) {
                                    return (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setCurrentPage(page)}
                                            className="w-9"
                                        >
                                            {page}
                                        </Button>
                                    )
                                } else if (page === currentPage - 2 || page === currentPage + 2) {
                                    return <span key={page} className="px-2">...</span>
                                }
                                return null
                            })}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            )}

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
