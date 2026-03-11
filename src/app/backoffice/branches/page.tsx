import { AppShell } from "@/components/layout/app-shell";
import { requireAppAccess } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { BranchList } from "@/components/backoffice/branch-list";

export default async function BranchesPage() {
  const { appUser } = await requireAppAccess("backoffice");
  
  const admin = createAdminClient();
  const { data: branches } = await admin
    .from("branches")
    .select("id, name, code, address, phone, is_active")
    .eq("organization_id", appUser.organization_id)
    .order("name");

  return (
    <AppShell
      module="backoffice"
      title="Sedes y locales"
      subtitle="Configura tus ubicaciones de operacion. Cada sede maneja su inventario, mesas y personal de forma independiente."
    >
      <BranchList branches={branches ?? []} organizationId={appUser.organization_id} />
    </AppShell>
  );
}
