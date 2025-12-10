import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/auth"
import { createClient } from "@/lib/supabase/server"
import { calculateCommission } from "@/lib/utils/commission"

export async function POST() {
  const { error, profile } = await requireAdmin()
  if (error) return error

  try {
    const supabase = await createClient()

    // Get all approved sales with their commissions
    const { data: sales } = await supabase
      .from("sales")
      .select("*, commissions(*), products(*)")
      .eq("status", "approved")

    if (!sales) {
      return NextResponse.json({ recalculated: 0 })
    }

    let recalculated = 0

    for (const sale of sales) {
      if (sale.commissions && sale.commissions.length > 0) {
        const commission = sale.commissions[0]
        const newAmount = calculateCommission(sale.products, sale.sale_price)

        if (Math.abs(newAmount - Number.parseFloat(commission.commission_amount)) > 0.01) {
          await supabase.from("commissions").update({ commission_amount: newAmount }).eq("id", commission.id)

          recalculated++
        }
      }
    }

    return NextResponse.json({ recalculated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
