"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/types"
import { toast } from "@/lib/utils/toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Check, ChevronsUpDown } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/contexts/LanguageContext"

// List of Dominican Republic provinces
const DR_PROVINCES = [
  "Azua",
  "Bahoruco",
  "Barahona",
  "Dajabón",
  "Distrito Nacional",
  "Duarte",
  "El Seibo",
  "Elías Piña",
  "Espaillat",
  "Hato Mayor",
  "Hermanas Mirabal",
  "Independencia",
  "La Altagracia",
  "La Romana",
  "La Vega",
  "María Trinidad Sánchez",
  "Monseñor Nouel",
  "Monte Cristi",
  "Monte Plata",
  "Pedernales",
  "Peravia",
  "Puerto Plata",
  "Samaná",
  "San Cristóbal",
  "San José de Ocoa",
  "San Juan",
  "San Pedro de Macorís",
  "Sánchez Ramírez",
  "Santiago",
  "Santiago Rodríguez",
  "Santo Domingo",
  "Valverde",
]

export default function ProfileForm({ profile }: { profile: User }) {
  const [loading, setLoading] = useState(false)
  const [provinceOpen, setProvinceOpen] = useState(false)
  const [provinceSearch, setProvinceSearch] = useState("")
  const { t } = useLanguage()

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

  // Filter provinces based on search
  const filteredProvinces = useMemo(() => {
    if (!provinceSearch) return DR_PROVINCES
    const searchLower = provinceSearch.toLowerCase()
    return DR_PROVINCES.filter(province =>
      province.toLowerCase().includes(searchLower)
    )
  }, [provinceSearch])

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
        let errorMessage = t("vendor.profile.form.error_update")
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
      toast.success(t("vendor.profile.form.success_title"), t("vendor.profile.form.success_desc"))
      router.refresh()
    } catch (error: any) {
      toast.error(t("vendor.profile.form.error_title"), error.message || t("vendor.profile.form.error_desc"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("vendor.profile.form.title")}</CardTitle>
        <CardDescription>{t("vendor.profile.form.desc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!profile.identification_number && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{t("vendor.profile.form.important")}:</strong> {t("vendor.profile.form.cedula_alert")}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">
                {t("vendor.profile.form.full_name")} <span className="text-destructive">*</span>
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
              <Label htmlFor="phone">{t("vendor.profile.form.phone")}</Label>
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
                {t("vendor.profile.form.cedula")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="identification_number"
                type="text"
                value={formData.identification_number}
                onChange={(e) => setFormData({ ...formData, identification_number: e.target.value })}
                required
                placeholder="001-1234567-8"
                className={!profile.identification_number ? "border-yellow-500 dark:border-yellow-400" : ""}
              />
              <p className="text-xs text-muted-foreground">
                {t("vendor.profile.form.cedula_hint")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">{t("vendor.profile.form.country")}</Label>
              <Input
                id="country"
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="DO"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">{t("vendor.profile.form.address")}</Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Calle Principal #123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">{t("vendor.profile.form.city")}</Label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Santo Domingo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">{t("vendor.profile.form.province")}</Label>
              <Popover open={provinceOpen} onOpenChange={setProvinceOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="state"
                    variant="outline"
                    role="combobox"
                    aria-expanded={provinceOpen}
                    className="w-full justify-between font-normal bg-background hover:bg-accent"
                  >
                    {formData.state || t("vendor.profile.form.select_province")}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder={t("vendor.profile.form.search_province")}
                      value={provinceSearch}
                      onValueChange={setProvinceSearch}
                    />
                    <CommandList>
                      <CommandEmpty>{t("vendor.profile.form.no_province_found")}</CommandEmpty>
                      <CommandGroup>
                        {filteredProvinces.map((province) => (
                          <CommandItem
                            key={province}
                            value={province}
                            onSelect={() => {
                              setFormData({ ...formData, state: province })
                              setProvinceOpen(false)
                              setProvinceSearch("")
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.state === province ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {province}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">{t("vendor.profile.form.zip")}</Label>
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
              {loading ? t("vendor.profile.form.saving") : t("vendor.profile.form.save")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
