import { createClient } from "@/lib/supabase/server"
import type { Product } from "@/lib/types"
import { logAudit } from "./audit"

/**
 * Gets all active products
 */
export async function getActiveProducts(): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("products").select("*").eq("active", true).order("name")

  if (error) throw error
  return data
}

/**
 * Gets all products (admin only)
 */
export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("products").select("*").order("name")

  if (error) throw error
  return data
}

/**
 * Creates a product
 */
export async function createProduct(
  product: Omit<Product, "id" | "created_at" | "updated_at">,
  adminId: string,
): Promise<Product> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("products").insert(product).select().single()

  if (error) {
    console.error("[v0] Error creating product:", error)
    throw new Error(`Error al crear producto: ${error.message}`)
  }

  // Log audit (don't fail if audit fails)
  try {
    await logAudit({
      actor_id: adminId,
      action: "create_product",
      entity: "products",
      entity_id: data.id,
      diff: { new_values: data },
    })
  } catch (auditError) {
    console.warn("[v0] Failed to log audit, continuing:", auditError)
  }

  return data
}

/**
 * Updates a product
 */
export async function updateProduct(productId: string, updates: Partial<Product>, adminId: string): Promise<Product> {
  const supabase = await createClient()

  const { data: old } = await supabase.from("products").select("*").eq("id", productId).single()

  if (!old) {
    throw new Error("Producto no encontrado")
  }

  const { data, error } = await supabase.from("products").update(updates).eq("id", productId).select().single()

  if (error) {
    console.error("[v0] Error updating product:", error)
    throw new Error(`Error al actualizar producto: ${error.message}`)
  }

  // Log audit (don't fail if audit fails)
  try {
    await logAudit({
      actor_id: adminId,
      action: "update_product",
      entity: "products",
      entity_id: productId,
      diff: { old_values: old, new_values: data },
    })
  } catch (auditError) {
    console.warn("[v0] Failed to log audit, continuing:", auditError)
  }

  return data
}
