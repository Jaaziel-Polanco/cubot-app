/**
 * Generates vendor ID (VND-001, VND-002, etc.)
 */
export function generateVendorId(lastNumber: number): string {
  const nextNumber = lastNumber + 1
  return `VND-${nextNumber.toString().padStart(3, "0")}`
}

/**
 * Generates sale transaction ID (VT-YYYYMMDD-001, etc.)
 */
export function generateSaleId(date: Date, dailyCount: number): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  const count = (dailyCount + 1).toString().padStart(3, "0")

  return `VT-${year}${month}${day}-${count}`
}

/**
 * Generates payment batch ID (PB-YYYYMMDD-001, etc.)
 */
export function generateBatchId(date: Date, dailyCount: number): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  const count = (dailyCount + 1).toString().padStart(3, "0")

  return `PB-${year}${month}${day}-${count}`
}
