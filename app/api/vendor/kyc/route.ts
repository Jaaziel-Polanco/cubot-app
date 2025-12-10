import { type NextRequest, NextResponse } from "next/server"
import { requireVendor } from "@/lib/middleware/auth"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const { error, profile } = await requireVendor()
  if (error) return error

  try {
    const supabase = await createClient()

    const { data: documents, error: docsError } = await supabase
      .from("kyc_documents")
      .select("*")
      .eq("vendor_id", profile!.id)
      .order("uploaded_at", { ascending: false })

    if (docsError) throw docsError

    return NextResponse.json({ documents })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { error, profile } = await requireVendor()
  if (error) return error

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const documentType = formData.get("document_type") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!documentType) {
      return NextResponse.json({ error: "Document type is required" }, { status: 400 })
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
    const fileName = `${profile!.id}/${documentType}_${Date.now()}_${file.name}`
    const { data, error: uploadError } = await supabase.storage.from("kyc").upload(fileName, file, {
      contentType: file.type,
    })

    if (uploadError) throw uploadError

    // Get signed URL
    const { data: urlData } = await supabase.storage.from("kyc").createSignedUrl(fileName, 60 * 60 * 24 * 365) // 1 year

    if (!urlData) throw new Error("Failed to generate URL")

    // Create KYC document record
    const { data: document, error: docError } = await supabase
      .from("kyc_documents")
      .insert({
        vendor_id: profile!.id,
        document_type: documentType,
        document_name: file.name,
        file_url: urlData.signedUrl,
        status: "pending",
      })
      .select()
      .single()

    if (docError) throw docError

    return NextResponse.json({ document })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
