import { AppShell } from "@/components/layout/app-shell";

const recipeRows = [
  { product: "Hamburguesa ZiiiPos", cost: "$78.40", price: "$219.00", margin: "64.2%" },
  { product: "Ribeye 350g", cost: "$224.50", price: "$448.00", margin: "49.9%" },
  { product: "Carajillo", cost: "$31.20", price: "$145.00", margin: "78.5%" }
];

const inventoryRows = [
  { movement: "Compra proveedor", ingredient: "Carne molida premium", qty: "+12 kg", ref: "OC-2026-014" },
  { movement: "Merma", ingredient: "Pan brioche", qty: "-6 pzas", ref: "AJ-2026-003" },
  { movement: "Consumo venta", ingredient: "Cafe espresso", qty: "-0.58 kg", ref: "VTA-1026" }
];

export default function BackofficePage() {
  return (
    <AppShell
      title="Backoffice y costeo"
      subtitle="Control de ingredientes, compras, recetas y movimientos para mantener margen y stock bajo supervision constante."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[32px] border border-ink/10 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Food cost</p>
          <h3 className="mt-2 text-2xl font-semibold">Recetas con margen</h3>
          <div className="mt-6 overflow-hidden rounded-[24px] border border-ink/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-canvas/70 text-ink/55">
                <tr>
                  <th className="px-4 py-3 font-medium">Producto</th>
                  <th className="px-4 py-3 font-medium">Costo</th>
                  <th className="px-4 py-3 font-medium">Precio</th>
                  <th className="px-4 py-3 font-medium">Margen</th>
                </tr>
              </thead>
              <tbody>
                {recipeRows.map((row) => (
                  <tr key={row.product} className="border-t border-ink/10 bg-white">
                    <td className="px-4 py-4 font-medium">{row.product}</td>
                    <td className="px-4 py-4">{row.cost}</td>
                    <td className="px-4 py-4">{row.price}</td>
                    <td className="px-4 py-4 font-semibold text-forest">{row.margin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-[32px] border border-ink/10 bg-ink p-6 text-cloud shadow-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-cloud/55">Trazabilidad</p>
          <h3 className="mt-2 text-2xl font-semibold">Ultimos movimientos de almacen</h3>
          <div className="mt-6 space-y-3">
            {inventoryRows.map((row) => (
              <div key={`${row.movement}-${row.ref}`} className="rounded-[24px] bg-cloud/10 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{row.ingredient}</p>
                    <p className="text-sm text-cloud/65">{row.movement}</p>
                  </div>
                  <span className="text-lg font-semibold">{row.qty}</span>
                </div>
                <p className="mt-3 text-sm text-cloud/65">Referencia {row.ref}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </AppShell>
  );
}