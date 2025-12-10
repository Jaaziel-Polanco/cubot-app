import { createClient } from "@/lib/supabase/server"
import type { Bank, VendorBankAccount } from "@/lib/types"
import { logAudit } from "./audit"

/**
 * Gets all active banks
 */
export async function getActiveBanks(): Promise<Bank[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("banks")
    .select("*")
    .eq("active", true)
    .order("name", { ascending: true })

  if (error) throw error
  return data
}

/**
 * Gets all banks (admin only)
 */
export async function getAllBanks(): Promise<Bank[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("banks").select("*").order("name", { ascending: true })

  if (error) throw error
  return data
}

/**
 * Creates a new bank (admin only)
 */
export async function createBank(data: {
  name: string
  code: string
  country?: string
  account_number_format?: string
  admin_id: string
}): Promise<Bank> {
  const supabase = await createClient()

  const { data: bank, error } = await supabase
    .from("banks")
    .insert({
      name: data.name,
      code: data.code.toUpperCase(),
      country: data.country || "DO",
      account_number_format: data.account_number_format,
      active: true,
      created_by: data.admin_id,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating bank:", error)
    throw new Error(`Error al crear banco: ${error.message}`)
  }

  // Log audit (don't fail if audit fails)
  try {
    await logAudit({
      actor_id: data.admin_id,
      action: "create_bank",
      entity: "banks",
      entity_id: bank.id,
      diff: { new_values: bank },
    })
  } catch (auditError) {
    console.warn("[v0] Failed to log audit, continuing:", auditError)
  }

  return bank
}

/**
 * Updates a bank (admin only)
 */
export async function updateBank(
  bankId: string,
  updates: Partial<Pick<Bank, "name" | "code" | "country" | "account_number_format" | "active">>,
  adminId: string,
): Promise<Bank> {
  const supabase = await createClient()

  const { data: oldBank } = await supabase.from("banks").select("*").eq("id", bankId).single()

  const updateData: Partial<Bank> = { ...updates }
  if (updates.code) {
    updateData.code = updates.code.toUpperCase()
  }

  const { data: bank, error } = await supabase
    .from("banks")
    .update(updateData)
    .eq("id", bankId)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating bank:", error)
    throw new Error(`Error al actualizar banco: ${error.message}`)
  }

  if (!oldBank) {
    throw new Error("Banco no encontrado")
  }

  // Log audit (don't fail if audit fails)
  try {
    await logAudit({
      actor_id: adminId,
      action: "update_bank",
      entity: "banks",
      entity_id: bankId,
      diff: { old_values: oldBank, new_values: bank },
    })
  } catch (auditError) {
    console.warn("[v0] Failed to log audit, continuing:", auditError)
  }

  return bank
}

/**
 * Deletes a bank (admin only, soft delete by setting active=false)
 */
export async function deleteBank(bankId: string, adminId: string): Promise<void> {
  const supabase = await createClient()

  // Check if any vendor has accounts in this bank
  const { count } = await supabase
    .from("vendor_bank_accounts")
    .select("*", { count: "exact", head: true })
    .eq("bank_id", bankId)

  if (count && count > 0) {
    // Soft delete: set active to false
    await updateBank(bankId, { active: false }, adminId)
  } else {
    // Hard delete if no accounts exist
    const { error } = await supabase.from("banks").delete().eq("id", bankId)
    if (error) throw error

    // Log audit (don't fail if audit fails)
    try {
      await logAudit({
        actor_id: adminId,
        action: "delete_bank",
        entity: "banks",
        entity_id: bankId,
        diff: {},
      })
    } catch (auditError) {
      console.warn("[v0] Failed to log audit, continuing:", auditError)
    }
  }
}

/**
 * Gets vendor bank accounts
 */
export async function getVendorBankAccounts(vendorId: string): Promise<VendorBankAccount[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("vendor_bank_accounts")
    .select("*, banks(*)")
    .eq("vendor_id", vendorId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

/**
 * Gets primary bank account for a vendor
 */
export async function getPrimaryBankAccount(vendorId: string): Promise<VendorBankAccount | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("vendor_bank_accounts")
    .select("*, banks(*)")
    .eq("vendor_id", vendorId)
    .eq("is_primary", true)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null // No rows found
    throw error
  }
  return data
}

/**
 * Creates or updates vendor bank account
 */
export async function upsertVendorBankAccount(
  data: {
    vendor_id: string
    bank_id: string
    account_number: string
    account_holder_name: string
    account_type?: "checking" | "savings" | "current"
    is_primary?: boolean
  },
): Promise<VendorBankAccount> {
  const supabase = await createClient()

  // If setting as primary, unset other primary accounts
  if (data.is_primary) {
    await supabase
      .from("vendor_bank_accounts")
      .update({ is_primary: false })
      .eq("vendor_id", data.vendor_id)
      .eq("is_primary", true)
  }

  // Check if account already exists
  const { data: existing } = await supabase
    .from("vendor_bank_accounts")
    .select("*")
    .eq("vendor_id", data.vendor_id)
    .eq("bank_id", data.bank_id)
    .eq("account_number", data.account_number)
    .single()

  if (existing) {
    // Update existing
    const { data: account, error } = await supabase
      .from("vendor_bank_accounts")
      .update({
        account_holder_name: data.account_holder_name,
        account_type: data.account_type,
        is_primary: data.is_primary ?? false,
        verified: false, // Reset verification on update
        verified_by: null,
        verified_at: null,
      })
      .eq("id", existing.id)
      .select("*, banks(*)")
      .single()

    if (error) throw error
    return account
  } else {
    // Create new
    const { data: account, error } = await supabase
      .from("vendor_bank_accounts")
      .insert({
        vendor_id: data.vendor_id,
        bank_id: data.bank_id,
        account_number: data.account_number,
        account_holder_name: data.account_holder_name,
        account_type: data.account_type,
        is_primary: data.is_primary ?? false,
        verified: false,
      })
      .select("*, banks(*)")
      .single()

    if (error) throw error
    return account
  }
}

/**
 * Deletes vendor bank account
 */
export async function deleteVendorBankAccount(accountId: string, vendorId: string): Promise<void> {
  const supabase = await createClient()

  // Check if it's primary
  const { data: account } = await supabase
    .from("vendor_bank_accounts")
    .select("is_primary")
    .eq("id", accountId)
    .eq("vendor_id", vendorId)
    .single()

  if (account?.is_primary) {
    throw new Error("Cannot delete primary bank account. Set another account as primary first.")
  }

  const { error } = await supabase.from("vendor_bank_accounts").delete().eq("id", accountId).eq("vendor_id", vendorId)

  if (error) throw error
}

/**
 * Verifies vendor bank account (admin only)
 */
export async function verifyVendorBankAccount(accountId: string, adminId: string): Promise<VendorBankAccount> {
  const supabase = await createClient()

  const { data: account, error } = await supabase
    .from("vendor_bank_accounts")
    .update({
      verified: true,
      verified_by: adminId,
      verified_at: new Date().toISOString(),
    })
    .eq("id", accountId)
    .select("*, banks(*)")
    .single()

  if (error) throw error

  await logAudit({
    actor_id: adminId,
    action: "verify_bank_account",
    entity: "vendor_bank_accounts",
    entity_id: accountId,
    diff: { new_values: { verified: true } },
  })

  return account
}

