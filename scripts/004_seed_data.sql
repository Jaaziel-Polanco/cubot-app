-- Actualizar seeds para usar campos correctos del schema

-- Insert products (6 CUBOT models)
INSERT INTO public.products (sku, name, category, price, commission_amount, commission_percent, stock, active) VALUES
('CBT-X80', 'CUBOT X80', 'Flagship', 250.00, 25.00, 0, 100, true),
('CBT-NOTE50', 'CUBOT NOTE 50', 'Mid-Range', 180.00, 20.00, 0, 150, true),
('CBT-MAX5', 'CUBOT MAX 5', 'Mid-Range', 220.00, 0, 10.00, 120, true),
('CBT-KP1', 'CUBOT KingKong Power', 'Rugged', 350.00, 35.00, 0, 80, true),
('CBT-P80', 'CUBOT P80', 'Budget', 150.00, 15.00, 0, 200, true),
('CBT-POCKET', 'CUBOT Pocket', 'Budget', 120.00, 0, 12.00, 180, true)
ON CONFLICT (sku) DO NOTHING;

-- Note: Admin and vendor users must be created via Supabase Auth UI or API
-- After creating auth users, update the users table with role and metadata
