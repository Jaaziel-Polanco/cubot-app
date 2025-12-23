import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path")
    const bucket = searchParams.get("bucket") || "payments" // Default to payments bucket

    if (!path) {
        return NextResponse.json({ error: "Path requerido" }, { status: 400 })
    }

    // Validate bucket name
    const allowedBuckets = ["payments", "evidence"]
    if (!allowedBuckets.includes(bucket)) {
        return NextResponse.json({ error: "Bucket no válido" }, { status: 400 })
    }

    // Extract filename from path
    let fileName = path

    // If it's a full Supabase URL, extract just the filename
    if (path.includes("supabase.co/storage")) {
        // Match the filename after bucket name
        const regex = new RegExp(`\\/${bucket}\\/(.+)`)
        const match = path.match(regex)
        if (match) {
            fileName = match[1]
        }
    }

    console.log(`[signed-url] Generating signed URL for bucket: ${bucket}, file: ${fileName}`)

    // Use service client for storage operations
    const serviceSupabase = createServiceClient()
    const { data, error } = await serviceSupabase.storage
        .from(bucket)
        .createSignedUrl(fileName, 300) // 5 minutes

    if (error) {
        console.error("Error creating signed URL:", error)
        return NextResponse.json({ error: "Error al generar URL" }, { status: 500 })
    }

    return NextResponse.json({ signedUrl: data.signedUrl })
}
