import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/auth"
import { createClient } from "@/lib/supabase/server"
import { arrayToCSV } from "@/lib/utils/csv"

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get("format") || "json"
    const vendor_id = searchParams.get("vendor_id")

    const supabase = await createClient()
    let query = supabase
      .from("commissions")
      .select("*, users(full_name, vendor_id), products(name, sku)")
      .order("created_at", { ascending: false })

    if (vendor_id) {
      query = query.eq("vendor_id", vendor_id)
    }

    const { data: commissions, error: commissionsError } = await query

    if (commissionsError) throw commissionsError

    if (format === "csv") {
      const csvData = commissions.map((c: any) => ({
        vendor_code: c.users.vendor_id,
        vendor_name: c.users.full_name,
        product_sku: c.products.sku,
        product_name: c.products.name,
        base_amount: c.base_amount,
        commission_amount: c.commission_amount,
        status: c.status,
        created_at: c.created_at,
      }))

      const csv = arrayToCSV(csvData)

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=commissions-report.csv",
        },
      })
    }

    return NextResponse.json({ commissions })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
