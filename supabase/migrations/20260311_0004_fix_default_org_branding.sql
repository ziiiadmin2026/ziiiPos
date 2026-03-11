-- Fix default organization name and logo to ZiiiPos branding
UPDATE public.organizations
SET
  name       = 'ZiiiPos',
  brand_name = 'ZiiiPos',
  logo_url   = 'https://ziii.com.mx/logos/1ZIIIlogo.png'
WHERE id = '11111111-1111-1111-1111-111111111111';
