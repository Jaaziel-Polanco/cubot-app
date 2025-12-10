import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/auth"
import { getAllSales } from "@/lib/services/sales"
import { arrayToCSV } from "@/lib/utils/csv"

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get("format") || "json"
    const filters = {
      status: searchParams.get("status") || undefined,
      vendor_id: searchParams.get("vendor_id") || undefined,
      date_from: searchParams.get("date_from") || undefined,
      date_to: searchParams.get("date_to") || undefined,
    }

    const sales = await getAllSales(filters)

    if (format === "csv") {
      const csvData = sales.map((sale) => ({
        sale_id: sale.sale_id,
        vendor_id: sale.vendor_id,
        product_id: sale.product_id,
        imei: sale.imei,
        customer_name: sale.customer_name,
        customer_phone: sale.customer_phone,
        sale_date: sale.sale_date,
        sale_price: sale.sale_price,
        status: sale.status,
        created_at: sale.created_at,
      }))

      const csv = arrayToCSV(csvData)

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=sales-report.csv",
        },
      })
    }

    return NextResponse.json({ sales })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
