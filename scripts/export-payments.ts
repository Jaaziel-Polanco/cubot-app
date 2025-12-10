import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as fs from "fs"
import * as path from "path"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function exportPaymentBatch(batchId: string) {
  console.log(`Exporting payment batch: ${batchId}`)

  try {
    // Get batch
    const { data: batch, error: batchError } = await supabase
      .from("payment_batches")
      .select("*")
      .eq("batch_id", batchId)
      .single()

    if (batchError || !batch) {
      console.error("Batch not found")
      process.exit(1)
    }

    // Get vendor commissions for this period
    const { data: commissions, error: commissionsError } = await supabase
      .from("vendor_commissions")
      .select("*, users(vendor_id, name, bank_account)")
      .eq("status", "pending")
      .gte("period_start", batch.period_start)
      .lte("period_end", batch.period_end)

    if (commissionsError || !commissions) {
      console.error("No commissions found")
      process.exit(1)
    }

    // Generate CSV
    const csvRows = [
      "vendor_id,name,bank_account,amount,period_start,period_end,batch_id",
      ...commissions.map((c: any) =>
        [
          c.users.vendor_id,
          c.users.name,
          c.users.bank_account,
          c.total_commissions.toFixed(2),
          c.period_start,
          c.period_end,
          batchId,
        ].join(","),
      ),
    ]

    const csv = csvRows.join("\n")

    // Save to file
    const outputPath = path.join(__dirname, `../exports/${batchId}.csv`)
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    fs.writeFileSync(outputPath, csv)

    console.log(`✅ Exported to: ${outputPath}`)
    console.log(`Total vendors: ${commissions.length}`)
    console.log(`Total amount: $${batch.total_amount}`)
  } catch (error) {
    console.error("❌ Error exporting:", error)
    process.exit(1)
  }
}

const batchId = process.argv[2]
if (!batchId) {
  console.error("Usage: npm run export-payments <batch-id>")
  process.exit(1)
}

exportPaymentBatch(batchId)
