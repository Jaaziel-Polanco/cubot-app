import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            name,
            email,
            password,
            phone,
            idNumber,
            country,
            address,
            city,
            state,
        } = body

        // Validate required fields
        if (!name || !email || !password || !phone || !idNumber || !country) {
            return NextResponse.json(
                { error: "Todos los campos obligatorios son requeridos" },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Check if email already exists
        const { data: existingEmail, error: emailCheckError } = await supabase
            .from("users")
            .select("id")
            .eq("email", email.toLowerCase())
            .maybeSingle()

        if (emailCheckError && emailCheckError.code !== "PGRST116") {
            console.error("Email check error:", emailCheckError)
            return NextResponse.json(
                { error: "Error al verificar el correo electrónico" },
                { status: 500 }
            )
        }

        if (existingEmail) {
            return NextResponse.json(
                { error: "Este correo electrónico ya está registrado" },
                { status: 400 }
            )
        }

        // Check if identification number already exists
        const { data: existingId, error: idCheckError } = await supabase
            .from("users")
            .select("id")
            .eq("identification_number", idNumber)
            .maybeSingle()

        if (idCheckError && idCheckError.code !== "PGRST116") {
            console.error("ID check error:", idCheckError)
            return NextResponse.json(
                { error: "Error al verificar la cédula/RNC" },
                { status: 500 }
            )
        }

        if (existingId) {
            return NextResponse.json(
                { error: "Esta cédula o RNC ya está registrada" },
                { status: 400 }
            )
        }

        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email.toLowerCase(),
            password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
                data: {
                    full_name: name,
                },
            },
        })

        if (authError) {
            console.error("Auth error:", authError)

            // Handle specific auth errors
            if (authError.message.includes("already registered")) {
                return NextResponse.json(
                    { error: "Este correo electrónico ya está registrado" },
                    { status: 400 }
                )
            }

            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            )
        }

        if (!authData.user) {
            return NextResponse.json(
                { error: "Error al crear el usuario" },
                { status: 500 }
            )
        }

        // 2. Update user profile in users table with vendor role and additional info
        const { error: profileError } = await supabase
            .from("users")
            .update({
                name,
                phone,
                identification_number: idNumber,
                address,
                city,
                state,
                country,
                role: "vendor",
                status: "active",
                kyc_status: "pending",
            })
            .eq("id", authData.user.id)

        if (profileError) {
            console.error("Profile error:", profileError)
            // User was created but profile update failed
            // We should still return success since they can complete profile later
        }

        return NextResponse.json({
            success: true,
            message: "Registro exitoso. Ya puedes iniciar sesión.",
            userId: authData.user.id,
        })
    } catch (error: any) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { error: error.message || "Error al procesar el registro" },
            { status: 500 }
        )
    }
}
