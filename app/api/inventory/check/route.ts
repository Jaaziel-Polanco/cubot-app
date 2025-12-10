import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware/auth"
import { checkInventoryByImei } from "@/lib/services/inventory"
import { validateImei, maskImei } from "@/lib/utils/imei"

export async function POST(request: NextRequest) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const { imei } = body

    if (!imei) {
      return NextResponse.json({ error: "IMEI is required" }, { status: 400 })
    }

    // Validate IMEI format (but be more lenient - just check format, not Luhn)
    const cleaned = imei.replace(/[\s-]/g, "")
    if (!/^\d{15}$/.test(cleaned)) {
      console.log(`[API] IMEI format invalid: ${maskImei(imei)}`)
      return NextResponse.json({ error: "IMEI must be exactly 15 digits" }, { status: 400 })
    }
    
    // Log Luhn validation but don't block
    const luhnValid = validateImei(imei).valid
    if (!luhnValid) {
      console.warn(`[API] ⚠️ IMEI ${maskImei(imei)} failed Luhn check, but continuing anyway`)
    }

    // Check inventory via external API
    console.log(`[API] Checking IMEI ${maskImei(imei)} via external inventory API...`)
    const result = await checkInventoryByImei(imei)

    // Log with masked IMEI for security
    if (result) {
      console.log(`[API] ✓ IMEI ${maskImei(imei)} found in external inventory: ${result.brand} ${result.model}`)
    } else {
      console.log(`[API] ✗ IMEI ${maskImei(imei)} not found in external inventory`)
    }

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
