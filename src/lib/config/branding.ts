import { createAdminClient } from "@/lib/supabase/admin";

type BrandingConfig = {
  name: string;
  brandName: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
};

export async function getBrandingConfig(organizationId: string): Promise<BrandingConfig> {
  const admin = createAdminClient();
  
  const { data: org } = await admin
    .from("organizations")
    .select("name, brand_name, logo_url, primary_color, secondary_color")
    .eq("id", organizationId)
    .single();

  return {
    name: org?.brand_name || org?.name || "Restaurant",
    brandName: org?.brand_name || null,
    logoUrl: org?.logo_url || null,
    primaryColor: org?.primary_color || "#1c1917",
    secondaryColor: org?.secondary_color || "#16a34a"
  };
}
