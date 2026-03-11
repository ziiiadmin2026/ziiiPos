import { AppShell } from "@/components/layout/app-shell";
import { PosBoard } from "@/components/pos/pos-board";

export default function PosPage() {
  return (
    <AppShell
      title="Punto de venta tactil"
      subtitle="Categorias grandes, productos rapidos y control de mesas para una operacion fluida en salon, pickup y delivery."
    >
      <PosBoard />
    </AppShell>
  );
}