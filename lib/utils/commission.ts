import type { Product } from "@/lib/types"

/**
 * Calculates commission amount based on product settings
 */
export function calculateCommission(product: Product, salePrice: number): number {
  // Priority: fixed amount over percentage
  if (product.commission_amount && product.commission_amount > 0) {
    return product.commission_amount
  } else if (product.commission_percent && product.commission_percent > 0) {
    return (salePrice * product.commission_percent) / 100
  }
  // Default: 0 commission
  return 0
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
