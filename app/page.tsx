import { Navbar } from "@/components/landing/Navbar"
import { Hero } from "@/components/landing/Hero"
import { Features } from "@/components/landing/Features"
import { DeviceShowcase } from "@/components/landing/DeviceShowcase"
import { VendorBenefits } from "@/components/landing/VendorBenefits"
import { RegisterForm } from "@/components/landing/RegisterForm"
import { Footer } from "@/components/landing/Footer"
import { LandingProvider } from "@/components/landing/LandingContext"
import { createClient } from "@/lib/supabase/server"

export default async function LandingPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    let userRole: string | null = null
    if (user) {
        const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single()

        userRole = profile?.role || null
    }

    return (
        <LandingProvider>
            <main className="min-h-screen bg-background text-foreground">
                <Navbar isAuthenticated={!!user} userRole={userRole} />
                <Hero />
                <DeviceShowcase />
                <Features />
                <VendorBenefits />
                <RegisterForm />
                <Footer />
            </main>
        </LandingProvider>
    )
}
