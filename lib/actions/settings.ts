"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { ThemeConfig } from "@/lib/utils/theme"

const themeConfigSchema = z.object({
    primary: z.object({ light: z.string(), dark: z.string() }),
    secondary: z.object({ light: z.string(), dark: z.string() }),
    accent: z.object({ light: z.string(), dark: z.string() }),
    sidebar: z.object({ light: z.string(), dark: z.string() }),
    background: z.object({ light: z.string(), dark: z.string() }),
    foreground: z.object({ light: z.string(), dark: z.string() }),
    radius: z.string(),
})

export async function updateThemeSettings(config: ThemeConfig) {
    try {
        const supabase = await createClient()

        // Check permissions (admin only)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Unauthorized")

        const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single()

        if (profile?.role !== "admin") {
            throw new Error("Forbidden: Admin access required")
        }

        // Validate config
        const validated = themeConfigSchema.safeParse(config)
        if (!validated.success) {
            throw new Error("Invalid configuration format")
        }

        // Update settings
        const { error } = await supabase
            .from("system_settings")
            .upsert({
                key: "theme_config",
                value: config,
                updated_by: user.id,
                updated_at: new Date().toISOString()
            }, { onConflict: "key" })

        if (error) throw error

        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Failed to update theme settings:", error)
        return { success: false, error: "Failed to save settings" }
    }
}

export async function getThemeSettings(): Promise<ThemeConfig | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "theme_config")
        .single()

    if (error || !data) return null

    return data.value as ThemeConfig
}
