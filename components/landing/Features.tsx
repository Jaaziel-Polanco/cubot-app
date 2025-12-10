"use client"

import { motion } from "framer-motion"
import { Battery, Camera, Shield, Cpu, Wifi, Smartphone } from "lucide-react"
import { useLanding } from "./LandingContext"

const features = [
    {
        icon: Battery,
        key: "battery",
        color: "text-green-500",
        bg: "bg-green-500/10",
    },
    {
        icon: Shield,
        key: "rugged",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    {
        icon: Camera,
        key: "camera",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
    },
    {
        icon: Cpu,
        key: "performance",
        color: "text-red-500",
        bg: "bg-red-500/10",
    },
    {
        icon: Wifi,
        key: "5g",
        color: "text-cyan-500",
        bg: "bg-cyan-500/10",
    },
    {
        icon: Smartphone,
        key: "display",
        color: "text-orange-500",
        bg: "bg-orange-500/10",
    },
]

export function Features() {
    const { t } = useLanding()

    return (
        <section id="features" className="py-24 bg-secondary/30 relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold mb-4"
                    >
                        {t("features.title.prefix")} <span className="text-primary">CUBOT</span>?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-muted-foreground"
                    >
                        {t("features.subtitle")}
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.key}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                        >
                            <div className={`w-14 h-14 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{t(`features.${feature.key}`)}</h3>
                            <p className="text-muted-foreground">{t(`features.${feature.key}.desc`)}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
