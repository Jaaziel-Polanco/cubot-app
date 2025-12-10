import type { Product } from "@/lib/types"

/**
 * Calculates commission amount based on product settings
 */
export function calculateCommission(product: Product, salePrice: number): number {
  if (product.commission_type === "fixed") {
    return product.commission_value
  } else {
    // Percentage
    return (salePrice * product.commission_value) / 100
  }
}

/**
 * Formats currency for display (Pesos Dominicanos)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(amount)
}
