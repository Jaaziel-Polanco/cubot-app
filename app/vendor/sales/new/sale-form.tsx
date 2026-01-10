"use client"

import { useState, useRef, useEffect, useActionState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { Product } from "@/lib/types"
import type { InventoryCheckResult } from "@/lib/types"
import { validateImei } from "@/lib/utils/imei"
import { registerSale } from "@/lib/actions/sales"
import { toast } from "sonner"
import { useLanguage } from "@/components/contexts/LanguageContext"
import { Plus, X, Check, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const initialState = {
  message: "",
  error: "",
  success: false
}

// Type for each IMEI entry
interface ImeiEntry {
  id: string
  imei: string
  status: "idle" | "checking" | "valid" | "invalid"
  inventoryInfo: InventoryCheckResult | null
  error: string | null
  statusError: string | null
  productId: string
  productWarning: string | null
  isDuplicate: boolean
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9)

// Create empty IMEI entry
const createEmptyEntry = (): ImeiEntry => ({
  id: generateId(),
  imei: "",
  status: "idle",
  inventoryInfo: null,
  error: null,
  statusError: null,
  productId: "",
  productWarning: null,
  isDuplicate: false,
})

export default function SaleForm({ products }: { products: Product[] }) {
  const { t } = useLanguage()
  const [state, formAction, isPending] = useActionState(registerSale, initialState)

  // Multiple IMEI entries
  const [imeiEntries, setImeiEntries] = useState<ImeiEntry[]>([createEmptyEntry()])
  const [formData, setFormData] = useState({
    channel: "Online",
    sale_date: new Date().toISOString().split("T")[0],
    notes: ""
  })

  const router = useRouter()
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({})
  const lastCheckedImeis = useRef<Record<string, string>>({})

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
      router.push("/vendor/sales")
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state, router])

  // Check for duplicates and update entries
  const checkAndMarkDuplicates = useCallback((entries: ImeiEntry[]): ImeiEntry[] => {
    const imeiCount: Record<string, number> = {}

    // Count occurrences of each IMEI (only 15-digit ones)
    entries.forEach(e => {
      if (e.imei.length === 15) {
        imeiCount[e.imei] = (imeiCount[e.imei] || 0) + 1
      }
    })

    // Mark duplicates
    return entries.map(e => ({
      ...e,
      isDuplicate: e.imei.length === 15 && (imeiCount[e.imei] || 0) > 1
    }))
  }, [])

  // Check if all valid IMEIs are ready for submission
  const validEntries = imeiEntries.filter(e => e.status === "valid" && !e.statusError && !e.isDuplicate)
  const invalidEntries = imeiEntries.filter(e => e.status === "invalid" || e.statusError || e.isDuplicate)
  const pendingEntries = imeiEntries.filter(e => e.status === "checking" || (e.imei.length === 15 && e.status === "idle"))
  const hasDuplicates = imeiEntries.some(e => e.isDuplicate)

  const canSubmit =
    imeiEntries.length > 0 &&
    validEntries.length === imeiEntries.length &&
    invalidEntries.length === 0 &&
    pendingEntries.length === 0 &&
    !hasDuplicates &&
    imeiEntries.every(e => e.imei.length === 15)

  // IMEI Check function
  const handleImeiCheck = useCallback(async (entryId: string, imei: string, forceCheck: boolean = false) => {
    // Clear existing timer for this entry
    if (debounceTimers.current[entryId]) {
      clearTimeout(debounceTimers.current[entryId])
      delete debounceTimers.current[entryId]
    }

    if (imei.length !== 15) {
      if (!forceCheck) {
        setImeiEntries(prev => prev.map(e =>
          e.id === entryId
            ? { ...e, status: "idle", error: null, inventoryInfo: null, statusError: null, productId: "", productWarning: null }
            : e
        ))
        return
      }
    }

    if (imei === lastCheckedImeis.current[entryId] && !forceCheck) return

    const validation = validateImei(imei)
    if (!validation.valid && !forceCheck) return

    const performCheck = async () => {
      // Set checking status
      setImeiEntries(prev => prev.map(e =>
        e.id === entryId
          ? { ...e, status: "checking", error: null, statusError: null, productWarning: null }
          : e
      ))
      lastCheckedImeis.current[entryId] = imei

      try {
        const response = await fetch("/api/inventory/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imei }),
        })

        if (!response.ok) throw new Error(t("common.error.imei_verification"))
        const inventory = await response.json()

        if (!inventory) {
          setImeiEntries(prev => prev.map(e =>
            e.id === entryId
              ? { ...e, status: "invalid", error: t("common.error.imei_not_found"), inventoryInfo: null, productId: "" }
              : e
          ))
          return
        }

        // Validate IMEI status
        let statusError: string | null = null
        if (inventory.status?.toLowerCase() !== "no disponible") {
          statusError = t("vendor.sales.new.imei_status_invalid")
        }

        // Find matching product
        const inventoryModel = (inventory.model || "").toLowerCase().trim()
        const inventoryBrand = (inventory.brand || "").toLowerCase().trim()

        const matchingProduct = products.find((p) => {
          const productName = p.name.toLowerCase()
          return productName.includes(inventoryModel) ||
            (inventoryBrand && productName.includes(inventoryBrand) && productName.includes(inventoryModel))
        })

        let productId = ""
        let productWarning: string | null = null

        if (matchingProduct) {
          productId = matchingProduct.id
        } else {
          productWarning = t("vendor.sales.new.product_not_found_warning").replace(
            "{model}",
            `${inventory.brand || ''} ${inventory.model || ''}`.trim()
          )
        }

        setImeiEntries(prev => prev.map(e =>
          e.id === entryId
            ? {
              ...e,
              status: statusError ? "invalid" : "valid",
              inventoryInfo: inventory,
              error: null,
              statusError,
              productId,
              productWarning
            }
            : e
        ))

      } catch (error: any) {
        setImeiEntries(prev => prev.map(e =>
          e.id === entryId
            ? { ...e, status: "invalid", error: error.message || t("common.error.imei_verification"), inventoryInfo: null }
            : e
        ))
      }
    }

    if (forceCheck || imei.length === 15) {
      if (forceCheck) {
        performCheck()
      } else {
        debounceTimers.current[entryId] = setTimeout(performCheck, 800)
      }
    }
  }, [t, products])

  // Add new IMEI entry
  const addImeiEntry = () => {
    setImeiEntries(prev => [...prev, createEmptyEntry()])
  }

  // Remove IMEI entry
  const removeImeiEntry = (entryId: string) => {
    if (imeiEntries.length <= 1) return // Keep at least one
    setImeiEntries(prev => {
      const filtered = prev.filter(e => e.id !== entryId)
      // Recalculate duplicates after removal
      return checkAndMarkDuplicates(filtered)
    })
    // Clean up refs
    delete debounceTimers.current[entryId]
    delete lastCheckedImeis.current[entryId]
  }

  // Update IMEI value
  const updateImei = (entryId: string, value: string) => {
    const cleanValue = value.replace(/\D/g, "").slice(0, 15)

    setImeiEntries(prev => {
      const updated = prev.map(e =>
        e.id === entryId ? { ...e, imei: cleanValue } : e
      )
      // Check for duplicates after update
      return checkAndMarkDuplicates(updated)
    })

    if (cleanValue.length === 15) {
      handleImeiCheck(entryId, cleanValue, false)
    } else {
      setImeiEntries(prev => {
        const updated = prev.map(e =>
          e.id === entryId
            ? { ...e, status: "idle", error: null, inventoryInfo: null, statusError: null }
            : e
        )
        return checkAndMarkDuplicates(updated)
      })
    }
  }

  // Get status icon for entry
  const getStatusIcon = (entry: ImeiEntry) => {
    if (entry.status === "checking") {
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
    }
    if (entry.isDuplicate) {
      return <AlertCircle className="w-5 h-5 text-orange-500" />
    }
    if (entry.status === "valid" && !entry.statusError) {
      return <Check className="w-5 h-5 text-green-500" />
    }
    if (entry.status === "invalid" || entry.statusError) {
      return <AlertCircle className="w-5 h-5 text-red-500" />
    }
    return null
  }

  // Prepare data for form submission
  const prepareFormData = () => {
    const imeiData = imeiEntries.map(e => ({
      imei: e.imei,
      productId: e.productId
    }))
    return JSON.stringify(imeiData)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t("vendor.sales.new.page_title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("vendor.sales.new.subtitle")}</p>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-6 lg:p-8 max-w-4xl">
        <form action={formAction} className="space-y-6 sm:space-y-8">
          {/* Hidden input for IMEI data */}
          <input type="hidden" name="imeiData" value={prepareFormData()} />

          {/* IMEI Entries Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">
                {t("vendor.sales.new.imei_label")}
              </label>
              <span className="text-sm text-muted-foreground">
                {t("vendor.sales.new.devices_count").replace("{count}", String(imeiEntries.length))}
              </span>
            </div>

            {/* IMEI Entry List */}
            <div className="space-y-3">
              {imeiEntries.map((entry, index) => (
                <div key={entry.id} className="space-y-2">
                  <div className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border transition-colors",
                    entry.status === "valid" && !entry.statusError && !entry.isDuplicate && "bg-green-500/5 border-green-500/30",
                    entry.isDuplicate && "bg-orange-500/5 border-orange-500/30",
                    (entry.status === "invalid" || entry.statusError) && !entry.isDuplicate && "bg-red-500/5 border-red-500/30",
                    entry.status === "checking" && "bg-blue-500/5 border-blue-500/30",
                    entry.status === "idle" && !entry.isDuplicate && "bg-background border-border"
                  )}>
                    {/* Entry Number */}
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      {index + 1}.
                    </span>

                    {/* IMEI Input */}
                    <input
                      type="text"
                      value={entry.imei}
                      onChange={(e) => updateImei(entry.id, e.target.value)}
                      onBlur={() => {
                        if (entry.imei.length === 15 && !entry.inventoryInfo && entry.status !== "checking") {
                          handleImeiCheck(entry.id, entry.imei, true)
                        }
                      }}
                      className="flex-1 px-3 py-2 border rounded font-mono bg-background text-foreground border-border"
                      maxLength={15}
                      placeholder="358497892739257"
                    />

                    {/* Status Icon */}
                    <div className="w-8 flex justify-center">
                      {getStatusIcon(entry)}
                    </div>

                    {/* Product Info (if valid) */}
                    {entry.inventoryInfo && entry.status === "valid" && !entry.statusError && (
                      <span className="text-sm text-muted-foreground hidden sm:block truncate max-w-[150px]">
                        {entry.inventoryInfo.brand} {entry.inventoryInfo.model}
                      </span>
                    )}

                    {/* Remove Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeImeiEntry(entry.id)}
                      disabled={imeiEntries.length <= 1}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Error Message */}
                  {(entry.error || entry.statusError || entry.isDuplicate) && (
                    <p className="text-sm text-red-600 dark:text-red-400 ml-8">
                      {entry.isDuplicate
                        ? t("vendor.sales.new.duplicate_imei")
                        : (entry.error || entry.statusError)
                      }
                    </p>
                  )}

                  {/* Product Warning */}
                  {entry.productWarning && (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 ml-8 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-900/30">
                      ⚠️ {entry.productWarning}
                    </p>
                  )}

                  {/* Mobile: Show product info */}
                  {entry.inventoryInfo && entry.status === "valid" && !entry.statusError && (
                    <p className="text-sm text-green-600 dark:text-green-400 ml-8 sm:hidden">
                      ✓ {entry.inventoryInfo.brand} {entry.inventoryInfo.model}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Add Device Button */}
            <Button
              type="button"
              variant="outline"
              onClick={addImeiEntry}
              className="w-full border-dashed"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("vendor.sales.new.add_device")}
            </Button>

            {/* Validation Summary */}
            {imeiEntries.length > 0 && (
              <div className={cn(
                "p-3 rounded-lg text-sm",
                canSubmit
                  ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"
                  : "bg-muted text-muted-foreground"
              )}>
                {canSubmit ? (
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    {t("vendor.sales.new.all_imei_valid")}
                  </span>
                ) : (
                  <span>
                    {validEntries.length} / {imeiEntries.length} {t("vendor.sales.new.verified_count")}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Channel & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
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
              className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">{t("vendor.sales.new.evidence_hint")}</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending || !canSubmit}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isPending ? t("vendor.sales.new.submitting") : t("vendor.sales.new.submit_btn")}
          </button>

          {state.error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded border border-red-200 dark:border-red-900/30 text-sm">
              {state.error}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
