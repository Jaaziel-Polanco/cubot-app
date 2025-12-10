import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as fs from "fs"
import * as path from "path"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function loadSeeds() {
  console.log("Loading seed data...")

  try {
    // Read and execute seed SQL file
    const seedPath = path.join(__dirname, "../supabase/004_seed_data.sql")
    const seedSQL = fs.readFileSync(seedPath, "utf-8")

    // Split by statement and execute
    const statements = seedSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    for (const statement of statements) {
      const { error } = await supabase.rpc("exec_sql", { sql: statement })
      if (error) {
        console.error("Error executing:", statement.substring(0, 100))
        console.error(error)
      }
    }

    console.log("✅ Seed data loaded successfully")
  } catch (error) {
    console.error("❌ Error loading seeds:", error)
    process.exit(1)
  }
}

loadSeeds()
