-- Rename price column to sale_price to match application code
ALTER TABLE public.sales
RENAME COLUMN price TO sale_price;
