"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/types"
import { toast } from "@/lib/utils/toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ProfileForm({ profile }: { profile: User }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile.name || "",
    phone: profile.phone || "",
    identification_number: profile.identification_number || "",
    address: profile.address || "",
    city: profile.city || "",
    state: profile.state || "",
    postal_code: profile.postal_code || "",
    country: profile.country || "DO",
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/vendor/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        let errorMessage = "Error al actualizar el perfil"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (parseError) {
          const text = await response.text()
          errorMessage = text || errorMessage
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      toast.success("¡Perfil actualizado exitosamente!", "Tu información ha sido guardada correctamente")
      router.refresh()
    } catch (error: any) {
      toast.error("Error al actualizar el perfil", error.message || "Por favor, intenta nuevamente")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Personal</CardTitle>
        <CardDescription>Completa tu información personal para verificación</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!profile.identification_number && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Debes completar tu cédula de identidad o RNC para la verificación KYC.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">
                Nombre Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                placeholder="Juan Pérez"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="809-555-1234"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="identification_number">
                Cédula de Identidad o RNC <span className="text-red-500">*</span>
              </Label>
              <Input
                id="identification_number"
                type="text"
                value={formData.identification_number}
                onChange={(e) => setFormData({ ...formData, identification_number: e.target.value })}
                required
                placeholder="001-1234567-8 o 123-45678-9"
                className={!profile.identification_number ? "border-yellow-500" : ""}
              />
              <p className="text-xs text-muted-foreground">
                Requerido para verificación KYC. Formato: 001-1234567-8 (cédula) o 123-45678-9 (RNC)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="DO"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Calle Principal #123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Santo Domingo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Provincia/Estado</Label>
              <Input
                id="state"
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Distrito Nacional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Código Postal</Label>
              <Input
                id="postal_code"
                type="text"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                placeholder="10101"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
