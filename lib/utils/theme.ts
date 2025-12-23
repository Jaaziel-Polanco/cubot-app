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
  // Create dynamic style tag for both light and dark mode
  // This avoids setting inline styles on :root which would override the dark mode CSS
  const style = document.createElement("style")
  style.textContent = `
    :root {
      --primary: ${theme.primary.light};
      --secondary: ${theme.secondary.light};
      --accent: ${theme.accent.light};
      --sidebar: ${theme.sidebar.light};
      --background: ${theme.background.light};
      --foreground: ${theme.foreground.light};
      --radius: ${theme.radius};
    }
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
