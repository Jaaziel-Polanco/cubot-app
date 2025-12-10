import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

async function testFix() {
    console.log("Testing Fix with users!vendor_id ...")

    // Testing column hint syntax
    const { data, error } = await supabase
        .from("sales")
        .select("*, users!vendor_id(name, vendor_id), products(name, sku)")
        .limit(1)

    if (error) {
        console.error("Method 1 Failed:", error.message)

        // Try constraint name syntax just in case
        console.log("Testing Fix with users!sales_vendor_id_fkey ...")
        const { data: data2, error: error2 } = await supabase
            .from("sales")
            .select("*, users!sales_vendor_id_fkey(name, vendor_id), products(name, sku)")
            .limit(1)

        if (error2) console.error("Method 2 Failed:", error2.message)
        else console.log("Method 2 Success!")
    } else {
        console.log("Method 1 Success!")
        console.log("Returned users object:", data ? data[0]?.users : "null")
    }
}

testFix()
