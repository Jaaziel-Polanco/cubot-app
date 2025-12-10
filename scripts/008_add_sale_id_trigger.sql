-- Create sequence for sale IDs
CREATE SEQUENCE IF NOT EXISTS public.sales_id_seq;

-- Function to generate sale_id
CREATE OR REPLACE FUNCTION public.generate_sale_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sale_id IS NULL THEN
    NEW.sale_id := 'VT-' || LPAD(nextval('public.sales_id_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set sale_id before insert
DROP TRIGGER IF EXISTS set_sale_id ON public.sales;
CREATE TRIGGER set_sale_id
BEFORE INSERT ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.generate_sale_id();
