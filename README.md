# CUBOT Commission & Sales Validation System

Sistema completo de gestión de comisiones y validación de ventas para vendedores CUBOT con integración a API externa de inventario.

## 🚀 Características Principales

- **Módulo Admin**: Gestión completa de usuarios, productos, validación de ventas, comisiones y pagos
- **Módulo Vendedor**: Registro de ventas, seguimiento de comisiones, historial de pagos
- **Validación Automática**: IMEI con algoritmo Luhn, detección de duplicados, análisis de riesgo
- **API Externa**: Integración con sistema de inventario CUBOT/Zodilum
- **Sistema de Comisiones**: Porcentaje o monto fijo por producto
- **Procesamiento de Pagos**: Lotes con exportación CSV para transferencias bancarias
- **Seguridad**: Row Level Security (RLS), autenticación basada en roles, audit trail completo

## 📋 Stack Tecnológico

- **Framework**: Next.js 15 (App Router) + TypeScript
- **UI**: React + Tailwind CSS + shadcn/ui + Framer Motion
- **Base de Datos**: Supabase (PostgreSQL + RLS + Supabase Auth)
- **Storage**: Supabase Storage (buckets con signed URLs)
- **Testing**: Vitest
- **Build**: ESLint + Prettier

## 🛠️ Setup Local

### Prerrequisitos

- Node.js 18+ instalado
- Cuenta de Supabase y proyecto creado
- Acceso a API externa de inventario (opcional)

### 1. Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd cubot-app

# Instalar dependencias
pnpm install
```

### 2. Configuración de Supabase

Ejecuta los scripts SQL en orden desde la carpeta `scripts/`:

1. **001_create_schema.sql** - Crea todas las tablas y estructura
2. **002_rls_policies.sql** - Configura Row Level Security (RLS)
3. **003_storage_setup.sql** - Configura buckets de almacenamiento
4. **004_seed_data.sql** - Datos iniciales (productos CUBOT)
5. **005_create_profile_trigger.sql** - Auto-crea perfiles en signup
6. **006_create_admin_user.sql** - (Opcional) Script para crear usuario admin

### 3. Variables de Entorno

Crea un archivo `.env.local` basado en `.env.example`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# External Inventory API
INVENTORY_API_URL=https://www.zodilum.com:8089
INVENTORY_API_KEY=your_inventory_api_key_here

# Optional: Feature Flags
ENABLE_INVENTORY_CHECK=true

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 4. Crear Usuario Admin

1. Registra un usuario via `/auth/sign-up`
2. Confirma el email
3. Actualiza manualmente el rol en Supabase:
   ```sql
   UPDATE public.users 
   SET role = 'admin', vendor_id = NULL
   WHERE email = 'your-admin@email.com';
   ```

### 5. Ejecutar Aplicación

```bash
# Desarrollo
pnpm dev

# Build para producción
pnpm build

# Iniciar producción
pnpm start
```

Visita http://localhost:3000

## 📁 Estructura del Proyecto

```
app/
├── admin/          # Módulo Admin (dashboard, usuarios, ventas, validación, etc.)
├── vendor/         # Módulo Vendedor (dashboard, ventas, comisiones, perfil)
├── api/            # API Routes (admin, vendor, inventory)
└── auth/           # Páginas de autenticación

lib/
├── services/       # Servicios de negocio (sales, commissions, payments, etc.)
├── middleware/     # Middleware de autenticación y autorización
├── utils/          # Utilidades (IMEI, CSV, risk, IDs)
└── types.ts        # TypeScript types

scripts/
├── 001_create_schema.sql      # Schema de base de datos
├── 002_rls_policies.sql       # Políticas RLS
├── 003_storage_setup.sql      # Configuración de storage
├── 004_seed_data.sql          # Datos iniciales
└── load-seeds.ts              # Script para cargar seeds

