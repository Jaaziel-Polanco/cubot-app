import { describe, it, expect } from "vitest"
import { arrayToCSV, csvToArray, validateProductCSV } from "../lib/utils/csv"

describe("CSV Utilities", () => {
  describe("arrayToCSV", () => {
    it("should convert array to CSV string", () => {
      const data = [
        { name: "Product 1", price: "100", active: "true" },
        { name: "Product 2", price: "200", active: "false" },
      ]

      const csv = arrayToCSV(data)
      expect(csv).toBe("name,price,active\nProduct 1,100,true\nProduct 2,200,false")
    })

    it("should handle commas in values", () => {
      const data = [{ name: "Product, Name", price: "100" }]
      const csv = arrayToCSV(data)
      expect(csv).toContain('"Product, Name"')
    })

    it("should handle quotes in values", () => {
      const data = [{ name: 'Product "Special"', price: "100" }]
      const csv = arrayToCSV(data)
      expect(csv).toContain('"Product ""Special"""')
    })

    it("should return empty string for empty array", () => {
      expect(arrayToCSV([])).toBe("")
    })
  })

  describe("csvToArray", () => {
    it("should parse CSV string to array", () => {
      const csv = "name,price,active\nProduct 1,100,true\nProduct 2,200,false"
      const result = csvToArray(csv)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ name: "Product 1", price: "100", active: "true" })
      expect(result[1]).toEqual({ name: "Product 2", price: "200", active: "false" })
    })

    it("should handle quoted fields", () => {
      const csv = 'name,price\n"Product, Name",100'
      const result = csvToArray(csv)

      expect(result[0].name).toBe("Product, Name")
    })

    it("should handle empty lines", () => {
      const csv = "name,price\nProduct 1,100\n\nProduct 2,200"
      const result = csvToArray(csv)

      expect(result).toHaveLength(2)
    })
  })

  describe("validateProductCSV", () => {
    it("should validate correct product CSV", () => {
      const data = [
        {
          sku: "CUBOT-X90",
          name: "CUBOT X90",
          category: "Flagship",
          price: "8999",
          commission_amount: "0",
          commission_percent: "10",
          stock: "50",
          active: "true",
        },
      ]

      const result = validateProductCSV(data)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it("should reject missing required fields", () => {
      const data = [{ name: "Product", category: "Flagship" }]
      const result = validateProductCSV(data)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain("Missing required fields: sku, price")
    })

    it("should reject invalid price", () => {
      const data = [{ sku: "TEST", name: "Test", category: "Flagship", price: "invalid" }]
      const result = validateProductCSV(data)

      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes("Invalid price"))).toBe(true)
    })

    it("should reject invalid category", () => {
      const data = [{ sku: "TEST", name: "Test", category: "Invalid", price: "100" }]
      const result = validateProductCSV(data)

      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes("Invalid category"))).toBe(true)
    })

    it("should reject empty CSV", () => {
      const result = validateProductCSV([])

      expect(result.valid).toBe(false)
      expect(result.errors).toContain("CSV file is empty")
    })
  })
})
