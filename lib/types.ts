export type UserRole = "admin" | "vendor" | "validator" | "finance"
export type UserStatus = "active" | "suspended"
export type SaleStatus = "pending" | "approved" | "rejected"
export type SaleChannel = "Online" | "Tienda Fisica" | "Marketplace" | "Venta Telefonica"
export type RiskLevel = "low" | "medium" | "high"
export type CommissionStatus = "pending" | "processing" | "paid"
export type PaymentStatus = "pending" | "processing" | "completed" | "failed"
export type PaymentType = "weekly" | "biweekly" | "monthly"
export type KycStatus = "pending" | "approved" | "rejected"
export type CommissionType = "fixed" | "percentage"
export type KycDocumentType = "INE" | "PASSPORT" | "DRIVER_LICENSE" | "PROOF_OF_ADDRESS"
export type ProductCategory = "Flagship" | "Mid-Range" | "Rugged" | "Budget"

export interface User {
  id: string
  email: string
  name: string
  phone: string | null
  role: UserRole
  status: UserStatus
  vendor_id: string | null
  kyc_status: KycStatus
  kyc_verified_at: string | null
  identification_number: string | null
  address: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  bank_account: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  sku: string
  name: string
  category: ProductCategory
  price: number
  commission_amount: number
  commission_percent: number
  stock: number
  image_url: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  sale_id: string
  vendor_id: string
  product_id: string
  imei: string
  price: number
  commission_amount: number
  channel: SaleChannel
  sale_date: string
  status: SaleStatus
  evidence_url: string | null
  notes: string | null
  rejection_reason: string | null
  risk_level: RiskLevel | null
  ip: string | null
  user_agent: string | null
  validated_by: string | null
  validated_at: string | null
  created_at: string
  updated_at: string
}

export interface CommissionScheme {
  id: string
  name: string
  type: CommissionType
  value: number
  min_sales: number | null
  max_commission: number | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface Commission {
  id: string
  sale_id: string
  vendor_id: string
  product_id: string
  base_amount: number
  commission_amount: number
  status: CommissionStatus
  payment_batch_id: string | null
  vendor_commission_id: string | null
  created_at: string
  updated_at: string
}

export interface VendorCommission {
  id: string
  vendor_id: string
  period_start: string
  period_end: string
  total_sales: number
  total_sales_amount: number
  total_commissions: number
  bonuses: number
  status: CommissionStatus
  paid_at: string | null
  payment_batch_id: string | null
  payment_receipt_id: string | null
  created_at: string
  updated_at: string
}

export interface VendorCommissionSummary {
  vendor_id: string
  vendor_name: string
  vendor_code: string | null
  bank_account: string | null
  commissions: Commission[]
  total: number
}

export interface PaymentBatch {
  id: string
  batch_id: string
  period_start: string
  period_end: string
  payment_type: PaymentType
  total_vendors: number
  total_amount: number
  status: PaymentStatus
  created_by: string
  processed_at: string | null
  completed_at: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  read: boolean
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface KycDocument {
  id: string
  vendor_id: string
  document_type: KycDocumentType
  document_name: string
  file_url: string
  status: KycStatus
  rejection_reason: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  actor_id: string | null
  entity: string
  entity_id: string
  action: string
  diff: Record<string, unknown> | null
  created_at: string
}

export interface InventoryCheckResult {
  id: string
  imei: string
  brand: string
  model: string
  color: string
  capacity: string
  price: number
  status: string
  addedToInventory: string | null
}

// CSV Export types
export interface PaymentCSVRow {
  vendor_id: string
  name: string
  bank_name: string
  bank_code: string
  account_holder_name: string
  account_number: string
  amount: string
  period_start: string
  period_end: string
  batch_id: string
}

export interface ProductImportCSVRow {
  sku: string
  name: string
  category: string
  price: string
  commission_amount: string
  commission_percent: string
  stock: string
  image_url: string
  active: string
}

export interface Bank {
  id: string
  name: string
  code: string
  country: string
  active: boolean
  account_number_format: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface VendorBankAccount {
  id: string
  vendor_id: string
  bank_id: string
  account_number: string
  account_holder_name: string
  account_type: "checking" | "savings" | "current" | null
  is_primary: boolean
  verified: boolean
  verified_by: string | null
  verified_at: string | null
  created_at: string
  updated_at: string
  banks?: Bank // Joined bank data
}
