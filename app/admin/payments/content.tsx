"use client"

import { useState, useActionState, useEffect } from "react"
import { useLanguage } from "@/components/contexts/LanguageContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { approvePaymentRequest, rejectPaymentRequest } from "@/lib/actions/payment-requests"
import { DollarSign, User, Calendar, FileImage, CheckCircle2, XCircle, Clock, AlertCircle, Upload, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

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
        bank_account: string | null
    }
}

interface AdminPaymentsContentProps {
    requests: PaymentRequest[] | null
    pendingCount: number
    approvedCount: number
    totalPending: number
}

export function AdminPaymentsContent({ requests, pendingCount, approvedCount, totalPending }: AdminPaymentsContentProps) {
    const { t } = useLanguage()
    const router = useRouter()
    const [showApproveDialog, setShowApproveDialog] = useState(false)
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null)
    const [rejectReason, setRejectReason] = useState("")

    const initialState = { message: "", error: "", success: false }
    const [approveState, approveFormAction, isApprovePending] = useActionState(approvePaymentRequest, initialState)
    const [rejectState, rejectFormAction, isRejectPending] = useActionState(rejectPaymentRequest, initialState)

    useEffect(() => {
        if (approveState.success) {
            toast.success("Solicitud aprobada", { description: approveState.message })
            setShowApproveDialog(false)
            setSelectedRequest(null)
            router.refresh()
        } else if (approveState.error) {
            toast.error("Error", { description: approveState.error })
        }
    }, [approveState, router])

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
                {requests && requests.length > 0 ? (
                    requests.map((request) => {
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
                                                    {request.users.bank_account && (
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Cuenta: {request.users.bank_account}
                                                        </p>
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
                                                    <div>
                                                        <p className="text-muted-foreground flex items-center gap-1">
                                                            <FileImage className="w-3 h-3" />
                                                            Comprobante
                                                        </p>
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            className="h-auto p-0 text-blue-600"
                                                            asChild
                                                        >
                                                            <a href={request.receipt_url} target="_blank" rel="noopener noreferrer">
                                                                Ver <ExternalLink className="w-3 h-3 ml-1" />
                                                            </a>
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
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Aprobar Solicitud de Pago</DialogTitle>
                                                            <DialogDescription>
                                                                Aprueba el pago de RD${request.amount.toFixed(2)} para {request.users.name}
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <form action={approveFormAction}>
                                                            <input type="hidden" name="requestId" value={request.id} />
                                                            <div className="space-y-4 py-4">
                                                                <div>
                                                                    <Label htmlFor="receipt">Comprobante de Pago (opcional)</Label>
                                                                    <Input
                                                                        id="receipt"
                                                                        name="receipt"
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="mt-2"
                                                                    />
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        Sube una imagen del boucher/comprobante de transferencia
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <DialogFooter>
                                                                <Button type="button" variant="outline" onClick={() => setShowApproveDialog(false)}>
                                                                    Cancelar
                                                                </Button>
                                                                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isApprovePending}>
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
        </div>
    )
}
