"use client"

import { useState, useEffect } from "react"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, DollarSign, Percent, Info, Plus, Edit, CheckCircle2, XCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/lib/utils/toast"
import type { Product } from "@/lib/types"
import { useLanguage } from "@/components/contexts/LanguageContext"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "Mid-Range" as "Flagship" | "Mid-Range" | "Rugged" | "Budget",
    price: "",
    commission_amount: "",
    commission_percent: "",
    stock: "",
    active: true,
  })
  const { t } = useLanguage()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/products")
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setProducts(data.products || [])
    } catch (error: any) {
      toast.error(t("common.error"), error.message || t("common.error"))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products"
      const method = editingProduct ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: formData.sku,
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          commission_amount: formData.commission_amount ? parseFloat(formData.commission_amount) : 0,
          commission_percent: formData.commission_percent ? parseFloat(formData.commission_percent) : 0,
          stock: parseInt(formData.stock) || 0,
          active: formData.active,
        }),
      })

      if (!res.ok) {
        let errorMessage = "Error"
        try {
          const errorData = await res.json()
          errorMessage = errorData.error || errorMessage
        } catch (parseError) {
          const text = await res.text()
          errorMessage = text || errorMessage
        }
        throw new Error(errorMessage)
      }

      toast.success(t("common.saved"), t("common.saved"))
      setShowDialog(false)
      setEditingProduct(null)
      setFormData({
        sku: "",
        name: "",
        category: "Mid-Range",
        price: "",
        commission_amount: "",
        commission_percent: "",
        stock: "",
        active: true,
      })
      loadProducts()
    } catch (error: any) {
      toast.error(t("common.error"), error.message || t("common.error"))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      sku: product.sku,
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      commission_amount: product.commission_amount?.toString() || "",
      commission_percent: product.commission_percent?.toString() || "",
      stock: product.stock?.toString() || "0",
      active: product.active,
    })
    setShowDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("admin.products.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("admin.products.subtitle")}</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingProduct(null)
                setFormData({
                  sku: "",
                  name: "",
                  category: "Mid-Range",
                  price: "",
                  commission_amount: "",
                  commission_percent: "",
                  stock: "",
                  active: true,
                })
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("admin.products.add_button")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? t("admin.products.edit_title") : t("admin.products.add_title")}</DialogTitle>
              <DialogDescription>
                {editingProduct ? t("admin.products.edit_desc") : t("admin.products.add_desc")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku" className="flex items-center gap-2">
                    {t("admin.products.form.sku")} *
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("admin.products.form.sku_tooltip")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input id="sku" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="CUBOT-X90" required />
                </div>
                <div>
                  <Label htmlFor="name">{t("admin.products.form.name")} *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="CUBOT X90" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">{t("admin.products.form.category")} *</Label>
                  <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Flagship">Flagship</SelectItem>
                      <SelectItem value="Mid-Range">Mid-Range</SelectItem>
                      <SelectItem value="Rugged">Rugged</SelectItem>
                      <SelectItem value="Budget">Budget</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price" className="flex items-center gap-2">
                    {t("admin.products.form.price")} *
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("admin.products.form.price_tooltip")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" required />
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-semibold mb-2 block">{t("admin.products.form.commission_label")}</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="commission_amount" className="flex items-center gap-2">
                      {t("admin.products.form.commission_fixed")}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-slate-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("admin.products.form.commission_fixed_tooltip")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input
                      id="commission_amount"
                      type="number"
                      step="0.01"
                      value={formData.commission_amount}
                      onChange={(e) => setFormData({ ...formData, commission_amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commission_percent" className="flex items-center gap-2">
                      {t("admin.products.form.commission_percent")}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-slate-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("admin.products.form.commission_percent_tooltip")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input
                      id="commission_percent"
                      type="number"
                      step="0.01"
                      value={formData.commission_percent}
                      onChange={(e) => setFormData({ ...formData, commission_percent: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label htmlFor="stock">{t("admin.products.form.stock")}</Label>
                <Input id="stock" type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} placeholder="0" />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="active" checked={formData.active} onCheckedChange={(checked) => setFormData({ ...formData, active: checked })} />
                <Label htmlFor="active" className="cursor-pointer">
                  {t("admin.products.form.active")}
                </Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? t("admin.products.form.save_loading") : editingProduct ? t("admin.products.form.update") : t("admin.products.form.create")}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  {t("admin.products.form.cancel")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {products.map((product) => {
          const commissionAmount =
            product.commission_amount > 0
              ? product.commission_amount
              : product.commission_percent > 0
                ? (product.price * product.commission_percent) / 100
                : 0

          let commissionText = t("admin.products.card.commission_none");
          if (product.commission_amount > 0) {
            commissionText = t("admin.products.card.commission_fixed");
          } else if (product.commission_percent > 0) {
            commissionText = t("admin.products.card.commission_percent").replace("{percent}", product.commission_percent.toString());
          }

          return (
            <Card key={product.id} className="hover:shadow-lg transition-all duration-200 border-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription className="mt-1 font-mono text-xs">{product.sku}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className={product.active ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
                    {product.active ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {t("admin.products.status.active")}
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 mr-1" />
                        {t("admin.products.status.inactive")}
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t("admin.products.card.category")}:</span>
                    <Badge variant="outline">{product.category}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      {t("admin.products.card.price")}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("admin.products.form.price_tooltip")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </span>
                    <span className="font-semibold text-foreground text-lg">RD${product.price}</span>
                  </div>
                  <Separator />
                  <div className="bg-linear-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-900 flex items-center gap-2">
                        {t("admin.products.card.commission")}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-3 h-3 text-green-600" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{commissionText}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                      {product.commission_amount > 0 ? (
                        <DollarSign className="w-4 h-4 text-green-600" />
                      ) : (
                        <Percent className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-green-700">
                        {product.commission_amount > 0
                          ? `RD$${product.commission_amount.toFixed(2)}`
                          : product.commission_percent > 0
                            ? `${product.commission_percent}%`
                            : "N/A"}
                      </span>
                      {product.commission_percent > 0 && (
                        <span className="text-sm text-green-600">(RD${commissionAmount.toFixed(2)})</span>
                      )}
                    </div>
                  </div>
                  {product.stock !== undefined && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{t("admin.products.card.stock")}:</span>
                        <span className="font-semibold">{product.stock}</span>
                      </div>
                    </>
                  )}
                </div>
                <Separator />
                <Button variant="outline" size="sm" className="w-full" onClick={() => handleEdit(product)}>
                  <Edit className="w-4 h-4 mr-2" />
                  {t("admin.products.card.edit_action")}
                </Button>
              </CardContent>
            </Card>
          )
        })}
        {products.length === 0 && (
          <div className="col-span-full">
            <Empty className="py-12">
              <EmptyMedia variant="icon">
                <Package className="w-12 h-12 text-muted-foreground" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>{t("admin.products.empty.title")}</EmptyTitle>
                <EmptyDescription>{t("admin.products.empty.desc")}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        )}
      </div>
    </div>
  )
}
