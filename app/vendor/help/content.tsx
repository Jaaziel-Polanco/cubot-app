"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useLanguage } from "@/components/contexts/LanguageContext"
import { HelpCircle, Rocket, ShoppingCart, Fingerprint, DollarSign, UserCheck, Building2, Bell, AlertCircle } from "lucide-react"

export function HelpContent() {
    const { t } = useLanguage()

    const categories = [
        {
            id: "getting-started",
            icon: Rocket,
            iconColor: "text-blue-600",
            bgColor: "bg-blue-600/10",
            titleKey: "vendor.help.getting_started.title",
            questions: [
                { q: "vendor.help.getting_started.q1", a: "vendor.help.getting_started.a1" },
                { q: "vendor.help.getting_started.q2", a: "vendor.help.getting_started.a2" },
                { q: "vendor.help.getting_started.q3", a: "vendor.help.getting_started.a3" },
            ],
        },
        {
            id: "sales",
            icon: ShoppingCart,
            iconColor: "text-green-600",
            bgColor: "bg-green-600/10",
            titleKey: "vendor.help.sales.title",
            questions: [
                { q: "vendor.help.sales.q1", a: "vendor.help.sales.a1" },
                { q: "vendor.help.sales.q2", a: "vendor.help.sales.a2" },
                { q: "vendor.help.sales.q3", a: "vendor.help.sales.a3" },
                { q: "vendor.help.sales.q4", a: "vendor.help.sales.a4" },
            ],
        },
        {
            id: "imei",
            icon: Fingerprint,
            iconColor: "text-purple-600",
            bgColor: "bg-purple-600/10",
            titleKey: "vendor.help.imei.title",
            questions: [
                { q: "vendor.help.imei.q1", a: "vendor.help.imei.a1" },
                { q: "vendor.help.imei.q2", a: "vendor.help.imei.a2" },
                { q: "vendor.help.imei.q3", a: "vendor.help.imei.a3" },
            ],
        },
        {
            id: "commissions",
            icon: DollarSign,
            iconColor: "text-yellow-600",
            bgColor: "bg-yellow-600/10",
            titleKey: "vendor.help.commissions.title",
            questions: [
                { q: "vendor.help.commissions.q1", a: "vendor.help.commissions.a1" },
                { q: "vendor.help.commissions.q2", a: "vendor.help.commissions.a2" },
                { q: "vendor.help.commissions.q3", a: "vendor.help.commissions.a3" },
                { q: "vendor.help.commissions.q4", a: "vendor.help.commissions.a4" },
            ],
        },
        {
            id: "kyc",
            icon: UserCheck,
            iconColor: "text-indigo-600",
            bgColor: "bg-indigo-600/10",
            titleKey: "vendor.help.kyc.title",
            questions: [
                { q: "vendor.help.kyc.q1", a: "vendor.help.kyc.a1" },
                { q: "vendor.help.kyc.q2", a: "vendor.help.kyc.a2" },
                { q: "vendor.help.kyc.q3", a: "vendor.help.kyc.a3" },
                { q: "vendor.help.kyc.q4", a: "vendor.help.kyc.a4" },
            ],
        },
        {
            id: "bank",
            icon: Building2,
            iconColor: "text-cyan-600",
            bgColor: "bg-cyan-600/10",
            titleKey: "vendor.help.bank.title",
            questions: [
                { q: "vendor.help.bank.q1", a: "vendor.help.bank.a1" },
                { q: "vendor.help.bank.q2", a: "vendor.help.bank.a2" },
                { q: "vendor.help.bank.q3", a: "vendor.help.bank.a3" },
            ],
        },
        {
            id: "notifications",
            icon: Bell,
            iconColor: "text-orange-600",
            bgColor: "bg-orange-600/10",
            titleKey: "vendor.help.notifications.title",
            questions: [
                { q: "vendor.help.notifications.q1", a: "vendor.help.notifications.a1" },
                { q: "vendor.help.notifications.q2", a: "vendor.help.notifications.a2" },
            ],
        },
        {
            id: "troubleshooting",
            icon: AlertCircle,
            iconColor: "text-red-600",
            bgColor: "bg-red-600/10",
            titleKey: "vendor.help.troubleshooting.title",
            questions: [
                { q: "vendor.help.troubleshooting.q1", a: "vendor.help.troubleshooting.a1" },
                { q: "vendor.help.troubleshooting.q2", a: "vendor.help.troubleshooting.a2" },
                { q: "vendor.help.troubleshooting.q3", a: "vendor.help.troubleshooting.a3" },
                { q: "vendor.help.troubleshooting.q4", a: "vendor.help.troubleshooting.a4" },
            ],
        },
    ]

    return (
        <div className="space-y-6 sm:space-y-8 container-padding section-spacing">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl glass-card border-primary/20 p-6 sm:p-8">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-purple-500/10 animate-gradient bg-[length:200%_200%]" />
                <div className="relative flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                        <HelpCircle className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
                            {t("vendor.help.title")}
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1">
                            {t("vendor.help.subtitle")}
                        </p>
                    </div>
                </div>
            </div>

            {/* FAQ Categories */}
            <div className="space-y-6">
                {categories.map((category, index) => {
                    const Icon = category.icon
                    return (
                        <Card key={category.id} className="glass-card border-primary/10 hover-lift">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${category.bgColor}`}>
                                        <Icon className={`w-5 h-5 ${category.iconColor}`} />
                                    </div>
                                    {t(category.titleKey)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {category.questions.map((item, qIndex) => (
                                        <AccordionItem key={`${category.id}-${qIndex}`} value={`${category.id}-${qIndex}`}>
                                            <AccordionTrigger className="text-left hover:text-primary">
                                                {t(item.q)}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-muted-foreground">
                                                {t(item.a)}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Contact Support Card */}
            <Card className="glass-card border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-primary" />
                        {t("vendor.help.contact.title")}
                    </CardTitle>
                    <CardDescription>{t("vendor.help.contact.desc")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {t("vendor.help.contact.info")}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
