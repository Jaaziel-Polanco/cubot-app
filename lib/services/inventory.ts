import type { InventoryCheckResult } from "@/lib/types"

/**
 * Masks IMEI for logging (shows only last 4 digits)
 * Exported for use in other modules
 */
export function maskImeiForLog(imei: string): string {
  if (!imei || imei.length < 4) return "***"
  return `***********${imei.slice(-4)}`
}

/**
 * Checks inventory availability via external CUBOT API
 * Endpoint: GET /api/Producto/Imei?imei={imei}
 * Returns: { success: boolean, result: {...} }
 * 
 * Response structure:
 * {
 *   success: boolean,
 *   result: {
 *     id: number,
 *     imei: string,
 *     marca: string,
 *     modelo: string,
 *     color: string,
 *     capacidad: string,
 *     precio: number,
 *     estatus: boolean,
 *     fechaCreacion: string (ISO date)
 *   }
 * }
 */
export async function checkInventoryByImei(imei: string): Promise<InventoryCheckResult | null> {
  const base = process.env.INVENTORY_API_URL || "https://www.zodilum.com:8089"
  const key = process.env.INVENTORY_API_KEY

  // Validate configuration - CRITICAL: Must have API credentials
  if (!base || base.trim().length === 0) {
    console.error("[Inventory] ERROR: INVENTORY_API_URL not configured or empty")
    return null
  }

  if (!key || key.trim().length === 0) {
    console.error("[Inventory] ERROR: INVENTORY_API_KEY not configured or empty")
    return null
  }

  const maxRetries = 3
  let attempt = 0
  let lastError: unknown = null

  while (attempt < maxRetries) {
    attempt++
    console.log(`[Inventory] Checking IMEI ${maskImeiForLog(imei)} (Attempt ${attempt}/${maxRetries})`)

    try {
      const url = `${base}/api/Producto/Imei?imei=${encodeURIComponent(imei)}`

      // Create AbortController for timeout (30 seconds)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      try {
        const startTime = Date.now()
        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
          signal: controller.signal,
        })
        const duration = Date.now() - startTime
        clearTimeout(timeoutId)

        console.log(`[Inventory] Response received in ${duration}ms - Status: ${res.status}`)

        if (res.status >= 500) {
          console.warn(`[Inventory] Server error ${res.status}. Retrying...`)
          throw new Error(`Server error ${res.status}`)
        }

        if (!res.ok) {
          console.error(`[Inventory] API error: Status ${res.status}`)
          return null // Don't retry on 4xx errors (client error)
        }

        const data = await res.json()

        if (data?.success === true && data?.result) {
          const r = data.result
          let addedToInventory: string | null = null
          if (r.fechaCreacion) {
            const date = new Date(r.fechaCreacion)
            if (!isNaN(date.getTime())) addedToInventory = date.toISOString()
          }

          const result: InventoryCheckResult = {
            id: String(r.id ?? ""),
            imei: r.imei ?? imei,
            brand: r.marca ?? "",
            model: r.modelo ?? "",
            color: r.color ?? "",
            capacity: r.capacidad ?? "",
            price: Number(r.precio ?? 0),
            status: r.estatus === true ? "disponible" : "no disponible",
            addedToInventory,
          }
          return result
        }

        return null // Success false or no result
      } catch (fetchError: unknown) {
        clearTimeout(timeoutId)
        throw fetchError
      }
    } catch (error: unknown) {
      lastError = error
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`[Inventory] Attempt ${attempt} failed:`, errorMessage)

      if (attempt >= maxRetries) {
        console.error(`[Inventory] All retries failed for IMEI ${maskImeiForLog(imei)}`)
        return null
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  return null
}

/**
 * Verifies if an IMEI exists in the external inventory system
 * @param imei - The IMEI to check
 * @returns true if the IMEI exists in inventory, false otherwise
 */
export async function isInventoryPhone(imei: string): Promise<boolean> {
  const phone = await checkInventoryByImei(imei)
  return phone !== null
}

/**
 * Checks if an IMEI is available (exists AND status is "disponible")
 * @param imei - The IMEI to check
 * @returns true if available, false otherwise
 */
export async function isInventoryPhoneAvailable(imei: string): Promise<boolean> {
  const phone = await checkInventoryByImei(imei)
  return phone !== null && phone.status === "disponible"
}
