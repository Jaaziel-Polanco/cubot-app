-- Seed data for banks (Dominican Republic)
-- Run this after creating the banks table

INSERT INTO public.banks (name, code, country, account_number_format, active, created_at, updated_at)
VALUES
  ('Banco Popular Dominicano', 'BPD', 'DO', '20 digits', true, NOW(), NOW()),
  ('Banco de Reservas', 'BANRESERVAS', 'DO', '20 digits', true, NOW(), NOW()),
  ('Banco BHD', 'BHD', 'DO', '20 digits', true, NOW(), NOW()),
  ('Banco León', 'LEON', 'DO', '20 digits', true, NOW(), NOW()),
  ('Banco Santa Cruz', 'BSC', 'DO', '20 digits', true, NOW(), NOW()),
  ('Banco Ademi', 'ADEMI', 'DO', '20 digits', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

