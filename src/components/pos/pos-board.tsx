import { posCategories, posProducts, openTables } from "@/lib/mock-data";
import { currency } from "@/lib/utils";

export function PosBoard() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {posCategories.map((category) => (
            <button
              key={category.id}
              className={`rounded-[26px] bg-gradient-to-br ${category.accent} p-5 text-left text-white shadow-lg transition hover:-translate-y-1`}
            >
              <p className="text-xs uppercase tracking-[0.25em] text-white/70">Categoria</p>
              <p className="mt-10 text-2xl font-semibold">{category.name}</p>
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {posProducts.map((product) => (
            <article key={product.id} className="rounded-[28px] border border-ink/10 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-ink/40">Preparacion {product.prepTime}</p>
              <h3 className="mt-4 text-xl font-semibold">{product.name}</h3>
              <div className="mt-8 flex items-center justify-between">
                <span className="text-lg font-semibold text-forest">{currency(product.price)}</span>
                <button className="rounded-2xl bg-ink px-4 py-2 text-sm font-medium text-cloud transition hover:bg-ember">
                  Agregar
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-[32px] border border-ink/10 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Mesas y cuenta</p>
            <h3 className="mt-2 text-2xl font-semibold">Operacion en sala</h3>
          </div>
          <button className="rounded-2xl border border-ink/10 px-4 py-2 text-sm font-medium">Nueva mesa</button>
        </div>

        <div className="grid gap-3">
          {openTables.map((table) => (
            <article key={table.id} className="rounded-[24px] border border-ink/10 bg-canvas/55 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold">{table.label}</p>
                  <p className="mt-1 text-sm text-ink/55">{table.guests} comensales</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink/60">{table.status}</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-ink/55">Cuenta actual</span>
                <span className="font-semibold">{currency(table.total)}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="rounded-2xl bg-ink px-4 py-2 text-sm font-medium text-cloud">Abrir</button>
                <button className="rounded-2xl border border-ink/10 px-4 py-2 text-sm font-medium">Dividir</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}