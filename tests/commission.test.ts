import { describe, it, expect } from "vitest"
import { calculateCommission } from "../lib/utils/commission"

describe("Commission Calculation", () => {
  describe("Fixed commission type", () => {
    it("should return fixed amount regardless of price", () => {
      const product = {
        commission_type: "fixed" as const,
        commission_value: 300,
        commission_amount: 300,
        commission_percent: 0,
      }

      expect(calculateCommission(product, 1000)).toBe(300)
      expect(calculateCommission(product, 5000)).toBe(300)
      expect(calculateCommission(product, 100)).toBe(300)
    })
  })

  describe("Percentage commission type", () => {
    it("should calculate percentage correctly", () => {
      const product = {
        commission_type: "percentage" as const,
        commission_value: 10,
        commission_amount: 0,
        commission_percent: 10,
      }

      expect(calculateCommission(product, 1000)).toBe(100)
      expect(calculateCommission(product, 5000)).toBe(500)
      expect(calculateCommission(product, 2499)).toBe(249.9)
    })

    it("should handle different percentages", () => {
      const product8 = {
        commission_type: "percentage" as const,
        commission_value: 8,
        commission_amount: 0,
        commission_percent: 8,
      }

      expect(calculateCommission(product8, 3999)).toBe(319.92)

      const product12 = {
        commission_type: "percentage" as const,
        commission_value: 12,
        commission_amount: 0,
        commission_percent: 12,
      }

      expect(calculateCommission(product12, 6499)).toBe(779.88)
    })

    it("should handle zero price", () => {
      const product = {
        commission_type: "percentage" as const,
        commission_value: 10,
        commission_amount: 0,
        commission_percent: 10,
      }

      expect(calculateCommission(product, 0)).toBe(0)
    })
  })

  describe("Edge cases", () => {
    it("should handle decimal prices", () => {
      const product = {
        commission_type: "percentage" as const,
        commission_value: 10,
        commission_amount: 0,
        commission_percent: 10,
      }

      expect(calculateCommission(product, 1234.56)).toBe(123.456)
    })

    it("should default to 0 for invalid types", () => {
      const product = {
        commission_type: "invalid" as any,
        commission_value: 10,
        commission_amount: 0,
        commission_percent: 10,
      }

      expect(calculateCommission(product, 1000)).toBe(0)
    })
  })
})
