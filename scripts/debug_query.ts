import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing environment variables")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testQuery() {
    console.log("Testing Sales Query with Joins...")

    // Exact query from app/admin/sales/page.tsx
    const { data, error } = await supabase
        .from("sales")
        .select("*, users(name, vendor_id), products(name, sku)")
        .limit(5)

    if (error) {
        console.error("QUERY ERROR:", error)
        console.log("Hypothesis: Ambiguous embedding because 'sales' has multiple FKs to 'users' (vendor_id, validated_by)")
    } else {
        console.log("Query Success! Data length:", data?.length)
        console.log(JSON.stringify(data[0], null, 2))
    }
}

testQuery()
