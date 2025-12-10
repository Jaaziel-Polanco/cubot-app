import { createClient } from "@/lib/supabase/server"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, FileText, Calendar, Info, CreditCard } from "lucide-react"

export default async function AdminCommissionsPage() {
  const supabase = await createClient()

  const { data: commissions } = await supabase
    .from("commissions")
    .select("*, users(name, vendor_id)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  const vendorSummary = commissions?.reduce((acc: any, comm: any) => {
    const vendorId = comm.vendor_id
    if (!acc[vendorId]) {
      acc[vendorId] = {
        vendor_id: comm.users?.vendor_id,
        vendor_name: comm.users?.name,
        count: 0,
        total: 0,
      }
    }
    acc[vendorId].count++
    acc[vendorId].total += Number.parseFloat(comm.commission_amount || 0)
    return acc
  }, {})

  const summary = Object.values(vendorSummary || {})
  const totalPending = summary.reduce((sum: number, item: any) => sum + item.total, 0)
  const totalCommissions = commissions?.length || 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Comisiones</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona las comisiones pendientes de pago</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Pendiente</p>
                <p className="text-2xl font-bold text-yellow-600">RD${totalPending.toFixed(2)}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Comisiones</p>
                <p className="text-2xl font-bold text-foreground">{totalCommissions}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Vendedores</p>
                <p className="text-2xl font-bold text-purple-600">{summary.length}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen por Vendedor</CardTitle>
          <CardDescription>Total de comisiones pendientes agrupadas por vendedor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      Código Vendedor
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Identificador único del vendedor</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      Cantidad
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Número de comisiones pendientes</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {(summary as any[])?.map((item: any) => (
                  <tr key={item.vendor_id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">{item.vendor_id}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{item.vendor_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{item.count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">RD${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="lg:hidden space-y-4">
            {(summary as any[])?.map((item: any) => (
              <Card key={item.vendor_id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-mono text-sm font-semibold text-foreground">{item.vendor_id}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Users className="w-3 h-3" />
                        {item.vendor_name}
                      </div>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Cantidad</div>
                      <div className="font-semibold">{item.count}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Total</div>
                      <div className="font-semibold text-green-600">RD${item.total.toFixed(2)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {summary.length === 0 && (
            <Empty className="py-12">
              <EmptyMedia variant="icon">
                <CreditCard className="w-12 h-12 text-muted-foreground" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No hay comisiones pendientes</EmptyTitle>
                <EmptyDescription>Todas las comisiones han sido procesadas o no hay ventas aprobadas</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* All Commissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todas las Comisiones Pendientes</CardTitle>
          <CardDescription>Lista detallada de todas las comisiones pendientes de pago</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vendedor</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monto Base</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Comisión</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {commissions?.map((comm: any) => (
                  <tr key={comm.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-foreground">{comm.users?.vendor_id}</div>
                          <div className="text-xs text-muted-foreground">{comm.users?.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">RD${comm.base_amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">RD${comm.commission_amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        {comm.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {new Date(comm.created_at).toLocaleDateString("es-DO")}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="lg:hidden space-y-4">
            {commissions?.map((comm: any) => (
              <Card key={comm.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium text-foreground flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {comm.users?.vendor_id}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{comm.users?.name}</div>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      {comm.status}
                    </Badge>
                  </div>
                  <Separator className="my-3" />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Monto Base</div>
                      <div className="font-semibold">RD${comm.base_amount}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Comisión</div>
                      <div className="font-semibold text-green-600">RD${comm.commission_amount}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Fecha
                      </div>
                      <div className="text-sm">{new Date(comm.created_at).toLocaleDateString("es-DO")}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {(!commissions || commissions.length === 0) && (
            <Empty className="py-12">
              <EmptyMedia variant="icon">
                <CreditCard className="w-12 h-12 text-muted-foreground" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No hay comisiones pendientes</EmptyTitle>
                <EmptyDescription>Todas las comisiones han sido procesadas o no hay ventas aprobadas</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
