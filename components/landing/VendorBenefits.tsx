"use client"

import { motion } from "framer-motion"
import { CheckCircle2, TrendingUp, Users, ShieldCheck, Truck, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLanding } from "./LandingContext"

const benefits = [
    {
        icon: TrendingUp,
        title: "vendor.card.margins",
        description: "vendor.card.margins.desc",
    },
    {
        icon: Users,
        title: "vendor.card.community",
        description: "vendor.card.community.desc",
    },
    {
        icon: ShieldCheck,
        title: "vendor.card.quality",
        description: "vendor.card.quality.desc",
    },
]

const listItems = [
    "vendor.benefit.1",
    "vendor.benefit.2",
    "vendor.benefit.3",
    "vendor.benefit.4",
    "vendor.benefit.5",
]

export function VendorBenefits() {
    const { t } = useLanding()

    return (
        <section id="vendors" className="py-24 bg-secondary/30">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            {t("vendor.title")} <span className="text-primary">CUBOT</span>
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            {t("vendor.subtitle")}
                        </p>

                        <ul className="space-y-4 mb-8">
                            {listItems.map((item, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 shrink-0">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <span>{t(item)}</span>
                                </motion.li>
                            ))}
                        </ul>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" className="text-lg px-8" asChild>
                                <Link href="#register">{t("vendor.cta")}</Link>
                            </Button>
                            <Button variant="outline" size="lg" className="text-lg px-8" asChild>
                                <Link href="/auth/login">{t("vendor.login")}</Link>
                            </Button>
                        </div>
                    </motion.div>

                    <div className="grid gap-6">
                        {benefits.map((benefit, index) => {
                            const Icon = benefit.icon
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.2 }}
                                    className="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">{t(benefit.title)}</h3>
                                            <p className="text-muted-foreground">
                                                {t(benefit.description)}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
