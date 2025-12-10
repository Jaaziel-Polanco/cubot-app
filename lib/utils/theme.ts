export type ThemeColor = {
  light: string
  dark: string
}

export type ThemeConfig = {
  primary: ThemeColor
  secondary: ThemeColor
  accent: ThemeColor
  sidebar: ThemeColor
  background: ThemeColor
  foreground: ThemeColor
  radius: string
}

export const defaultTheme: ThemeConfig = {
  primary: {
    light: "oklch(0.52 0.15 250)",
    dark: "oklch(0.6 0.15 250)",
  },
  secondary: {
    light: "oklch(0.65 0.03 250)",
    dark: "oklch(0.3 0.03 250)",
  },
  accent: {
    light: "oklch(0.45 0.18 260)",
    dark: "oklch(0.5 0.18 260)",
  },
  sidebar: {
    light: "oklch(0.25 0.03 250)",
    dark: "oklch(0.18 0.02 250)",
  },
  background: {
    light: "oklch(0.99 0.005 240)",
    dark: "oklch(0.15 0.02 250)",
  },
  foreground: {
    light: "oklch(0.2 0.02 250)",
    dark: "oklch(0.95 0.01 240)",
  },
  radius: "0.625rem",
}

export function applyTheme(theme: ThemeConfig) {
  const root = document.documentElement

  // Light mode
  root.style.setProperty("--primary", theme.primary.light)
  root.style.setProperty("--secondary", theme.secondary.light)
  root.style.setProperty("--accent", theme.accent.light)
  root.style.setProperty("--sidebar", theme.sidebar.light)
  root.style.setProperty("--background", theme.background.light)
  root.style.setProperty("--foreground", theme.foreground.light)
  root.style.setProperty("--radius", theme.radius)

  // Update dark mode variables in the .dark class
  const style = document.createElement("style")
  style.textContent = `
    .dark {
      --primary: ${theme.primary.dark};
      --secondary: ${theme.secondary.dark};
      --accent: ${theme.accent.dark};
      --sidebar: ${theme.sidebar.dark};
      --background: ${theme.background.dark};
      --foreground: ${theme.foreground.dark};
    }
  `

  // Remove old dynamic styles
  const oldStyle = document.getElementById("dynamic-theme")
  if (oldStyle) {
    oldStyle.remove()
  }

  style.id = "dynamic-theme"
  document.head.appendChild(style)

  // Save to localStorage
  localStorage.setItem("cubot-theme", JSON.stringify(theme))
}

export function loadTheme(): ThemeConfig {
  const saved = localStorage.getItem("cubot-theme")
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return defaultTheme
    }
  }
  return defaultTheme
}

export function resetTheme() {
  localStorage.removeItem("cubot-theme")
  applyTheme(defaultTheme)
}
