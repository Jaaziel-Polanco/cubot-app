-- Create system_settings table for global configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.users(id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(key);

-- Insert default theme configuration if not exists
INSERT INTO public.system_settings (key, value, description)
VALUES (
  'theme_config',
  '{
    "primary": { "light": "oklch(0.52 0.15 250)", "dark": "oklch(0.6 0.15 250)" },
    "secondary": { "light": "oklch(0.65 0.03 250)", "dark": "oklch(0.3 0.03 250)" },
    "accent": { "light": "oklch(0.45 0.18 260)", "dark": "oklch(0.5 0.18 260)" },
    "sidebar": { "light": "oklch(0.25 0.03 250)", "dark": "oklch(0.18 0.02 250)" },
    "background": { "light": "oklch(0.99 0.005 240)", "dark": "oklch(0.15 0.02 250)" },
    "foreground": { "light": "oklch(0.2 0.02 250)", "dark": "oklch(0.95 0.01 240)" },
    "radius": "0.625rem"
  }'::jsonb,
  'Global theme configuration for the application'
) ON CONFLICT (key) DO NOTHING;

-- Add trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
