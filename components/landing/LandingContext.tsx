"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

type Language = "es" | "en"

interface LandingContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
}

const LandingContext = createContext<LandingContextType | undefined>(undefined)

export const translations = {
    es: {
        // Navbar
        "nav.phones": "Dispositivos",
        "nav.features": "Características",
        "nav.vendors": "Vendedores",
        "nav.about": "Nosotros",
        "nav.login": "Iniciar Sesión",
        "nav.register": "Registrarse",
        "nav.dashboard": "Panel",

        // Hero
        "hero.slogan": "Simple & Trust",
        "hero.title.prefix": "Descubre el",
        "hero.title.gradient": "Futuro Móvil",
        "hero.subtitle": "Experimenta tecnología premium a precios inigualables. Únete al ecosistema CUBOT y desbloquea un mundo de posibilidades.",
        "hero.cta.explore": "Explorar",
        "hero.cta.vendor": "Ser Vendedor",
        "hero.stat.users": "Usuarios Felices",
        "hero.stat.countries": "Países",
        "hero.stat.support": "Soporte",

        // Features
        "features.title.prefix": "¿Por qué elegir",
        "features.subtitle": "Diseñados para durar, rendir y ofrecer valor. Nuestros dispositivos están construidos para resistir los elementos y superar expectativas.",
        "features.battery": "Batería Masiva",
        "features.battery.desc": "Hasta 10600mAh de capacidad para días de energía.",
        "features.rugged": "Diseño Resistente",
        "features.rugged.desc": "Certificación IP68/IP69K. Resistente al agua, polvo y caídas.",
        "features.camera": "Cámara Pro",
        "features.camera.desc": "Captura fotos impresionantes con cámara principal de hasta 100MP.",
        "features.performance": "Alto Rendimiento",
        "features.performance.desc": "Potenciados por procesadores MediaTek y hasta 24GB de RAM.",
        "features.5g": "Conectividad 5G",
        "features.5g.desc": "Experimenta velocidades de descarga y carga ultrarrápidas.",
        "features.display": "Pantalla Impresionante",
        "features.display.desc": "Pantallas de 120Hz para visuales fluidos.",

        // Device Showcase
        "devices.title": "Nuestros Dispositivos",
        "devices.subtitle": "Explora nuestra gama de tecnología innovadora",
        "devices.tab.smartphones": "Smartphones",
        "devices.tab.rugged": "Ultra Resistentes",
        "devices.tab.tablets": "Tablets",
        "devices.tab.watches": "Relojes",
        "devices.view_details": "Ver Detalles",
        "devices.specs.screen": "Pantalla",
        "devices.specs.processor": "Procesador",
        "devices.specs.ram": "RAM",
        "devices.specs.storage": "Almacenamiento",
        "devices.specs.battery": "Batería",
        "devices.specs.camera": "Cámara",
        "devices.close": "Cerrar",

        // Vendor Benefits
        "vendor.title": "Vende Teléfonos CUBOT con",
        "vendor.subtitle": "Te ayudamos a gestionar tus ventas de dispositivos CUBOT y ganar comisiones de forma simple",
        "vendor.benefit.1": "Gana comisiones por cada teléfono CUBOT que vendas",
        "vendor.benefit.2": "Panel simple para registrar y seguir tus ventas",
        "vendor.benefit.3": "Seguimiento automático de tus comisiones ganadas",
        "vendor.benefit.4": "Reportes claros de tus ventas y ganancias",
        "vendor.benefit.5": "Soporte para ayudarte a vender más",
        "vendor.cta": "Registrarse como Vendedor",
        "vendor.login": "Ya tengo cuenta",
        "vendor.card.margins": "Comisiones Atractivas",
        "vendor.card.margins.desc": "Gana dinero por cada teléfono CUBOT que vendas. Sistema simple y transparente de comisiones.",
        "vendor.card.community": "Gestión Fácil",
        "vendor.card.community.desc": "Registra tus ventas fácilmente y consulta tus comisiones desde cualquier lugar.",
        "vendor.card.quality": "Pagos Seguros",
        "vendor.card.quality.desc": "Recibe tus comisiones de forma puntual y segura. Sin complicaciones.",

        // Register Form
        "register.title": "Registro de Vendedor",
        "register.subtitle": "Completa tus datos para unirte a nuestra red de distribución.",
        "register.section.personal": "Información Personal",
        "register.section.personal.desc": "Completa tu información personal para verificación",
        "register.section.credentials": "Credenciales de Acceso",
        "register.section.credentials.desc": "Crea tu cuenta para acceder al panel de vendedor",
        "register.name": "Nombre Completo",
        "register.email": "Correo Electrónico",
        "register.phone": "Teléfono",
        "register.idNumber": "Cédula de Identidad o RNC",
        "register.idNumber.desc": "Requerido para verificación KYC. Formato: 001-1234567-8 (cédula) o 123-45678-9 (RNC)",
        "register.country": "País",
        "register.address": "Dirección",
        "register.city": "Ciudad",
        "register.state": "Provincia/Estado",
        "register.company": "Nombre de la Empresa",
        "register.password": "Contraseña",
        "register.submit": "Crear Cuenta",
        "register.success.title": "¡Registro Exitoso!",
        "register.success.desc": "Tu cuenta ha sido creada. Ya puedes iniciar sesión.",
        "register.success.login": "Iniciar Sesión",
        "register.success.back": "Volver al formulario",
        "register.loading": "Procesando...",

        // Footer
        "footer.slogan": "Simple y Confiable. Llevando tecnología premium a todos, en todas partes.",
        "footer.products": "Productos",
        "footer.smartphones": "Smartphones",
        "footer.rugged": "Teléfonos Resistentes",
        "footer.wearables": "Wearables",
        "footer.tablets": "Tablets",
        "footer.support": "Soporte",
        "footer.contact": "Contáctanos",
        "footer.warranty": "Garantía",
        "footer.shipping": "Información de Envío",
        "footer.faq": "Preguntas Frecuentes",
        "footer.rights": "Todos los derechos reservados.",
        "footer.privacy": "Política de Privacidad",
        "footer.terms": "Términos de Servicio",
    },
    en: {
        // Navbar
        "nav.phones": "Devices",
        "nav.features": "Features",
        "nav.vendors": "Vendors",
        "nav.about": "About",
        "nav.login": "Login",
        "nav.register": "Register",
        "nav.dashboard": "Dashboard",

        // Hero
        "hero.slogan": "Simple & Trust",
        "hero.title.prefix": "Discover the",
        "hero.title.gradient": "Future of Mobile",
        "hero.subtitle": "Experience premium technology at unbeatable prices. Join the CUBOT ecosystem and unlock a world of possibilities.",
        "hero.cta.explore": "Explore Phones",
        "hero.cta.vendor": "Become a Vendor",
        "hero.stat.users": "Happy Users",
        "hero.stat.countries": "Countries",
        "hero.stat.support": "Support",

        // Features
        "features.title.prefix": "Why Choose",
        "features.subtitle": "Engineered for durability, performance, and value. Our devices are built to withstand the elements and exceed expectations.",
        "features.battery": "Massive Battery",
        "features.battery.desc": "Up to 10600mAh battery capacity keeps you powered for days.",
        "features.rugged": "Rugged Design",
        "features.rugged.desc": "IP68/IP69K certified. Water, dust, and drop resistant.",
        "features.camera": "Pro Camera",
        "features.camera.desc": "Capture stunning photos with up to 100MP ultra-clear main camera.",
        "features.performance": "High Performance",
        "features.performance.desc": "Powered by latest MediaTek processors and up to 24GB RAM.",
        "features.5g": "5G Connectivity",
        "features.5g.desc": "Experience lightning fast download and upload speeds.",
        "features.display": "Stunning Display",
        "features.display.desc": "120Hz high refresh rate screens for smooth visuals.",

        // Device Showcase
        "devices.title": "Our Devices",
        "devices.subtitle": "Explore our range of innovative technology",
        "devices.tab.smartphones": "Smartphones",
        "devices.tab.rugged": "Rugged Phones",
        "devices.tab.tablets": "Tablets",
        "devices.tab.watches": "Watches",
        "devices.view_details": "View Details",
        "devices.specs.screen": "Screen",
        "devices.specs.processor": "Processor",
        "devices.specs.ram": "RAM",
        "devices.specs.storage": "Storage",
        "devices.specs.battery": "Battery",
        "devices.specs.camera": "Camera",
        "devices.close": "Close",

        // Vendor Benefits
        "vendor.title": "Sell CUBOT Phones with",
        "vendor.subtitle": "We help you manage your CUBOT device sales and earn commissions the simple way",
        "vendor.benefit.1": "Earn commissions for every CUBOT phone you sell",
        "vendor.benefit.2": "Simple dashboard to register and track your sales",
        "vendor.benefit.3": "Automatic tracking of your earned commissions",
        "vendor.benefit.4": "Clear reports of your sales and earnings",
        "vendor.benefit.5": "Support to help you sell more",
        "vendor.cta": "Register as Vendor",
        "vendor.login": "Already have an account",
        "vendor.card.margins": "Attractive Commissions",
        "vendor.card.margins.desc": "Earn money for every CUBOT phone you sell. Simple and transparent commission system.",
        "vendor.card.community": "Easy Management",
        "vendor.card.community.desc": "Register your sales easily and check your commissions from anywhere.",
        "vendor.card.quality": "Secure Payments",
        "vendor.card.quality.desc": "Receive your commissions on time and securely. No complications.",

        // Register Form
        "register.title": "Vendor Registration",
        "register.subtitle": "Complete your details to join our distribution network.",
        "register.section.personal": "Personal Information",
        "register.section.personal.desc": "Complete your personal information for verification",
        "register.section.credentials": "Access Credentials",
        "register.section.credentials.desc": "Create your account to access the vendor panel",
        "register.name": "Full Name",
        "register.email": "Email Address",
        "register.phone": "Phone Number",
        "register.idNumber": "ID Number or Tax ID",
        "register.idNumber.desc": "Required for KYC verification. Format: 001-1234567-8 (ID) or 123-45678-9 (Tax ID)",
        "register.country": "Country",
        "register.address": "Address",
        "register.city": "City",
        "register.state": "State/Province",
        "register.company": "Company Name",
        "register.password": "Password",
        "register.submit": "Create Account",
        "register.success.title": "Registration Successful!",
        "register.success.desc": "Your account has been created. You can now log in.",
        "register.success.login": "Log In",
        "register.success.back": "Back to form",
        "register.loading": "Processing...",

        // Footer
        "footer.slogan": "Simple & Trust. Bringing premium technology to everyone, everywhere.",
        "footer.products": "Products",
        "footer.smartphones": "Smartphones",
        "footer.rugged": "Rugged Phones",
        "footer.wearables": "Wearables",
        "footer.tablets": "Tablets",
        "footer.support": "Support",
        "footer.contact": "Contact",
        "footer.warranty": "Warranty",
        "footer.shipping": "Shipping Info",
        "footer.faq": "FAQ",
        "footer.rights": "All rights reserved.",
        "footer.privacy": "Privacy Policy",
        "footer.terms": "Terms of Service",
    }
}

export function LandingProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>("es")

    const t = (key: string) => {
        return translations[language][key as keyof typeof translations["es"]] || key
    }

    return (
        <LandingContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LandingContext.Provider>
    )
}

export function useLanding() {
    const context = useContext(LandingContext)
    if (context === undefined) {
        throw new Error("useLanding must be used within a LandingProvider")
    }
    return context
}
