"use client";

import { useState } from "react";
import type { PosCategory, PosProduct, PosTable } from "@/lib/data/pos";
import { useCurrency } from "@/components/providers/regional-provider";
import { OpenTableDialog } from "./open-table-dialog";

type PosBoardProps = {
  categories: PosCategory[];
  products: PosProduct[];
  tables: PosTable[];
  branchId: string;
  userId: string;
};

const STATUS_LABEL: Record<PosTable["status"], string> = {
  available: "Libre",
  occupied: "Activa",
  reserved: "Reservada",
  disabled: "Deshabilitada"
};

const STATUS_COLOR: Record<PosTable["status"], string> = {
  available: "text-forest",
  occupied: "text-ember",
  reserved: "text-amber-600",
  disabled: "text-ink/30"
};

export function PosBoard({ categories, products, tables, branchId, userId }: PosBoardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openTableDialog, setOpenTableDialog] = useState<PosTable | null>(null);
  const fmt = useCurrency();

  const visibleProducts = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      {/* Left: categories + products */}
      <section className="space-y-6">
        {/* Categories */}
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-[26px] p-5 text-left shadow-lg transition hover:-translate-y-1 ${
              selectedCategory === null
                ? "bg-ink text-cloud"
                : "border border-ink/10 bg-white text-ink/70"
            }`}
          >
            <p className="text-xs uppercase tracking-[0.25em] opacity-60">Categoria</p>
            <p className="mt-10 text-2xl font-semibold">Todos</p>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
              style={{ backgroundColor: cat.color + "cc" }}
              className={`rounded-[26px] p-5 text-left text-white shadow-lg transition hover:-translate-y-1 ${
                cat.id === selectedCategory ? "ring-2 ring-white ring-offset-2" : ""
              }`}
            >
              <p className="text-xs uppercase tracking-[0.25em] text-white/70">Categoria</p>
              <p className="mt-10 text-2xl font-semibold">{cat.name}</p>
            </button>
          ))}
        </div>

        {/* Products */}
        {visibleProducts.length === 0 ? (
          <p className="text-sm text-ink/45">Sin productos en esta categoria.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product) => (
              <article key={product.id} className="rounded-[28px] border border-ink/10 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.25em] text-ink/40">
                  {categories.find((c) => c.id === product.categoryId)?.name ?? "—"}
                </p>
                <h3 className="mt-4 text-xl font-semibold">{product.name}</h3>
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-lg font-semibold text-forest">{fmt(product.price)}</span>
                  <button className="rounded-2xl bg-ink px-4 py-2 text-sm font-medium text-cloud transition hover:bg-ember">
                    Agregar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Right: tables */}
      <section className="space-y-4 rounded-[32px] border border-ink/10 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Mesas y cuenta</p>
            <h3 className="mt-2 text-2xl font-semibold">Operacion en sala</h3>
          </div>
          <button className="rounded-2xl border border-ink/10 px-4 py-2 text-sm font-medium">Nueva mesa</button>
        </div>

        <div className="grid gap-3 overflow-y-auto" style={{ maxHeight: "60vh" }}>
          {tables.length === 0 ? (
            <p className="text-sm text-ink/45">Sin mesas configuradas.</p>
          ) : (
            tables.map((table) => (
              <article key={table.id} className="rounded-[24px] border border-ink/10 bg-canvas/55 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-semibold">Mesa {table.tableNumber}</p>
                    <p className="mt-1 text-xs text-ink/45">{table.areaName}</p>
                    {table.status === "occupied" && (
                      <p className="mt-1 text-sm text-ink/55">
                        {table.guestCount > 0 ? `${table.guestCount} comensales` : "Mesa activa"}
                      </p>
                    )}
                  </div>
                  <span className={`rounded-full bg-white px-3 py-1 text-xs font-semibold ${STATUS_COLOR[table.status]}`}>
                    {STATUS_LABEL[table.status]}
                  </span>
                </div>
                {table.status === "occupied" && (
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-ink/55">Cuenta actual</span>
                    <span className="font-semibold">{fmt(table.openSaleTotal)}</span>
                  </div>
                )}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => table.status === "available" && setOpenTableDialog(table)}
                    className="rounded-2xl bg-ink px-4 py-2 text-sm font-medium text-cloud disabled:opacity-50"
                    disabled={table.status !== "available"}
                  >
                    {table.status === "occupied" ? "Ver cuenta" : "Abrir"}
                  </button>
                  <button className="rounded-2xl border border-ink/10 px-4 py-2 text-sm font-medium">
                    {table.status === "occupied" ? "Dividir" : "Info"}
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <OpenTableDialog
        table={openTableDialog}
        onClose={() => setOpenTableDialog(null)}
        branchId={branchId}
        userId={userId}
      />
    </div>
  );
}