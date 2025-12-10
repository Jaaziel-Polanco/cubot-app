# CUBOT Sales System - Setup Guide

## Prerequisites

- Supabase account and project
- Node.js 18+ installed

## Initial Setup

### 1. Supabase Configuration

The Supabase integration is already connected. Run the SQL scripts in order:

1. **001_create_schema.sql** - Creates all database tables
2. **002_rls_policies.sql** - Sets up Row Level Security policies
3. **003_storage_setup.sql** - Configures storage buckets for files
4. **004_seed_data.sql** - Adds initial product data
5. **005_create_profile_trigger.sql** - Auto-creates profiles on signup

### 2. Environment Variables

The following are already configured via Supabase integration:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- (and other Supabase variables)

**You need to add manually:**
- `INVENTORY_API_URL` - URL for external inventory API
- `INVENTORY_API_KEY` - API key for inventory service

### 3. Create Admin User

1. Sign up via `/auth/sign-up`
2. Confirm email
3. Manually update role in Supabase:
   \`\`\`sql
   UPDATE users 
   SET role = 'admin', vendor_id = NULL
   WHERE email = 'your-admin@email.com';
   \`\`\`

## Running the Application

\`\`\`bash
npm install
npm run dev
\`\`\`

Visit http://localhost:3000

## Features Overview

### Admin Features
- Dashboard with KPIs
- User management
- Product catalog management
- Sales validation queue
- Commission management
- Payment batch processing
- Report exports (CSV)
- Audit log

### Vendor Features
- Personal dashboard
- Register sales with IMEI validation
- Upload sale evidence
- View commission history
- Payment history
- Product catalog
- Profile management
- KYC document upload

## Default Test Users

After running scripts, create users via signup:

1. **Admin**: Create via signup, then update role to 'admin'
2. **Vendors**: Auto-assigned vendor IDs (VND-001, VND-002, etc.)

## Security Features

- Row Level Security (RLS) on all tables
- Role-based access control (RBAC)
- IMEI masking in logs
- Signed URLs for file access
- API key never exposed to client
- Audit trail for all critical actions

## Product Commission Types

- **Fixed**: Vendor earns fixed amount per sale
- **Percentage**: Vendor earns percentage of sale price

## Validation Flow

1. Vendor registers sale
2. System validates IMEI format (Luhn algorithm)
3. System checks inventory via external API
4. Admin reviews and approves/rejects
5. On approval, commission is created
6. Commissions are batched for payment

## Payment Process

1. Admin selects pending commissions
2. System creates payment batch
3. CSV file generated for bank transfer
4. Vendors notified
5. Commissions marked as paid

## Support

For issues or questions, refer to the code documentation or check the audit logs in the admin panel.
