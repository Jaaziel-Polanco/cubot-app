"use client"

import { useState, useEffect } from "react"
import type { Bank } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Plus, Edit, Trash2, Building2, Info } from "lucide-react"
import { toast } from "@/lib/utils/toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useLanguage } from "@/components/contexts/LanguageContext"

export default function AdminBanksPage() {
  const [banks, setBanks] = useState<Bank[]>([])
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [editingBank, setEditingBank] = useState<Bank | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    country: "DO",
    account_number_format: "",
    active: true,
  })
  const { t } = useLanguage()

  useEffect(() => {
    loadBanks()
  }, [])

  const loadBanks = async () => {
    try {
      const res = await fetch("/api/admin/banks")
      const data = await res.json()
      setBanks(data.banks || [])
    } catch (error) {
      toast.error(t("common.error"), t("common.error"))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingBank ? `/api/admin/banks/${editingBank.id}` : "/api/admin/banks"
      const method = editingBank ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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

      toast.success(
        t("common.saved"),
        t("common.saved")
      )
      setShowDialog(false)
      setEditingBank(null)
      setFormData({
        name: "",
        code: "",
        country: "DO",
        account_number_format: "",
        active: true,
      })
      loadBanks()
    } catch (error: any) {
      toast.error(t("common.error"), error.message || t("common.error"))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (bank: Bank) => {
    setEditingBank(bank)
    setFormData({
      name: bank.name,
      code: bank.code,
      country: bank.country,
      account_number_format: bank.account_number_format || "",
      active: bank.active,
    })
    setShowDialog(true)
  }

  const handleDelete = async (bankId: string) => {
    try {
      const res = await fetch(`/api/admin/banks/${bankId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Error")

      toast.success(t("common.deleted"), t("common.deleted"))
      loadBanks()
    } catch (error) {
      toast.error(t("common.error"), t("common.error"))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t("admin.banks.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.banks.subtitle")}</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingBank(null)
              setFormData({
                name: "",
                code: "",
                country: "DO",
                account_number_format: "",
                active: true,
              })
            }}>
              <Plus className="w-4 h-4 mr-2" />
              {t("admin.banks.add_button")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBank ? t("admin.banks.edit_title") : t("admin.banks.add_title")}</DialogTitle>
              <DialogDescription>
                {editingBank ? t("admin.banks.edit_desc") : t("admin.banks.add_desc")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">{t("admin.banks.form.name")} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Banco Popular Dominicano"
                  required
                />
              </div>

              <div>
                <Label htmlFor="code">{t("admin.banks.form.code")} *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="BPD"
                  required
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground mt-1">{t("admin.banks.form.code_tooltip")}</p>
              </div>

              <div>
                <Label htmlFor="country">{t("admin.banks.form.country")}</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value.toUpperCase() })}
                  placeholder="DO"
                  maxLength={2}
                />
              </div>

              <div>
                <Label htmlFor="account_number_format">{t("admin.banks.form.format")}</Label>
                <Input
                  id="account_number_format"
                  value={formData.account_number_format}
                  onChange={(e) => setFormData({ ...formData, account_number_format: e.target.value })}
                  placeholder="20 dígitos"
                />
                <p className="text-xs text-muted-foreground mt-1">{t("admin.banks.form.format_tooltip")}</p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active" className="cursor-pointer">
                  {t("admin.banks.form.active")}
                </Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? t("common.saved") : editingBank ? t("common.updated") : t("admin.banks.add_button")}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  {t("admin.users.dialog.cancel")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banks.length === 0 ? (
          <div className="col-span-full">
            <Empty className="py-12">
              <EmptyMedia variant="icon">
                <Building2 className="w-12 h-12 text-muted-foreground" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>{t("admin.banks.empty.title")}</EmptyTitle>
                <EmptyDescription>{t("admin.banks.empty.desc")}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          banks.map((bank) => (
            <Card key={bank.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{bank.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span>{t("admin.banks.form.code")}: {bank.code}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-3 h-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("admin.banks.form.code_tooltip")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </CardDescription>
                    </div>
                  </div>
                  {bank.active ? (
                    <Badge variant="default" className="bg-green-600">
                      {t("admin.users.status.active")}
                    </Badge>
                  ) : (
                    <Badge variant="outline">{t("admin.products.status.inactive")}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t("admin.banks.form.country")}:</span>
                    <span className="font-semibold">{bank.country}</span>
                  </div>
                  {bank.account_number_format && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2">
                          {t("admin.banks.form.format")}:
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="w-3 h-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("admin.banks.form.format_tooltip")}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </span>
                        <span className="font-mono text-xs">{bank.account_number_format}</span>
                      </div>
                    </>
                  )}
                </div>
                <Separator className="my-4" />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(bank)}>
                    <Edit className="w-4 h-4 mr-1" />
                    {t("admin.users.actions.edit")}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("admin.banks.delete_title")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("admin.banks.delete_desc")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("admin.users.dialog.cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(bank.id)} className="bg-red-600 hover:bg-red-700">
                          {t("admin.banks.delete_confirm")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
