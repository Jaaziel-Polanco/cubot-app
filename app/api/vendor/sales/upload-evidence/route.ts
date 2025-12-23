import { type NextRequest, NextResponse } from "next/server"
import { requireVendor } from "@/lib/middleware/auth"
import { createServiceClient } from "@/lib/supabase/service"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const { error, profile } = await requireVendor()
  if (error) return error

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const saleId = formData.get("sale_id") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, and PDF are allowed" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB" }, { status: 400 })
    }

    // Use service client for storage (bypass RLS)
    const serviceSupabase = createServiceClient()

    // Upload to storage - store just the filename path
    const fileName = `${profile!.id}/${saleId}_${Date.now()}_${file.name}`
    const { error: uploadError } = await serviceSupabase.storage.from("evidence").upload(fileName, file, {
      contentType: file.type,
    })

    if (uploadError) throw uploadError

    // Update sale with evidence filename (not full URL)
    if (saleId) {
      const supabase = await createClient()
      await supabase
        .from("sales")
        .update({ evidence_url: fileName })
        .eq("id", saleId)
        .eq("vendor_id", profile!.id)
    }

    return NextResponse.json({
      path: fileName,
      success: true,
    })
  } catch (err: any) {
    console.error("Upload evidence error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
