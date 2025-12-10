/**
 * Converts data array to CSV string
 */
export function arrayToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return ""

  const headers = Object.keys(data[0])
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header]
        const stringValue = String(value ?? "")
        // Escape quotes and wrap in quotes if contains comma or quotes
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      })
      .join(","),
  )

  return [headers.join(","), ...rows].join("\n")
}

/**
 * Parses CSV string to array of objects
 * Handles quoted fields with commas
 */
export function csvToArray(csv: string): Record<string, string>[] {
  const lines = csv.trim().split("\n")
  if (lines.length === 0) return []

  const headers = parseCSVLine(lines[0])
  const result: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    const values = parseCSVLine(lines[i])
    const obj: Record<string, string> = {}

    headers.forEach((header, index) => {
      obj[header] = values[index]?.trim() || ""
    })

    result.push(obj)
  }

  return result
}

/**
 * Parses a single CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++
      } else {
        // Toggle quotes
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      // Field separator
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

/**
 * Validates product import CSV structure
 */
export function validateProductCSV(data: Record<string, string>[]): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const requiredFields = ["sku", "name", "category", "price"]

  if (data.length === 0) {
    errors.push("CSV file is empty")
    return { valid: false, errors }
  }

  // Check headers
  const headers = Object.keys(data[0])
  const missingFields = requiredFields.filter((field) => !headers.includes(field))

  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(", ")}`)
  }

  // Validate each row
  data.forEach((row, index) => {
    const rowNum = index + 2 // +2 because of header and 0-based index

    if (!row.sku) errors.push(`Row ${rowNum}: SKU is required`)
    if (!row.name) errors.push(`Row ${rowNum}: Name is required`)
    if (!row.category) errors.push(`Row ${rowNum}: Category is required`)

    const price = Number.parseFloat(row.price)
    if (isNaN(price) || price < 0) {
      errors.push(`Row ${rowNum}: Invalid price`)
    }

    if (row.category && !["Flagship", "Mid-Range", "Rugged", "Budget"].includes(row.category)) {
      errors.push(`Row ${rowNum}: Invalid category (must be Flagship, Mid-Range, Rugged, or Budget)`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}
