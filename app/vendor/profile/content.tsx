"use client"

import { useLanguage } from "@/components/contexts/LanguageContext"
import ProfileForm from "./profile-form"
import BankAccountsForm from "./bank-accounts-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { User } from "@/lib/types"

interface VendorProfileContentProps {
    profile: User
    userEmail: string
}

export function VendorProfileContent({ profile, userEmail }: VendorProfileContentProps) {
    const { t } = useLanguage()

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "active": return t("vendor.profile.status.active")
            case "suspended": return t("vendor.profile.status.suspended")
            case "approved": return t("vendor.profile.status.approved")
            case "rejected": return t("vendor.profile.status.rejected")
            case "pending": return t("vendor.profile.status.pending")
            default: return status
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">{t("vendor.profile.title")}</h1>
                <p className="text-sm text-slate-600 mt-1">{t("vendor.profile.subtitle")}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProfileForm profile={profile} />

                <Card>
                    <CardHeader>
                        <CardTitle>{t("vendor.profile.details.status")}</CardTitle>
                        <CardDescription>{t("vendor.profile.subtitle")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground font-medium">{t("vendor.profile.details.vendor_id")}:</span>
                                <span className="font-mono font-semibold">{profile?.vendor_id || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground font-medium">{t("vendor.profile.details.email")}:</span>
                                <span>{userEmail}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground font-medium">{t("vendor.profile.details.status")}:</span>
                                <span
                                    className={`px-2 py-1 rounded text-xs ${profile?.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                        }`}
                                >
                                    {getStatusLabel(profile?.status)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-slate-600 font-medium">{t("vendor.profile.details.kyc_status")}:</span>
                                <span
                                    className={`px-2 py-1 rounded text-xs ${profile?.kyc_status === "approved"
                                        ? "bg-green-100 text-green-800"
                                        : profile?.kyc_status === "rejected"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-yellow-100 text-yellow-800"
                                        }`}
                                >
                                    {getStatusLabel(profile?.kyc_status)}
                                </span>
                            </div>
                            {profile?.identification_number && (
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-slate-600 font-medium">{t("vendor.profile.details.id_number")}:</span>
                                    <span className="font-mono">{profile.identification_number}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t("vendor.bank.title")}</CardTitle>
                    <CardDescription>{t("vendor.bank.subtitle")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <BankAccountsForm />
                </CardContent>
            </Card>
        </div>
    )
}
