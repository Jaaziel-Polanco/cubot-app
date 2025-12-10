"use client"


import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanding } from "./LandingContext"

export function Hero() {
    const { t } = useLanding()

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background to-background/50 pt-20">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-8 text-center lg:text-left"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block"
                        >
                            <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                                {t("hero.slogan")}
                            </span>
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                            {t("hero.title.prefix")} <br />
                            <span className="gradient-text">{t("hero.title.gradient")}</span>
                        </h1>

                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                            {t("hero.subtitle")}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Button size="lg" className="text-lg h-12 px-8 gap-2 hover-lift" asChild>
                                <Link href="#dispositivos">
                                    {t("hero.cta.explore")} <Smartphone className="w-5 h-5" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="text-lg h-12 px-8 gap-2 hover-lift" asChild>
                                <Link href="/auth/register">
                                    {t("hero.cta.vendor")} <ArrowRight className="w-5 h-5" />
                                </Link>
                            </Button>
                        </div>

                        <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-muted-foreground">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-foreground">1M+</p>
                                <p className="text-sm">{t("hero.stat.users")}</p>
                            </div>
                            <div className="w-px h-12 bg-border" />
                            <div className="text-center">
                                <p className="text-3xl font-bold text-foreground">50+</p>
                                <p className="text-sm">{t("hero.stat.countries")}</p>
                            </div>
                            <div className="w-px h-12 bg-border" />
                            <div className="text-center">
                                <p className="text-3xl font-bold text-foreground">24/7</p>
                                <p className="text-sm">{t("hero.stat.support")}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Image Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="relative mx-auto lg:ml-auto"
                    >
                        <div className="relative w-[300px] h-[600px] md:w-[400px] md:h-[800px]">
                            {/* Glow effect behind phone */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-accent/30 blur-3xl rounded-full transform scale-90" />

                            <Image
                                src="/hero-phone.png"
                                alt="CUBOT Smartphone"
                                fill
                                className="object-contain drop-shadow-2xl animate-float"
                                priority
                            />

                            {/* Floating cards */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 }}
                                className="absolute top-20 -right-10 bg-card/80 backdrop-blur-md border border-border p-4 rounded-xl shadow-lg hidden md:block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                        <Smartphone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">New Arrival</p>
                                        <p className="text-xs text-muted-foreground">KingKong Star 2</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1 }}
                                className="absolute bottom-40 -left-10 bg-card/80 backdrop-blur-md border border-border p-4 rounded-xl shadow-lg hidden md:block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                                        <div className="text-lg font-bold">5G</div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Ultra Fast</p>
                                        <p className="text-xs text-muted-foreground">Connectivity</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2 }}
                                className="absolute top-1/2 -right-16 bg-card/80 backdrop-blur-md border border-border p-4 rounded-xl shadow-lg hidden lg:block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">100MP Camera</p>
                                        <p className="text-xs text-muted-foreground">Pro Quality</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: -50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.4 }}
                                className="absolute top-14 bg-card/80 backdrop-blur-md border border-border p-4 rounded-xl shadow-lg hidden lg:block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">10600mAh</p>
                                        <p className="text-xs text-muted-foreground">Massive Battery</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
