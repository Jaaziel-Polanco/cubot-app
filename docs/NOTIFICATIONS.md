# Sistema de Notificaciones CUBOT

## Descripción
Sistema completo de notificaciones para admin y vendors con soporte para diferentes tipos de eventos.

## Configuración Inicial

### 1. Crear la tabla en Supabase
Ejecuta el script SQL en tu base de datos de Supabase:
```bash
psql -h [tu-host] -U postgres -d postgres -f scripts/setup_notifications.sql
```

O copia y pega el contenido de `scripts/setup_notifications.sql` en el SQL Editor de Supabase.

## Tipos de Notificaciones

- `sale_approved` - Venta aprobada
- `sale_rejected` - Venta rechazada
- `commission_paid` - Comisión pagada
- `payment_approved` - Solicitud de pago aprobada
- `payment_rejected` - Solicitud de pago rechazada
- `system` - Notificación del sistema

## Crear Notificaciones

### Desde Server Actions o API Routes

```typescript
import { createServiceClient } from "@/lib/supabase/service"

async function createNotification(userId: string, type: string, title: string, message: string, link?: string) {
    const supabase = createServiceClient()
    
    const { error } = await supabase
        .from("notifications")
        .insert({
            user_id: userId,
            type,
            title,
            message,
            link,
            read: false
        })
    
    if (error) {
        console.error("Error creating notification:", error)
    }
}
```

### Ejemplo: Notificar cuando se aprueba una venta

```typescript
// En tu server action de aprobación de ventas
const { data: sale } = await supabase
    .from("sales")
    .update({ status: "approved" })
    .eq("id", saleId)
    .select("vendor_id, sale_id, products(name)")
    .single()

if (sale) {
    await createNotification(
        sale.vendor_id,
        "sale_approved",
        "¡Venta Aprobada!",
        `Tu venta #${sale.sale_id} del producto ${sale.products.name} ha sido aprobada.`,
        "/vendor/sales"
    )
}
```

### Ejemplo: Notificar cuando se paga una comisión

```typescript
// Después de procesar un pago de comisión
await createNotification(
    vendorId,
    "commission_paid",
    "Comisión Pagada",
    `Se ha procesado el pago de tu comisión por RD$${amount.toFixed(2)}.`,
    "/vendor/payments"
)
```

## Características

### Para Usuarios
- ✅ Ver todas las notificaciones
- ✅ Marcar como leída individualmente
- ✅ Marcar todas como leídas
- ✅ Eliminar notificaciones
- ✅ Navegar al recurso relacionado
- ✅ Estadísticas de notificaciones
- ✅ Indicador visual de no leídas
- ✅ Timestamps relativos (hace 2h, ayer, etc.)

### Seguridad
- ✅ RLS habilitado
- ✅ Los usuarios solo ven sus propias notificaciones
- ✅ Solo el service role puede crear notificaciones
- ✅ Los usuarios pueden actualizar y eliminar sus propias notificaciones

## Rutas

### Admin
- `/admin/notifications` - Panel de notificaciones del admin

### Vendor
- `/vendor/notifications` - Panel de notificaciones del vendor

### API Endpoints
- `POST /api/notifications/mark-read` - Marcar una notificación como leída
- `POST /api/notifications/mark-all-read` - Marcar todas como leídas
- `DELETE /api/notifications/delete` - Eliminar una notificación

## Integración Recomendada

### 1. En aprobación/rechazo de ventas
```typescript
// app/actions/admin/sales.ts
if (status === "approved") {
    await createNotification(
        sale.vendor_id,
        "sale_approved",
        "¡Venta Aprobada!",
        `Tu venta #${sale.sale_id} ha sido aprobada.`,
        "/vendor/sales"
    )
} else if (status === "rejected") {
    await createNotification(
        sale.vendor_id,
        "sale_rejected",
        "Venta Rechazada",
        `Tu venta #${sale.sale_id} ha sido rechazada. ${reason}`,
        "/vendor/sales"
    )
}
```

### 2. En procesamiento de pagos
```typescript
// Cuando se aprueba un pago
await createNotification(
    vendorId,
    "payment_approved",
    "Pago Aprobado",
    `Tu solicitud de pago por RD$${amount} ha sido aprobada.`,
    "/vendor/payments"
)
```

### 3. En pago de comisiones
```typescript
// Cuando se marca una comisión como pagada
await createNotification(
    vendorId,
    "commission_paid",
    "Comisión Pagada",
    `Se ha pagado tu comisión de RD$${commission.amount}.`,
    "/vendor/commissions"
)
```

## Próximas Mejoras (Opcional)

- [ ] Notificaciones en tiempo real con Supabase Realtime
- [ ] Notificaciones push (PWA)
- [ ] Notificaciones por email
- [ ] Preferencias de notificaciones
- [ ] Agrupar notificaciones similares
- [ ] Búsqueda y filtrado de notificaciones
