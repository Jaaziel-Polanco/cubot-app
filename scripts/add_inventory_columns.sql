-- Add inventory check columns to sales table
ALTER TABLE public.sales
ADD COLUMN IF NOT EXISTS inventory_check_status text,
ADD COLUMN IF NOT EXISTS inventory_data jsonb;

-- Add index for inventory check status for performance
CREATE INDEX IF NOT EXISTS idx_sales_inventory_status ON public.sales(inventory_check_status);
