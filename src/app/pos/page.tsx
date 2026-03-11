import { AppShell } from "@/components/layout/app-shell";
import { PosBoard } from "@/components/pos/pos-board";
import { getPosData } from "@/lib/data/pos";
import { requireAppAccess } from "@/lib/auth/permissions";

export default async function PosPage() {
  const { appUser } = await requireAppAccess("pos");
  const branchId = appUser.branch_id ?? "22222222-2222-2222-2222-222222222222";
  const { categories, products, tables } = await getPosData(branchId);

  return (
    <AppShell
      module="pos"
      title="Punto de venta tactil"
      subtitle="Categorias grandes, productos rapidos y control de mesas para una operacion fluida en salon, pickup y delivery."
    >
      <PosBoard categories={categories} products={products} tables={tables} />
    </AppShell>
  );
}