/**
 * Checks if string matches IMEI format (15 digits)
 */
export function isImeiFormat(str: string): boolean {
  return /^\d{15}$/.test(str.replace(/[\s-]/g, ""))
}

/**
 * Luhn algorithm check for IMEI validation
 */
export function luhnCheck(imei: string): boolean {
  const cleaned = imei.replace(/[\s-]/g, "")

  if (cleaned.length !== 15) return false

  let sum = 0
  let shouldDouble = false

  // Process from right to left, excluding the last digit (check digit)
  for (let i = cleaned.length - 2; i >= 0; i--) {
    let digit = Number.parseInt(cleaned[i], 10)

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  // Calculate check digit
  const checkDigit = (10 - (sum % 10)) % 10
  const lastDigit = Number.parseInt(cleaned[cleaned.length - 1], 10)

  return checkDigit === lastDigit
}

/**
 * Complete IMEI validation (format + Luhn)
 * Returns { valid: boolean; error?: string }
 */
export function validateImei(imei: string): { valid: boolean; error?: string } {
  const cleaned = imei.replace(/[\s-]/g, "")

  if (!isImeiFormat(cleaned)) {
    return {
      valid: false,
      error: "IMEI must be exactly 15 digits",
    }
  }

  if (!luhnCheck(cleaned)) {
    return {
      valid: false,
      error: "Invalid IMEI checksum (Luhn validation failed)",
    }
  }

  return { valid: true }
}

/**
 * Masks IMEI for display (shows only last 4 digits)
 */
export function maskImei(imei: string): string {
  if (imei.length < 4) return "***"
  return `***********${imei.slice(-4)}`
}

/**
 * Formats IMEI with dashes for display
 */
export function formatImei(imei: string): string {
  const cleaned = imei.replace(/[\s-]/g, "")
  if (cleaned.length !== 15) return imei

  return `${cleaned.slice(0, 6)}-${cleaned.slice(6, 12)}-${cleaned.slice(12)}`
}
