"use client"

import { useState, useRef, useEffect, useActionState } from "react"
import { useRouter } from "next/navigation"
import type { Product } from "@/lib/types"
import type { InventoryCheckResult } from "@/lib/types"
import { validateImei } from "@/lib/utils/imei"
import { registerSale } from "@/lib/actions/sales"
import { toast } from "sonner"
import { useLanguage } from "@/components/contexts/LanguageContext"

const initialState = {
  message: "",
  error: "",
  success: false
}

export default function SaleForm({ products }: { products: Product[] }) {
  const { t } = useLanguage()
  const [state, formAction, isPending] = useActionState(registerSale, initialState)

  const [checkingImei, setCheckingImei] = useState(false)
  const [inventoryInfo, setInventoryInfo] = useState<InventoryCheckResult | null>(null)
  const [imeiError, setImeiError] = useState<string | null>(null)
  const [imeiStatusError, setImeiStatusError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    product_id: "",
    imei: "",
    channel: "Online",
    sale_date: new Date().toISOString().split("T")[0],
    notes: ""
  })

  const router = useRouter()
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const lastCheckedImei = useRef<string>("")

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
      router.push("/vendor/sales")
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state, router])

  const [productNotFoundWarning, setProductNotFoundWarning] = useState<string | null>(null)

  const handleImeiCheck = async (imei: string, forceCheck: boolean = false) => {
    // ... (Keep existing IMEI check logic as it provides good UX)
    // For brevity in this refactor, I'm simplifying the logging but keeping the core logic

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
      debounceTimer.current = null
    }

    if (imei.length !== 15) {
      if (!forceCheck) {
        setImeiError(null)
        setInventoryInfo(null)
        setProductNotFoundWarning(null)
        setImeiStatusError(null)
        return
      }
    }

    if (imei === lastCheckedImei.current && !forceCheck) return

    const validation = validateImei(imei)
    if (!validation.valid && !forceCheck) return

    const performCheck = async () => {
      setCheckingImei(true)
      setImeiError(null)
      setProductNotFoundWarning(null)
      setImeiStatusError(null)
      lastCheckedImei.current = imei

      try {
        const response = await fetch("/api/inventory/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imei }),
        })

        if (!response.ok) throw new Error(t("common.error.imei_verification"))
        const inventory = await response.json()

        if (!inventory) {
          setImeiError(t("common.error.imei_not_found"))
          setInventoryInfo(null)
          setFormData((prev) => ({ ...prev, product_id: "" }))
          return
        }

        setInventoryInfo(inventory)
        setImeiError(null)

        // Validate IMEI status - only 'no disponible' means it was sold by CUBOT
        if (inventory.status?.toLowerCase() !== "no disponible") {
          setImeiStatusError(t("vendor.sales.new.imei_status_invalid"))
        } else {
          setImeiStatusError(null)
        }

        // Auto-select product logic and fallback note
        const inventoryModel = (inventory.model || "").toLowerCase().trim()
        const inventoryBrand = (inventory.brand || "").toLowerCase().trim()

        // Strategy: Try to find a product that contains the model name
        // Example: Inventory "NOTE 50", Product "Cubot Note 50"
        const matchingProduct = products.find((p) => {
          const productName = p.name.toLowerCase()
          // Check if product name contains the model from inventory
          // Or if model plus brand matches
          return productName.includes(inventoryModel) ||
            (inventoryBrand && productName.includes(inventoryBrand) && productName.includes(inventoryModel))
        })

        if (matchingProduct) {
          setFormData((prev) => ({ ...prev, product_id: matchingProduct.id }))
          setProductNotFoundWarning(null)
        } else {
          // If no match found, don't auto-select, but show warning
          setFormData((prev) => ({ ...prev, product_id: "" }))
          setProductNotFoundWarning(
            t("vendor.sales.new.product_not_found_warning").replace("{model}", `${inventory.brand || ''} ${inventory.model || ''}`.trim())
          )
        }

      } catch (error: any) {
        setImeiError(error.message || t("common.error.imei_verification"))
        setInventoryInfo(null)
      } finally {
        setCheckingImei(false)
      }
    }

    if (forceCheck || imei.length === 15) {
      if (forceCheck) performCheck()
      else debounceTimer.current = setTimeout(performCheck, 800)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t("vendor.sales.new.page_title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("vendor.sales.new.subtitle")}</p>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-6 lg:p-8 max-w-4xl">
        <form action={formAction} className="space-y-6 sm:space-y-8">
          {/* IMEI Field */}
          <div>
            <label className="block text-sm font-medium mb-2">{t("vendor.sales.new.imei_label")}</label>
            <div className="flex gap-2">
              <input
                name="imei"
                type="text"
                value={formData.imei}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 15)
                  setFormData({ ...formData, imei: value })
                  if (value.length === 15) handleImeiCheck(value, false)
                  else {
                    setImeiError(null)
                    setInventoryInfo(null)
                  }
                }}
                onBlur={() => {
                  if (formData.imei.length === 15 && !inventoryInfo && !checkingImei) {
                    handleImeiCheck(formData.imei, true)
                  }
                }}
                className="flex-1 px-3 py-2 border rounded font-mono"
                maxLength={15}
                placeholder="358497892739257"
                required
              />
              {checkingImei && (
                <div className="flex items-center px-3 text-sm text-muted-foreground">
                  <span className="animate-pulse">{t("vendor.sales.new.verifying")}</span>
                </div>
              )}
            </div>
            {imeiError && <p className="text-sm text-red-600 mt-1">{imeiError}</p>}

            {/* Inventory Info Card */}
            {inventoryInfo && (
              <div className={`mt-2 p-3 border rounded text-sm ${inventoryInfo.status?.toLowerCase() === "no disponible" ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
                <p className={`font-semibold ${inventoryInfo.status?.toLowerCase() === "no disponible" ? "text-green-600" : "text-red-600"}`}>
                  {inventoryInfo.status?.toLowerCase() === "no disponible" ? "✓" : "✗"} {t("vendor.sales.new.imei_verified")}
                </p>
                <div className="mt-2 text-muted-foreground">
                  <p><span className="font-medium">{t("vendor.sales.new.model")}:</span> {inventoryInfo.brand} {inventoryInfo.model}</p>
                </div>
              </div>
            )}
            {/* IMEI Status Error - device not sold by CUBOT */}
            {imeiStatusError && (
              <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded text-sm text-red-700 dark:text-red-400">
                ⚠️ {imeiStatusError}
              </div>
            )}
          </div>

          {/* Product Select */}
          <div>
            <label className="block text-sm font-medium mb-2">{t("vendor.sales.new.product_label")}</label>
            <input type="hidden" name="productId" value={formData.product_id} />
            <select
              value={formData.product_id}
              disabled
              className="w-full px-3 py-2 border rounded bg-muted/50 text-muted-foreground cursor-not-allowed"
            >
              <option value="">{t("vendor.sales.new.select_product")}</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
            {productNotFoundWarning && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded">
                ⚠️ {productNotFoundWarning}
              </p>
            )}
          </div>

          {/* Channel & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t("vendor.sales.new.channel_label")}</label>
              <select
                name="channel"
                value={formData.channel}
                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
                required
              >
                <option value="Online">{t("vendor.sales.new.channel.online")}</option>
                <option value="Tienda Fisica">{t("vendor.sales.new.channel.store")}</option>
                <option value="Marketplace">{t("vendor.sales.new.channel.marketplace")}</option>
                <option value="Venta Telefonica">{t("vendor.sales.new.channel.phone")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t("vendor.sales.new.date_label")}</label>
              <input
                name="saleDate"
                type="date"
                value={formData.sale_date}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">{t("vendor.sales.new.notes_label")}</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={2}
            />
          </div>

          {/* Evidence Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">{t("vendor.sales.new.evidence_label")}</label>
            <input
              name="evidence"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="w-full px-3 py-2 border rounded"
              required
            />
            <p className="text-xs text-slate-500 mt-1">{t("vendor.sales.new.evidence_hint")}</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending || !inventoryInfo || imeiStatusError !== null || imeiError !== null}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? t("vendor.sales.new.submitting") : t("vendor.sales.new.submit_btn")}
          </button>

          {state.error && (
            <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200 text-sm">
              {state.error}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
