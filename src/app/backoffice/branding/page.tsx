import { AppShell } from "@/components/layout/app-shell";
import { requireAppAccess } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { BrandingForm } from "@/components/backoffice/branding-form";

export default async function BrandingPage() {
  const { appUser } = await requireAppAccess("backoffice");
  
  const admin = createAdminClient();
  const { data: organization } = await admin
    .from("organizations")
    .select("id, name, brand_name, logo_url, primary_color, secondary_color")
    .eq("id", appUser.organization_id)
    .single();

  if (!organization) {
    return (
      <AppShell module="backoffice" title="Personalizacion" subtitle="">
        <div className="rounded-[28px] border border-ink/10 bg-white p-12 text-center">
          <p className="text-ink/60">Organizacion no encontrada</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      module="backoffice"
      title="Personalizacion"
      subtitle="Configura el logo, colores y marca de tu negocio. Tu sistema, tu identidad."
    >
      <BrandingForm organization={organization} />
    </AppShell>
  );
}
