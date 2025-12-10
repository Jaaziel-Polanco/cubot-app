-- Primero crear la función get_user_role, luego habilitar RLS y crear policies

-- Helper function to get user role (CREATE BEFORE USING IT)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "Vendors can view their own data" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Admins can update users" ON public.users
  FOR UPDATE USING (get_user_role() = 'admin');

CREATE POLICY "Vendors can update their own profile" ON public.users
  FOR UPDATE USING (id = auth.uid() AND role = 'vendor');

-- Products policies
CREATE POLICY "Everyone can view active products" ON public.products
  FOR SELECT USING (active = true OR get_user_role() = 'admin');

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (get_user_role() = 'admin');

-- Sales policies
CREATE POLICY "Admins can view all sales" ON public.sales
  FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "Vendors can view their own sales" ON public.sales
  FOR SELECT USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can insert their own sales" ON public.sales
  FOR INSERT WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Admins can update sales" ON public.sales
  FOR UPDATE USING (get_user_role() = 'admin');

-- Commissions policies
CREATE POLICY "Admins can view all commissions" ON public.commissions
  FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "Vendors can view their own commissions" ON public.commissions
  FOR SELECT USING (vendor_id = auth.uid());

CREATE POLICY "Admins can manage commissions" ON public.commissions
  FOR ALL USING (get_user_role() = 'admin');

-- Vendor commissions policies
CREATE POLICY "Admins can view all vendor_commissions" ON public.vendor_commissions
  FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "Vendors can view their own vendor_commissions" ON public.vendor_commissions
  FOR SELECT USING (vendor_id = auth.uid());

CREATE POLICY "Admins can manage vendor_commissions" ON public.vendor_commissions
  FOR ALL USING (get_user_role() = 'admin');

-- Commission schemes policies
CREATE POLICY "Everyone can view commission_schemes" ON public.commission_schemes
  FOR SELECT USING (active = true OR get_user_role() = 'admin');

CREATE POLICY "Admins can manage commission_schemes" ON public.commission_schemes
  FOR ALL USING (get_user_role() = 'admin');

-- Payment batches policies
CREATE POLICY "Admins can manage payment batches" ON public.payment_batches
  FOR ALL USING (get_user_role() = 'admin');

CREATE POLICY "Vendors can view their payment batches" ON public.payment_batches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.vendor_commissions vc
      WHERE vc.payment_batch_id = payment_batches.id
        AND vc.vendor_id = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- KYC documents policies
CREATE POLICY "Vendors can view their own KYC docs" ON public.kyc_documents
  FOR SELECT USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can insert their own KYC docs" ON public.kyc_documents
  FOR INSERT WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Admins can view all KYC docs" ON public.kyc_documents
  FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "Admins can update KYC docs" ON public.kyc_documents
  FOR UPDATE USING (get_user_role() = 'admin');

-- Banks policies
CREATE POLICY "Everyone can view active banks" ON public.banks
  FOR SELECT USING (active = true OR get_user_role() = 'admin');

CREATE POLICY "Admins can manage banks" ON public.banks
  FOR ALL USING (get_user_role() = 'admin');

-- Vendor bank accounts policies
CREATE POLICY "Vendors can view their own bank accounts" ON public.vendor_bank_accounts
  FOR SELECT USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can insert their own bank accounts" ON public.vendor_bank_accounts
  FOR INSERT WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors can update their own bank accounts" ON public.vendor_bank_accounts
  FOR UPDATE USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can delete their own bank accounts" ON public.vendor_bank_accounts
  FOR DELETE USING (vendor_id = auth.uid() AND is_primary = FALSE);

CREATE POLICY "Admins can view all vendor bank accounts" ON public.vendor_bank_accounts
  FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "Admins can update vendor bank accounts" ON public.vendor_bank_accounts
  FOR UPDATE USING (get_user_role() = 'admin');

-- Audit log policies
CREATE POLICY "Admins can view audit log" ON public.audit_log
  FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "System can insert audit log" ON public.audit_log
  FOR INSERT WITH CHECK (true);
