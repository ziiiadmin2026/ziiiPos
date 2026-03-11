import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { kitchenQueue, metrics, stockAlerts, topProducts } from "@/lib/mock-data";

export default function Home() {
  return (
    <AppShell
      title="Dashboard operativo"
      subtitle="Vista unificada de ventas, cocina, inventario y caja para decisiones rapidas durante el servicio."
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-[32px] border border-ink/10 bg-white p-6 shadow-sm">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Top ventas</p>
                <h3 className="mt-2 text-2xl font-semibold">Productos mas vendidos</h3>
              </div>
              <p className="text-sm text-ink/55">Actualizado hace 2 min</p>
            </div>
            <div className="mt-6 space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between rounded-[22px] bg-canvas/65 px-4 py-4">
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-sm font-semibold text-cloud">
                      0{index + 1}
                    </span>
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-ink/55">{product.sold} vendidos</p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-forest">{product.revenue}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[32px] border border-ink/10 bg-ink p-6 text-cloud shadow-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-cloud/55">Cola de cocina</p>
            <h3 className="mt-2 text-2xl font-semibold">Produccion en tiempo real</h3>
            <div className="mt-6 space-y-3">
              {kitchenQueue.map((ticket) => (
                <div key={ticket.ticket} className="rounded-[24px] bg-cloud/10 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{ticket.ticket}</p>
                    <span className="text-sm text-cloud/65">{ticket.table}</span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold">{ticket.stage}</p>
                  <p className="mt-2 text-sm text-cloud/72">{ticket.items} partidas activas</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <article className="rounded-[32px] border border-ink/10 bg-white p-6 shadow-sm">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Inventario</p>
                <h3 className="mt-2 text-2xl font-semibold">Alertas de stock minimo</h3>
              </div>
              <button className="rounded-2xl border border-ink/10 px-4 py-2 text-sm font-medium">Ver almacen</button>
            </div>
            <div className="mt-6 space-y-3">
              {stockAlerts.map((item) => (
                <div key={item.ingredient} className="flex items-center justify-between rounded-[22px] border border-orange-200 bg-orange-50/80 px-4 py-4">
                  <div>
                    <p className="font-semibold">{item.ingredient}</p>
                    <p className="text-sm text-ink/55">Minimo requerido: {item.minimum}</p>
                  </div>
                  <span className="text-lg font-semibold text-ember">{item.stock}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[32px] border border-ink/10 bg-gradient-to-br from-forest to-emerald-800 p-6 text-cloud shadow-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-cloud/55">Proximo paso</p>
            <h3 className="mt-2 max-w-lg text-3xl font-semibold tracking-tight">El sistema ya esta preparado para conectar las vistas al esquema de Supabase y operar ventas reales.</h3>
            <p className="mt-4 max-w-xl text-sm text-cloud/75">
              La siguiente capa natural es enlazar autenticacion, consultas SQL y reglas de descuento automatico de ingredientes al cerrar una venta.
            </p>
          </article>
        </section>
      </div>
    </AppShell>
  );
}