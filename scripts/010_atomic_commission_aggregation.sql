-- Add vendor_commission_id to commissions table
ALTER TABLE public.commissions
ADD COLUMN IF NOT EXISTS vendor_commission_id UUID REFERENCES public.vendor_commissions(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_commissions_vendor_commission ON public.commissions(vendor_commission_id);

-- Function to atomically generate a vendor statement
CREATE OR REPLACE FUNCTION generate_vendor_statement(
  p_vendor_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS JSONB AS $$
DECLARE
  v_statement_id UUID;
  v_total_sales INTEGER;
  v_total_amount NUMERIC(14,2);
  v_total_commission NUMERIC(14,2);
  v_commission_ids UUID[];
BEGIN
  -- 1. Calculate totals for pending commissions in range that are NOT yet linked
  SELECT 
    COUNT(*),
    COALESCE(SUM(base_amount), 0),
    COALESCE(SUM(commission_amount), 0),
    ARRAY_AGG(id)
  INTO 
    v_total_sales,
    v_total_amount,
    v_total_commission,
    v_commission_ids
  FROM public.commissions
  WHERE vendor_id = p_vendor_id
    AND status = 'pending'
    AND vendor_commission_id IS NULL
    AND created_at::DATE >= p_start_date
    AND created_at::DATE <= p_end_date;

  -- 2. If no commissions found, return null result
  IF v_total_sales = 0 OR v_total_sales IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'No pending commissions found for this period');
  END IF;

  -- 3. Create Vendor Commission Statement
  INSERT INTO public.vendor_commissions (
    vendor_id,
    period_start,
    period_end,
    total_sales,
    total_sales_amount,
    total_commissions,
    status
  ) VALUES (
    p_vendor_id,
    p_start_date,
    p_end_date,
    v_total_sales,
    v_total_amount,
    v_total_commission,
    'pending'
  ) RETURNING id INTO v_statement_id;

  -- 4. Link commissions to this statement
  UPDATE public.commissions
  SET vendor_commission_id = v_statement_id
  WHERE id = ANY(v_commission_ids);

  -- 5. Return success
  RETURN jsonb_build_object(
    'success', true, 
    'statement_id', v_statement_id,
    'total_commissions', v_total_commission,
    'count', v_total_sales
  );

EXCEPTION WHEN OTHERS THEN
  -- Rollback is automatic in PL/pgSQL functions if exception raised
  RAISE EXCEPTION 'Error generating statement: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;
