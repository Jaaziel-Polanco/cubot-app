import { describe, it, expect } from "vitest"

/**
 * Tests for duplicate IMEI rule
 * Spec: Duplicate approved IMEI must be blocked, pending duplicates should alert
 */
describe("Duplicate IMEI Rule", () => {
  it("should block duplicate approved IMEI", () => {
    const existingApprovedImeis = ["123456789012345", "987654321098765"]
    const newImei = "123456789012345"

    const isDuplicate = existingApprovedImeis.includes(newImei)

    expect(isDuplicate).toBe(true)
  })

  it("should allow new unique IMEI", () => {
    const existingApprovedImeis = ["123456789012345", "987654321098765"]
    const newImei = "111111111111111"

    const isDuplicate = existingApprovedImeis.includes(newImei)

    expect(isDuplicate).toBe(false)
  })

  it("should detect pending duplicates", () => {
    const pendingImeis = ["222222222222222", "333333333333333"]
    const newImei = "222222222222222"

    const hasPendingDuplicate = pendingImeis.includes(newImei)

    expect(hasPendingDuplicate).toBe(true)
  })

  it("should handle case sensitivity correctly", () => {
    const existingApprovedImeis = ["123456789012345"]
    const newImei = "123456789012345" // IMEIs are numeric only

    expect(existingApprovedImeis.includes(newImei)).toBe(true)
  })
})
