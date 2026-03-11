import { AppShell } from "@/components/layout/app-shell";
import { requireAppAccess } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { TableFloorPlan } from "@/components/backoffice/table-floor-plan";

export default async function TablesPage() {
  const { appUser } = await requireAppAccess("backoffice");
  const branchId = appUser.branch_id;

  if (!branchId) {
    return (
      <AppShell module="backoffice" title="Gestion de mesas" subtitle="">
        <div className="rounded-[28px] border border-ink/10 bg-white p-12 text-center">
          <p className="text-ink/60">Asigna una sede a tu usuario para gestionar mesas</p>
        </div>
      </AppShell>
    );
  }

  const admin = createAdminClient();
  
  const [{ data: areas }, { data: tables }] = await Promise.all([
    admin
      .from("service_areas")
      .select("id, name, sort_order")
      .eq("branch_id", branchId)
      .order("sort_order"),
    admin
      .from("restaurant_tables")
      .select("id, table_number, capacity, status, is_active, service_area_id, pos_x, pos_y, width, height, rotation, shape")
      .eq("branch_id", branchId)
      .order("table_number")
  ]);

  return (
    <AppShell
      module="backoffice"
      title="Gestion de mesas"
      subtitle="Organiza tus areas de servicio y configura la distribucion de mesas. Asigna numeros, capacidad y estado."
    >
      <TableFloorPlan
        branchId={branchId}
        areas={areas ?? []}
        tables={tables ?? []}
      />
    </AppShell>
  );
}
