-- Add branding fields to organizations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'organizations' 
    AND column_name = 'brand_name'
  ) THEN
    ALTER TABLE public.organizations 
    ADD COLUMN brand_name text,
    ADD COLUMN logo_url text,
    ADD COLUMN primary_color text DEFAULT '#1c1917',
    ADD COLUMN secondary_color text DEFAULT '#16a34a';
  END IF;
END $$;

COMMENT ON COLUMN public.organizations.brand_name IS 'Custom brand name displayed in the app (if different from legal name)';
COMMENT ON COLUMN public.organizations.logo_url IS 'URL or path to organization logo (white-label customization)';
COMMENT ON COLUMN public.organizations.primary_color IS 'Primary brand color for theming';
COMMENT ON COLUMN public.organizations.secondary_color IS 'Secondary brand color (typically accent color)';
