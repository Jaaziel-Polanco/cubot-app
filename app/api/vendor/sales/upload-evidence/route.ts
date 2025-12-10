import { type NextRequest, NextResponse } from "next/server"
import { requireVendor } from "@/lib/middleware/auth"
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

    const supabase = await createClient()

    // Upload to storage
    const fileName = `${profile!.id}/${saleId}_${Date.now()}_${file.name}`
    const { data, error: uploadError } = await supabase.storage.from("evidence").upload(fileName, file, {
      contentType: file.type,
    })

    if (uploadError) throw uploadError

    // Get public URL (signed)
    const { data: urlData } = await supabase.storage.from("evidence").createSignedUrl(fileName, 60 * 60 * 24 * 365) // 1 year

    if (!urlData) throw new Error("Failed to generate URL")

    // Update sale with evidence URL
    if (saleId) {
      await supabase
        .from("sales")
        .update({ evidence_url: urlData.signedUrl })
        .eq("id", saleId)
        .eq("vendor_id", profile!.id)
    }

    return NextResponse.json({
      url: urlData.signedUrl,
      path: fileName,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
