import { createClient } from "@/lib/supabase/server"
import type { AuditLog } from "@/lib/types"

interface CreateAuditLogData {
  actor_id?: string
  entity: string
  entity_id: string
  action: string
  diff?: Record<string, unknown>
}

/**
 * Creates an audit log entry
 */
export async function logAudit(data: CreateAuditLogData): Promise<AuditLog> {
  const supabase = await createClient()

  // Build diff object if old_values and new_values are provided (for backward compatibility)
  let diff: Record<string, unknown> | null = data.diff || null

  const { data: log, error } = await supabase
    .from("audit_log")
    .insert({
      actor_id: data.actor_id,
      entity: data.entity,
      entity_id: data.entity_id,
      action: data.action,
      diff: diff,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Failed to create audit log:", error)
    throw error
  }

  return log
}

/**
 * Gets audit logs with filters
 */
export async function getAuditLogs(filters?: {
  actor_id?: string
  entity?: string
  entity_id?: string
  date_from?: string
  date_to?: string
  limit?: number
}): Promise<AuditLog[]> {
  const supabase = await createClient()

  let query = supabase.from("audit_log").select("*").order("created_at", { ascending: false })

  if (filters?.actor_id) {
    query = query.eq("actor_id", filters.actor_id)
  }
  if (filters?.entity) {
    query = query.eq("entity", filters.entity)
  }
  if (filters?.entity_id) {
    query = query.eq("entity_id", filters.entity_id)
  }
  if (filters?.date_from) {
    query = query.gte("created_at", filters.date_from)
  }
  if (filters?.date_to) {
    query = query.lte("created_at", filters.date_to)
  }
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}
