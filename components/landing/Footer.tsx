"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { useLanding } from "./LandingContext"

export function Footer() {
    const { t } = useLanding()

    return (
        <footer className="bg-card border-t border-border">
            <div className="container mx-auto px-4 md:px-6 py-12">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    <div className="space-y-4">
                        <Link href="/" className="text-2xl font-bold tracking-tighter text-primary">
                            CUBOT
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            {t("footer.slogan")}
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Facebook className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Twitter className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Instagram className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Youtube className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">{t("footer.products")}</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary transition-colors">{t("footer.smartphones")}</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">{t("footer.rugged")}</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">{t("footer.wearables")}</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">{t("footer.tablets")}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">{t("footer.support")}</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary transition-colors">{t("footer.contact")}</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">{t("footer.warranty")}</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">{t("footer.shipping")}</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">{t("footer.faq")}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">{t("footer.contact")}</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span>support@cubot.net</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-1" />
                                <span>123 Tech Avenue,<br />Shenzhen, China</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} CUBOT. {t("footer.rights")}</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-primary transition-colors">{t("footer.privacy")}</Link>
                        <Link href="#" className="hover:text-primary transition-colors">{t("footer.terms")}</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
