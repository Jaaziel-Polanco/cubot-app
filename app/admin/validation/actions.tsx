"use client"

import { useState, useActionState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { CheckCircle2, XCircle } from "lucide-react"
import { validateSale } from "@/lib/actions/sales"
import { useLanguage } from "@/components/contexts/LanguageContext"

const initialState = {
    message: "",
    error: "",
    success: false
}

export function ValidationActions({ saleId }: { saleId: string }) {
    const [state, formAction, isPending] = useActionState(validateSale, initialState)
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [reason, setReason] = useState("")
    const router = useRouter()
    const { t } = useLanguage()

    useEffect(() => {
        if (state.success) {
            toast.success(t("common.success"), { description: state.message || t("common.success") })
            setShowRejectDialog(false)
            setReason("")
            router.refresh()
        } else if (state.error) {
            toast.error(t("common.error"), { description: state.error })
        }
    }, [state, router, t])

    const [showApproveDialog, setShowApproveDialog] = useState(false)
    const approveFormRef = useRef<HTMLFormElement>(null)

    const handleApprove = () => {
        if (approveFormRef.current) {
            setShowApproveDialog(false)
            // Submit form after dialog closes
            setTimeout(() => {
                approveFormRef.current?.requestSubmit()
            }, 100)
        }
    }

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            {/* Approve Action */}
            <form ref={approveFormRef} action={formAction}>
                <input type="hidden" name="saleId" value={saleId} />
                <input type="hidden" name="action" value="approve" />
                <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                    <AlertDialogTrigger asChild>
                        <Button variant="default" className="bg-green-600 hover:bg-green-700" disabled={isPending}>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {t("admin.users.actions.approve")}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t("admin.users.actions.approve")}?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción aprobará la venta y calculará automáticamente la comisión para el vendedor.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isPending}>{t("admin.users.dialog.cancel")}</AlertDialogCancel>
                            <Button
                                onClick={handleApprove}
                                className="bg-green-600 hover:bg-green-700"
                                disabled={isPending}
                            >
                                {isPending ? t("admin.products.form.save_loading") : t("admin.users.actions.approve")}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </form>

            {/* Reject Action */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogTrigger asChild>
                    <Button variant="destructive" disabled={isPending}>
                        <XCircle className="w-4 h-4 mr-2" />
                        {t("admin.users.actions.reject")}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("admin.users.dialog.reject_title")}</DialogTitle>
                        <DialogDescription>
                            {t("admin.users.dialog.reject_desc").replace("{name}", t("admin.validation.card.vendor"))}
                        </DialogDescription>
                    </DialogHeader>

                    <form action={formAction}>
                        <input type="hidden" name="saleId" value={saleId} />
                        <input type="hidden" name="action" value="reject" />

                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="rejection-reason">{t("admin.users.dialog.reject_reason")} *</Label>
                                <Textarea
                                    id="rejection-reason"
                                    name="reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder={t("admin.users.dialog.reject_placeholder")}
                                    rows={4}
                                    className="mt-2"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isPending}>
                                {t("admin.users.dialog.cancel")}
                            </Button>
                            <Button type="submit" variant="destructive" disabled={isPending || !reason.trim()}>
                                {isPending ? t("admin.products.form.save_loading") : t("admin.users.dialog.confirm_reject")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
