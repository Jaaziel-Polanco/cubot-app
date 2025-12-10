/**
 * Test script for Inventory API
 * Usage: npx tsx scripts/test-inventory-api.ts <IMEI>
 * 
 * This script tests the connection to the external inventory API
 * and verifies that it can retrieve product information by IMEI.
 */

import * as dotenv from "dotenv"
import { checkInventoryByImei, isInventoryPhone, isInventoryPhoneAvailable } from "../lib/services/inventory"

// Load environment variables from .env.local or .env
dotenv.config({ path: ".env.local" })
dotenv.config()

async function testInventoryAPI() {
  // Get IMEI from command line arguments or use a test IMEI
  const testImei = process.argv[2] || "358497892739257" // Example IMEI from Flutter code

  console.log("🧪 Testing Inventory API Connection...\n")
  console.log("Configuration:")
  console.log(`  API URL: ${process.env.INVENTORY_API_URL || "https://www.zodilum.com:8089"}`)
  console.log(`  API Key: ${process.env.INVENTORY_API_KEY ? "***configured***" : "❌ NOT CONFIGURED"}`)
  console.log(`  Test IMEI: ${testImei}\n`)

  if (!process.env.INVENTORY_API_KEY) {
    console.error("❌ ERROR: INVENTORY_API_KEY is not configured!")
    console.log("\nPlease set the following environment variables:")
    console.log("  INVENTORY_API_URL=https://www.zodilum.com:8089")
    console.log("  INVENTORY_API_KEY=your_api_key_here")
    process.exit(1)
  }

  try {
    console.log("📡 Testing checkInventoryByImei()...")
    const startTime = Date.now()
    const result = await checkInventoryByImei(testImei)
    const duration = Date.now() - startTime

    if (result) {
      console.log("✅ API Response received successfully!")
      console.log(`⏱️  Response time: ${duration}ms\n`)
      console.log("Product Details:")
      console.log(`  ID: ${result.id}`)
      console.log(`  IMEI: ${result.imei}`)
      console.log(`  Brand: ${result.brand}`)
      console.log(`  Model: ${result.model}`)
      console.log(`  Color: ${result.color}`)
      console.log(`  Capacity: ${result.capacity}`)
      console.log(`  Price: $${result.price}`)
      console.log(`  Status: ${result.status}`)
      console.log(`  Added to Inventory: ${result.addedToInventory || "N/A"}`)
    } else {
      console.log("⚠️  API returned null (IMEI not found or API error)")
      console.log(`⏱️  Response time: ${duration}ms`)
    }

    console.log("\n📋 Testing helper functions...")
    
    const exists = await isInventoryPhone(testImei)
    console.log(`  isInventoryPhone(): ${exists ? "✅ true" : "❌ false"}`)
    
    const available = await isInventoryPhoneAvailable(testImei)
    console.log(`  isInventoryPhoneAvailable(): ${available ? "✅ true" : "❌ false"}`)

    console.log("\n✨ Test completed!")
  } catch (error: any) {
    console.error("\n❌ ERROR during API test:")
    console.error(`  ${error.message || error}`)
    if (error.stack) {
      console.error("\nStack trace:")
      console.error(error.stack)
    }
    process.exit(1)
  }
}

// Run the test
testInventoryAPI()

