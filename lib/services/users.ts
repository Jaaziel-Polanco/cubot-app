import { createClient } from "@/lib/supabase/server"
import type { User } from "@/lib/types"
import { generateVendorId } from "@/lib/utils/ids"
import { logAudit } from "./audit"

/**
 * Gets user by auth ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error) return null
  return data
}

/**
 * Creates or updates user profile
 */
export async function upsertUserProfile(userId: string, profile: Partial<User>): Promise<User> {
  const supabase = await createClient()

  // Check if user exists
  const existing = await getUserById(userId)

  if (existing) {
    // Update existing - only update provided fields
    const { data, error } = await supabase
      .from("users")
      .update(profile)
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating user profile:", error)
      throw new Error(`Error al actualizar perfil: ${error.message}`)
    }

    // Log audit (don't fail if audit fails)
    try {
      await logAudit({
        actor_id: userId,
        action: "update_profile",
        entity: "users",
        entity_id: userId,
        diff: { old_values: existing, new_values: data },
      })
    } catch (auditError) {
      console.warn("[v0] Failed to log audit, continuing:", auditError)
    }

    return data
  } else {
    // Generate vendor ID if role is vendor
    let vendor_id = null
    if (profile.role === "vendor") {
      const { count } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "vendor")

      vendor_id = generateVendorId(count || 0)
    }

    // Create new
    const { data, error } = await supabase
      .from("users")
      .insert({
        id: userId,
        vendor_id,
        ...profile,
      })
      .select()
      .single()

    if (error) throw error

    await logAudit({
      actor_id: userId,
      action: "create_profile",
      entity: "users",
      entity_id: userId,
      diff: { new_values: data },
    })

    return data
  }
}

/**
 * Gets all vendors
 */
export async function getAllVendors(): Promise<User[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "vendor")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

/**
 * Updates user status
 */
export async function updateUserStatus(userId: string, isActive: boolean, adminId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from("users").update({ status: isActive ? "active" : "suspended" }).eq("id", userId)

  if (error) throw error

  await logAudit({
    actor_id: adminId,
    action: "update_user_status",
    entity: "users",
    entity_id: userId,
    diff: { new_values: { status: isActive ? "active" : "suspended" } },
  })
}
