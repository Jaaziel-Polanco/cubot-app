"use client"

import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { applyTheme, loadTheme, resetTheme, type ThemeConfig, defaultTheme } from "@/lib/utils/theme"
import { Paintbrush, RotateCcw, Save, Loader2 } from "lucide-react"
import { updateThemeSettings } from "@/lib/actions/settings"
import { toast } from "sonner"

export function ThemeCustomizer() {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme)
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const loaded = loadTheme()
    setTheme(loaded)
    applyTheme(loaded)
  }, [])

  const handleColorChange = (category: keyof ThemeConfig, mode: "light" | "dark", value: string) => {
    if (category === "radius") return

    // Convert hex to OKLCH if needed (simplified for now, assuming user inputs valid CSS color or uses picker)
    // For the color picker, we might need a helper to convert Hex <-> OKLCH if we want true bi-directional editing.
    // For now, let's allow direct input or simple hex if the browser supports it in CSS variables.
    // Note: <input type="color"> returns Hex. We need to ensure our CSS variables handle it or convert it.
    // Our globals.css uses oklch() directly. Mixing hex might break if we rely on oklch interpolation.
    // Ideally we'd convert, but for simplicity let's assume we just pass the value.
    // Wait, the prompt asked for "user friendly". Hex is friendly.
    // Let's assume we update the CSS var to just take the value.

    const updated = {
      ...theme,
      [category]: {
        ...(theme[category] as any),
        [mode]: value,
      },
    }
    setTheme(updated)
    applyTheme(updated)
  }

  const handleRadiusChange = (value: string) => {
    const updated = {
      ...theme,
      radius: value,
    }
    setTheme(updated)
    applyTheme(updated)
  }

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateThemeSettings(theme)
      if (result.success) {
        toast.success("Tema guardado en el sistema")
      } else {
        toast.error("Error al guardar el tema")
      }
    })
  }

  const handleReset = () => {
    resetTheme()
    setTheme(defaultTheme)
    toast.info("Tema restaurado a valores por defecto")
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg bg-background/80 backdrop-blur-sm border-primary/20 hover:border-primary transition-all"
        onClick={() => setIsOpen(true)}
      >
        <Paintbrush className="h-5 w-5 text-primary" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 shadow-2xl glass border-primary/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Personalizar Tema</CardTitle>
            <CardDescription>Modifica los colores de la interfaz</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="max-h-[70vh] space-y-6 overflow-y-auto pr-2">
        <Tabs defaultValue="primary" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="primary">Principal</TabsTrigger>
            <TabsTrigger value="secondary">Secundario</TabsTrigger>
            <TabsTrigger value="other">Otros</TabsTrigger>
          </TabsList>

          <TabsContent value="primary" className="space-y-4">
            <ColorInput
              label="Primario (Claro)"
              value={theme.primary.light}
              onChange={(v) => handleColorChange("primary", "light", v)}
            />
            <ColorInput
              label="Primario (Oscuro)"
              value={theme.primary.dark}
              onChange={(v) => handleColorChange("primary", "dark", v)}
            />
          </TabsContent>

          <TabsContent value="secondary" className="space-y-4">
            <ColorInput
              label="Secundario (Claro)"
              value={theme.secondary.light}
              onChange={(v) => handleColorChange("secondary", "light", v)}
            />
            <ColorInput
              label="Secundario (Oscuro)"
              value={theme.secondary.dark}
              onChange={(v) => handleColorChange("secondary", "dark", v)}
            />
            <ColorInput
              label="Acento (Claro)"
              value={theme.accent.light}
              onChange={(v) => handleColorChange("accent", "light", v)}
            />
            <ColorInput
              label="Acento (Oscuro)"
              value={theme.accent.dark}
              onChange={(v) => handleColorChange("accent", "dark", v)}
            />
          </TabsContent>

          <TabsContent value="other" className="space-y-4">
            <ColorInput
              label="Sidebar (Claro)"
              value={theme.sidebar.light}
              onChange={(v) => handleColorChange("sidebar", "light", v)}
            />
            <ColorInput
              label="Sidebar (Oscuro)"
              value={theme.sidebar.dark}
              onChange={(v) => handleColorChange("sidebar", "dark", v)}
            />
            <div className="space-y-2">
              <Label>Radio de Bordes</Label>
              <div className="flex gap-2">
                {["0rem", "0.3rem", "0.5rem", "0.75rem", "1rem"].map((r) => (
                  <button
                    key={r}
                    className={`h-8 w-8 border-2 ${theme.radius === r ? "border-primary" : "border-muted"} bg-muted/20 hover:bg-muted/40 transition-colors`}
                    style={{ borderRadius: r }}
                    onClick={() => handleRadiusChange(r)}
                  />
                ))}
              </div>
              <Input
                type="text"
                value={theme.radius}
                onChange={(e) => handleRadiusChange(e.target.value)}
                className="mt-2 font-mono text-xs"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleReset} variant="outline" className="flex-1" disabled={isPending}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} className="flex-1" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ColorInput({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="flex gap-2">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border shadow-sm">
          {/* 
             Note: Native color picker only supports Hex. 
             If 'value' is OKLCH, the color input won't show it correctly.
             For a true production app we'd need a color conversion library.
             For now, we allow text editing and provide a picker that outputs Hex.
           */}
          <input
            type="color"
            className="absolute -inset-2 h-16 w-16 cursor-pointer p-0 opacity-0"
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="h-full w-full" style={{ backgroundColor: value }} />
        </div>
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs"
        />
      </div>
    </div>
  )
}
