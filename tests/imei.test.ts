import { describe, it, expect } from "vitest"
import { isImeiFormat, luhnCheck, validateImei } from "../lib/utils/imei"

describe("IMEI Validation", () => {
  describe("isImeiFormat", () => {
    it("should validate 15-digit IMEI", () => {
      expect(isImeiFormat("123456789012345")).toBe(true)
    })

    it("should reject non-15-digit strings", () => {
      expect(isImeiFormat("12345678901234")).toBe(false) // 14 digits
      expect(isImeiFormat("1234567890123456")).toBe(false) // 16 digits
      expect(isImeiFormat("")).toBe(false)
    })

    it("should reject non-numeric strings", () => {
      expect(isImeiFormat("12345678901234A")).toBe(false)
      expect(isImeiFormat("123456789012-45")).toBe(false)
    })

    it("should handle IMEI with spaces/dashes", () => {
      expect(isImeiFormat("123456-789012-345")).toBe(true)
      expect(isImeiFormat("123456 789012 345")).toBe(true)
    })
  })

  describe("luhnCheck", () => {
    it("should validate correct IMEI checksums", () => {
      // Valid IMEI with correct Luhn checksum
      expect(luhnCheck("490154203237518")).toBe(true)
      expect(luhnCheck("356938035643809")).toBe(true)
      expect(luhnCheck("352099001761481")).toBe(true)
    })

    it("should reject incorrect checksums", () => {
      expect(luhnCheck("490154203237519")).toBe(false) // Wrong last digit
      expect(luhnCheck("356938035643808")).toBe(false)
      expect(luhnCheck("352099001761480")).toBe(false)
    })

    it("should handle edge cases", () => {
      expect(luhnCheck("000000000000000")).toBe(true) // All zeros is valid
      expect(luhnCheck("111111111111116")).toBe(true) // Repeating digits
    })
  })

  describe("validateImei", () => {
    it("should return valid for correct IMEI", () => {
      const result = validateImei("490154203237518")
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it("should return error for invalid format", () => {
      const result = validateImei("12345")
      expect(result.valid).toBe(false)
      expect(result.error).toBe("IMEI must be exactly 15 digits")
    })

    it("should return error for invalid checksum", () => {
      const result = validateImei("490154203237519")
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Invalid IMEI checksum (Luhn validation failed)")
    })

    it("should handle formatted IMEI", () => {
      const result = validateImei("490154-203237-518")
      expect(result.valid).toBe(true)
    })
  })
})
