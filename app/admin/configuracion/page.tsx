"use client"

import { ThemeCustomizer } from "@/components/theme-customizer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"

export default function ConfiguracionPage() {
  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Configuración del Sistema
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Personaliza la apariencia y comportamiento de CUBOT
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glass-card border-primary/10 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              Apariencia
            </CardTitle>
            <CardDescription>
              Personaliza los colores y el tema visual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Usa el botón flotante <span className="inline-block p-1 bg-primary/10 rounded-full"><span className="h-3 w-3 bg-primary rounded-full inline-block" /></span> en la esquina inferior derecha para abrir el editor de temas.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
              <span>💡</span>
              <span>Los cambios se guardan en el sistema y afectan a todos los usuarios.</span>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for future settings */}
        <Card className="glass-card border-primary/10 opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🔔</span>
              Notificaciones
            </CardTitle>
            <CardDescription>Configuración de alertas (Próximamente)</CardDescription>
          </CardHeader>
        </Card>

        <Card className="glass-card border-primary/10 opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              Seguridad
            </CardTitle>
            <CardDescription>Políticas de acceso (Próximamente)</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <ThemeCustomizer />
    </div>
  )
}
