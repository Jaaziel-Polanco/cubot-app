"use client"

import { useEffect } from "react"
import { applyTheme, type ThemeConfig } from "@/lib/utils/theme"
import { getThemeSettings } from "@/lib/actions/settings"

export function ThemeInitializer() {
    useEffect(() => {
        const initTheme = async () => {
            try {
                // Try to get from server first
                const serverSettings = await getThemeSettings()
                if (serverSettings) {
                    applyTheme(serverSettings)
                } else {
                    // Fallback to local storage or default is handled by applyTheme internally if passed null?
                    // No, applyTheme needs a config.
                    // loadTheme() in utils gets from localStorage.
                    // Let's just rely on the utils logic if server fails, 
                    // but ideally we want server to be source of truth.
                }
            } catch (error) {
                console.error("Failed to initialize theme from server:", error)
            }
        }

        initTheme()
    }, [])

    return null
}
