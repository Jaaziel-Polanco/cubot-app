import { createClient } from "@/lib/supabase/server"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Users, FileText, Calendar, Download, Info, CheckCircle2, Clock, DollarSign } from "lucide-react"

export default async function AdminPaymentsPage() {
  const supabase = await createClient()

  const { data: batches } = await supabase.from("payment_batches").select("*").order("created_at", { ascending: false })

  const totalBatches = batches?.length || 0
  const completedBatches = batches?.filter((b) => b.status === "completed").length || 0
  const pendingBatches = batches?.filter((b) => b.status === "pending" || b.status === "processing").length || 0
  const totalAmount = batches?.reduce((sum: number, b) => sum + (parseFloat(b.total_amount) || 0), 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lotes de Pago</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona los lotes de pago de comisiones a vendedores</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Lotes</p>
                <p className="text-2xl font-bold text-foreground">{totalBatches}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Completados</p>
                <p className="text-2xl font-bold text-green-600">{completedBatches}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingBatches}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Pagado</p>
                <p className="text-2xl font-bold text-purple-600">RD${totalAmount.toFixed(2)}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Desktop Table */}
      <div className="hidden lg:block bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    Batch ID
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Identificador único del lote de pago</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vendedores</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Comisiones</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monto Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">CSV</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {batches?.map((batch) => (
                <tr key={batch.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">{batch.batch_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{batch.vendor_count || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span>{batch.commission_count || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      RD${batch.total_amount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className={
                        batch.status === "completed"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : batch.status === "processing"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }
                    >
                      {batch.status === "completed" ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Completado
                        </>
                      ) : batch.status === "processing" ? (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Procesando
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Pendiente
                        </>
                      )}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {new Date(batch.created_at).toLocaleDateString("es-DO")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {batch.csv_url ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={batch.csv_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Descargar
                        </a>
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-xs">No disponible</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!batches || batches.length === 0) && (
          <Empty className="py-12">
            <EmptyMedia variant="icon">
              <CreditCard className="w-12 h-12 text-slate-400" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No hay lotes de pago</EmptyTitle>
              <EmptyDescription>Crea un nuevo lote de pago para procesar las comisiones pendientes</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {batches?.map((batch) => (
          <Card key={batch.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-mono text-sm font-semibold text-foreground">{batch.batch_id}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(batch.created_at).toLocaleDateString("es-DO")}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    batch.status === "completed"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : batch.status === "processing"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                  }
                >
                  {batch.status === "completed" ? "Completado" : batch.status === "processing" ? "Procesando" : "Pendiente"}
                </Badge>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Vendedores
                  </div>
                  <div className="font-semibold">{batch.vendor_count || 0}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Comisiones
                  </div>
                  <div className="font-semibold">{batch.commission_count || 0}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Monto Total
                  </div>
                  <div className="font-semibold text-lg">RD${batch.total_amount}</div>
                </div>
              </div>
              {batch.csv_url && (
                <>
                  <Separator />
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={batch.csv_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Descargar CSV
                    </a>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ))}
        {(!batches || batches.length === 0) && (
          <Empty className="py-12">
            <EmptyMedia variant="icon">
              <CreditCard className="w-12 h-12 text-slate-400" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No hay lotes de pago</EmptyTitle>
              <EmptyDescription>Crea un nuevo lote de pago para procesar las comisiones pendientes</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  )
}
