import { AppShell } from "@/components/layout/app-shell";
import ImportClient from "./import-client";

export const metadata = { title: "Importar Menú — ZiiiPos" };

export default async function ImportPage() {
  return (
    <AppShell
      title="Importar Menú"
      subtitle="Carga tu catálogo desde un archivo Excel o CSV. Los productos existentes se actualizarán y los nuevos se crearán automáticamente."
      module="backoffice"
    >
      <ImportClient />
    </AppShell>
  );
}