tests/              # Tests con Vitest
```

## 🔐 Seguridad

- **Row Level Security (RLS)**: Habilitado en todas las tablas
- **RBAC**: Control de acceso basado en roles (admin, vendor, validator, finance)
- **Middleware**: Protección de rutas `/admin/*` y `/vendor/*`
- **IMEI Masking**: Los IMEIs se enmascaran en logs (últimos 4 dígitos)
- **API Keys**: Nunca expuestas al cliente (solo server-side)
- **Signed URLs**: Para acceso seguro a archivos en storage

## 📊 Funcionalidades por Módulo

### Admin

- **Dashboard**: KPIs, gráficos, estadísticas
- **Usuarios**: CRUD completo, asignación de roles
- **Catálogo**: Gestión de productos, importación CSV
- **Ventas**: Lista con filtros, detalles, evidencia
- **Validación**: Cola de ventas pendientes con niveles de riesgo
- **Comisiones**: Resumen por vendedor, recálculo por período
- **Pagos**: Creación de lotes, exportación CSV, marcado como completado
- **Reportes**: Exportación CSV/XLSX con filtros

### Vendedor

- **Dashboard**: Estadísticas personales, últimas ventas
- **Registrar Venta**: Formulario con validación IMEI automática
- **Mis Ventas**: Historial con estados y evidencia
- **Comisiones**: Resumen, desglose por período, bonos
- **Pagos**: Historial de lotes y recibos
- **Catálogo**: Productos activos con precios y comisiones
- **Perfil**: Edición de datos, métodos de pago, KYC

## ✅ Validaciones Implementadas

- **IMEI**: Formato 15 dígitos + algoritmo Luhn
- **Duplicados**: Bloqueo de IMEIs aprobados (partial unique index)
- **Riesgo**: Análisis automático (duplicados, tasa de rechazo, anomalías)
- **Inventario**: Verificación contra API externa
- **Coincidencia Modelo**: Alerta si modelo del IMEI no coincide con producto seleccionado

## 🔄 Flujo de Trabajo

1. **Vendedor registra venta** → IMEI validado → Estado: `pending`
2. **Admin/Validator revisa** → Aprobar/Rechazar con razón
3. **Si aprobado** → Comisión calculada → Agregada a `vendor_commissions`
4. **Admin crea lote de pago** → CSV generado → Comisiones marcadas como `processing`
5. **Admin marca completado** → Comisiones marcadas como `paid`

## 🧪 Testing

```bash
# Ejecutar tests
pnpm test

# Tests con UI
pnpm test:ui
```

Tests incluidos:
- Validación IMEI (formato, Luhn)
- Cálculo de comisiones (fijo, porcentaje)
- Utilidades CSV
- Detección de duplicados

## 📝 Scripts Disponibles

```bash
# Desarrollo
pnpm dev

# Build
pnpm build

# Producción
pnpm start

# Tests
pnpm test

# Cargar seeds
pnpm load-seeds

# Exportar pagos
pnpm export-payments

# Probar API de inventario
pnpm test-inventory
```

## 🔗 API Endpoints

### Admin
- `GET /api/admin/users` - Lista usuarios
- `POST /api/admin/users` - Crear usuario
- `GET /api/admin/sales` - Lista ventas
- `GET /api/admin/validation/pending` - Cola de validación
- `PUT /api/admin/sales/[id]/status` - Aprobar/Rechazar venta
- `POST /api/admin/commissions/recalculate` - Recalcular comisiones
- `POST /api/admin/payments` - Crear lote de pago
- `GET /api/admin/reports` - Exportar reportes

### Vendor
- `GET /api/vendor/sales` - Mis ventas
- `POST /api/vendor/sales` - Registrar venta
- `GET /api/vendor/commissions` - Mis comisiones
- `GET /api/vendor/payments` - Historial de pagos
- `GET /api/vendor/profile` - Mi perfil
- `PUT /api/vendor/profile` - Actualizar perfil

### Inventory
- `POST /api/inventory/check` - Verificar IMEI en inventario externo

## 📚 Documentación Adicional

- **SETUP.md**: Guía rápida de setup
- **ACCEPTANCE_CHECKLIST.md**: Checklist completo de funcionalidades
- **IMPLEMENTATION_ANALYSIS.md**: Análisis de implementación vs especificación

## 🔒 2FA/MFA (Opcional)

El sistema soporta 2FA mediante Supabase Auth MFA TOTP. Para habilitarlo:

1. Configura MFA en Supabase Dashboard
2. Los usuarios pueden habilitarlo desde su perfil
3. Documentación: https://supabase.com/docs/guides/auth/auth-mfa

## 🐛 Troubleshooting

### Error: "IMEI not found in inventory"
- Verifica que `INVENTORY_API_URL` y `INVENTORY_API_KEY` estén configurados
- Prueba la conexión con `pnpm test-inventory`

### Error: "Permission denied"
- Verifica que el usuario tenga el rol correcto
- Revisa las políticas RLS en Supabase

### Error: "Table does not exist"
- Ejecuta los scripts SQL en orden
- Verifica que todas las tablas estén creadas

## 📄 Licencia

Proyecto privado - CUBOT Sales System

## 👥 Soporte

Para problemas o preguntas, contacta al equipo de desarrollo.
# cubot-app
