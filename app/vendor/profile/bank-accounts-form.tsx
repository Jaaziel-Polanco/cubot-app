"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Bank, VendorBankAccount } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, CheckCircle2, XCircle, Plus } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import { Info } from "lucide-react"

export default function BankAccountsForm() {
  const [banks, setBanks] = useState<Bank[]>([])
  const [accounts, setAccounts] = useState<VendorBankAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    bank_id: "",
    account_number: "",
    account_holder_name: "",
    account_type: "checking" as "checking" | "savings" | "current",
    is_primary: false,
  })

  useEffect(() => {
    loadBanks()
    loadAccounts()
  }, [])

  const loadBanks = async () => {
    try {
      const res = await fetch("/api/banks")
      const data = await res.json()
      setBanks(data.banks || [])
    } catch (error) {
      toast.error("Error al cargar los bancos", "No se pudieron obtener la lista de bancos disponibles")
    }
  }

  const loadAccounts = async () => {
    try {
      const res = await fetch("/api/vendor/bank-accounts")
      const data = await res.json()
      setAccounts(data.accounts || [])
    } catch (error) {
      toast.error("Error al cargar las cuentas bancarias", "No se pudieron obtener tus cuentas bancarias")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/vendor/bank-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Error al guardar la cuenta bancaria")
      }

      toast.success("¡Cuenta bancaria guardada exitosamente!", "La cuenta ha sido agregada correctamente")
      setShowForm(false)
      setFormData({
        bank_id: "",
        account_number: "",
        account_holder_name: "",
        account_type: "checking",
        is_primary: false,
      })
      loadAccounts()
    } catch (error: any) {
      toast.error("Error al guardar la cuenta bancaria", error.message || "Por favor, verifica los datos e intenta nuevamente")
    } finally {
      setLoading(false)
    }
  }

  const handleSetPrimary = async (accountId: string) => {
    try {
      const account = accounts.find((a) => a.id === accountId)
      if (!account) return

      const res = await fetch("/api/vendor/bank-accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...account,
          is_primary: true,
        }),
      })

      if (!res.ok) throw new Error("Error al establecer cuenta principal")

      toast.success("¡Cuenta principal actualizada!", "Esta cuenta será usada para recibir pagos")
      loadAccounts()
    } catch (error) {
      toast.error("Error al actualizar la cuenta principal", "No se pudo establecer como cuenta principal")
    }
  }

  const handleDelete = async (accountId: string) => {
    try {
      const res = await fetch(`/api/vendor/bank-accounts?id=${accountId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Error al eliminar la cuenta")

      toast.success("¡Cuenta bancaria eliminada!", "La cuenta ha sido removida de tu perfil")
      loadAccounts()
    } catch (error) {
      toast.error("Error al eliminar la cuenta bancaria", "No se pudo eliminar la cuenta. Intenta nuevamente")
    }
  }

  const selectedBank = banks.find((b) => b.id === formData.bank_id)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Cuentas Bancarias</h2>
          <p className="text-sm text-slate-600">Gestiona tus cuentas bancarias para recibir pagos</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Cuenta Bancaria
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Agregar Cuenta Bancaria</CardTitle>
            <CardDescription>Selecciona un banco e ingresa los detalles de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="bank_id" className="flex items-center gap-2">
                  Banco *
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Selecciona el banco donde está registrada tu cuenta</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Select value={formData.bank_id} onValueChange={(value) => setFormData({ ...formData, bank_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        {bank.name} ({bank.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedBank?.account_number_format && (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">Formato: {selectedBank.account_number_format}</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Formato requerido para el número de cuenta de este banco</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="account_holder_name">Nombre del Titular *</Label>
                <Input
                  id="account_holder_name"
                  value={formData.account_holder_name}
                  onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              <div>
                <Label htmlFor="account_number">Número de Cuenta *</Label>
                <Input
                  id="account_number"
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  placeholder="12345678901234567890"
                  className="font-mono"
                  required
                />
              </div>

              <div>
                <Label htmlFor="account_type">Tipo de Cuenta</Label>
                <Select
                  value={formData.account_type}
                  onValueChange={(value: any) => setFormData({ ...formData, account_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Corriente</SelectItem>
                    <SelectItem value="savings">Ahorros</SelectItem>
                    <SelectItem value="current">Corriente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={formData.is_primary}
                  onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_primary" className="cursor-pointer flex items-center gap-2">
                  Establecer como cuenta principal (usada para pagos)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>La cuenta principal será usada automáticamente para recibir pagos de comisiones</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar Cuenta"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {accounts.length === 0 ? (
          <Empty className="py-12">
            <EmptyMedia variant="icon">
              <XCircle className="w-12 h-12 text-slate-400" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No hay cuentas bancarias configuradas</EmptyTitle>
              <EmptyDescription>Agrega una cuenta bancaria para recibir pagos de tus comisiones</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          accounts.map((account) => (
            <Card key={account.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{account.banks?.name || "Banco Desconocido"}</h3>
                      {account.is_primary && (
                        <Badge variant="default" className="bg-green-600">
                          Principal
                        </Badge>
                      )}
                      {account.verified ? (
                        <Badge variant="outline" className="border-green-600 text-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Verificada
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                          <XCircle className="w-3 h-3 mr-1" />
                          Pendiente de Verificación
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        <span className="font-medium">Titular:</span> {account.account_holder_name}
                      </p>
                      <p>
                        <span className="font-medium">Número de Cuenta:</span>{" "}
                        <span className="font-mono">{account.account_number}</span>
                      </p>
                      {account.account_type && (
                        <p>
                          <span className="font-medium">Tipo:</span> {account.account_type === "checking" ? "Corriente" : account.account_type === "savings" ? "Ahorros" : "Corriente"}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Código:</span> {account.banks?.code}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!account.is_primary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetPrimary(account.id)}
                      >
                        Establecer Principal
                      </Button>
                    )}
                    {!account.is_primary && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar cuenta bancaria?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. La cuenta bancaria será eliminada permanentemente de tu perfil.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(account.id)} className="bg-red-600 hover:bg-red-700">
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

