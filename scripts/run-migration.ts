import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing environment variables")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
    try {
        const migrationPath = path.join(__dirname, "008_add_sale_id_trigger.sql")
        console.log(`Reading migration from: ${migrationPath}`)

        const sql = fs.readFileSync(migrationPath, "utf8")

        // Split by statement and execute
        const statements = sql
            .split(";")
            .map((s) => s.trim())
            .filter((s) => s.length > 0)

        for (const statement of statements) {
            const { error } = await supabase.rpc("exec_sql", { sql_query: statement })
            if (error) {
                console.error("Error executing:", statement.substring(0, 100))
                console.error(error)
            } else {
                console.log("Executed successfully")
            }
        }

        console.log("Migration completed")
    } catch (error) {
        console.error("Error running migration:", error)
    }
}

runMigration()
