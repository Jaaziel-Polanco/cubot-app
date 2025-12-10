import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/auth"
import { csvToArray } from "@/lib/utils/csv"
import { createProduct } from "@/lib/services/products"

export async function POST(request: NextRequest) {
  const { error, profile } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { csv } = body

    const rows = csvToArray(csv)
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const row of rows) {
      try {
        await createProduct(
          {
            sku: row.sku,
            name: row.name,
            model: row.model,
            category: row.category || null,
            base_price: Number.parseFloat(row.base_price),
            commission_type: row.commission_type as "fixed" | "percentage",
            commission_value: Number.parseFloat(row.commission_value),
            is_active: row.is_active === "true",
          },
          profile!.id,
        )
        results.success++
      } catch (err: any) {
        results.failed++
        results.errors.push(`Row ${row.sku}: ${err.message}`)
      }
    }

    return NextResponse.json({ results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
