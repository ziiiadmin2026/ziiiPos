"use client";

import { Settings, Users } from "lucide-react";

type Table = {
  id: string;
  table_number: string;
  capacity: number | null;
  status: "available" | "occupied" | "reserved" | "disabled";
  is_active: boolean;
  service_area_id: string | null;
};

type TableCardProps = {
  table: Table;
  areaName: string;
  onEdit: () => void;
};

const STATUS_CONFIG = {
  available: { label: "Libre", color: "bg-forest/10 text-forest border-forest/20" },
  occupied: { label: "Ocupada", color: "bg-ember/10 text-ember border-ember/20" },
  reserved: { label: "Reservada", color: "bg-amber-50 text-amber-700 border-amber-200" },
  disabled: { label: "Deshabilitada", color: "bg-ink/5 text-ink/40 border-ink/10" }
};

export function TableCard({ table, areaName, onEdit }: TableCardProps) {
  const statusCfg = STATUS_CONFIG[table.status];

  return (
    <article className="group relative rounded-[24px] border border-ink/10 bg-white p-5 shadow-sm transition hover:shadow-md">
      {!table.is_active && (
        <div className="absolute right-3 top-3 rounded-lg bg-ink/5 px-2 py-1 text-xs font-medium text-ink/50">
          Inactiva
        </div>
      )}

      <div className="flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-forest/10 text-2xl font-bold text-forest">
          {table.table_number}
        </div>

        <div className="mt-4 text-center">
          <div className={`inline-flex rounded-xl border px-3 py-1 text-xs font-medium ${statusCfg.color}`}>
            {statusCfg.label}
          </div>
          <p className="mt-2 text-xs uppercase tracking-widest text-ink/40">{areaName}</p>
        </div>

        {table.capacity && (
          <div className="mt-3 flex items-center gap-1.5 text-sm text-ink/60">
            <Users className="h-4 w-4" />
            <span>{table.capacity} personas</span>
          </div>
        )}
      </div>

      <button
        onClick={onEdit}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-ink/10 px-4 py-2 text-sm font-medium transition hover:bg-ink/5"
      >
        <Settings className="h-4 w-4" />
        Configurar
      </button>
    </article>
  );
}
