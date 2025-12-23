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
      // All zeros is valid (sum = 0, check digit = 0)
      expect(luhnCheck("000000000000000")).toBe(true)
    })

    it("should reject incorrect checksums", () => {
      // These have wrong check digits
      expect(luhnCheck("000000000000001")).toBe(false)
      expect(luhnCheck("123456789012345")).toBe(false)
      expect(luhnCheck("111111111111111")).toBe(false)
    })
  })

  describe("validateImei", () => {
    it("should return valid for correct IMEI", () => {
      const result = validateImei("000000000000000")
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it("should return error for invalid format", () => {
      const result = validateImei("12345")
      expect(result.valid).toBe(false)
      expect(result.error).toBe("IMEI must be exactly 15 digits")
    })

    it("should return error for invalid checksum", () => {
      const result = validateImei("123456789012345")
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Invalid IMEI checksum (Luhn validation failed)")
    })

    it("should handle formatted IMEI", () => {
      const result = validateImei("000000-000000-000")
      expect(result.valid).toBe(true)
    })
  })
})
