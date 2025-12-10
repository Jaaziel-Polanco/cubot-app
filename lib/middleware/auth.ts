import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * Middleware to check if user is authenticated
 */
export async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      user: null,
    }
  }

  return { user, error: null }
}

/**
 * Middleware to check if user has admin role
 */
export async function requireAdmin() {
  const { user, error } = await requireAuth()

  if (error) return { error, user: null, profile: null }

  const supabase = await createClient()
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    return {
      error: NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 }),
      user: null,
      profile: null,
    }
  }

  return { user, profile, error: null }
}

/**
 * Middleware to check if user is vendor
 */
export async function requireVendor() {
  const { user, error } = await requireAuth()

  if (error) return { error, user: null, profile: null }

  const supabase = await createClient()
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "vendor") {
    return {
      error: NextResponse.json({ error: "Forbidden: Vendor access required" }, { status: 403 }),
      user: null,
      profile: null,
    }
  }

  return { user, profile, error: null }
}
