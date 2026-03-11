"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { createTableAction, updateTableAction } from "@/app/backoffice/tables/actions";

type Table = {
  id: string;
  table_number: string;
  capacity: number | null;
  status: "available" | "occupied" | "reserved" | "disabled";
  is_active: boolean;
  service_area_id: string | null;
  shape?: string | null;
};

type ServiceArea = {
  id: string;
  name: string;
};

type TableFormDialogProps = {
  open: boolean;
  onClose: () => void;
  table: Table | null;
  branchId: string;
  areas: ServiceArea[];
};

export function TableFormDialog({ open, onClose, table, branchId, areas }: TableFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      if (table) {
        formData.append("id", table.id);
        const result = await updateTableAction(formData);
        if (result.error) {
          setError(result.error);
        } else {
          onClose();
        }
      } else {
        formData.append("branchId", branchId);
        const result = await createTableAction(formData);
        if (result.error) {
          setError(result.error);
        } else {
          onClose();
        }
      }
    } catch (err) {
      setError("Error al guardar la mesa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[32px] border border-ink/10 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{table ? "Editar mesa" : "Nueva mesa"}</h2>
          <button onClick={onClose} className="rounded-xl p-2 transition hover:bg-ink/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink/70">
              Numero de mesa *
            </label>
            <input
              type="text"
              name="table_number"
              defaultValue={table?.table_number}
              required
              className="mt-1 w-full rounded-xl border border-ink/10 px-4 py-3 transition focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
              placeholder="Ej: 1, A1, VIP-5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70">
              Area de servicio
            </label>
            <select
              name="service_area_id"
              defaultValue={table?.service_area_id ?? ""}
              className="mt-1 w-full rounded-xl border border-ink/10 px-4 py-3 transition focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
            >
              <option value="">Sin area</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70">
              Capacidad (personas)
            </label>
            <input
              type="number"
              name="capacity"
              defaultValue={table?.capacity ?? 4}
              min="1"
              className="mt-1 w-full rounded-xl border border-ink/10 px-4 py-3 transition focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70">
              Forma visual
            </label>
            <select
              name="shape"
              defaultValue={table?.shape ?? "square"}
              className="mt-1 w-full rounded-xl border border-ink/10 px-4 py-3 transition focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
            >
              <option value="square">Cuadrada</option>
              <option value="round">Redonda</option>
              <option value="rectangle">Rectangular</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70">
              Estado
            </label>
            <select
              name="status"
              defaultValue={table?.status ?? "available"}
              className="mt-1 w-full rounded-xl border border-ink/10 px-4 py-3 transition focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
            >
              <option value="available">Libre</option>
              <option value="occupied">Ocupada</option>
              <option value="reserved">Reservada</option>
              <option value="disabled">Deshabilitada</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              defaultChecked={table?.is_active ?? true}
              className="h-4 w-4 rounded border-ink/20 text-forest focus:ring-forest"
            />
            <label htmlFor="is_active" className="text-sm text-ink/70">
              Mesa activa
            </label>
          </div>

          {error && (
            <div className="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-ink/10 px-4 py-3 text-sm font-medium transition hover:bg-ink/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-cloud transition hover:bg-ember disabled:opacity-50"
            >
              {loading ? "Guardando..." : table ? "Actualizar" : "Crear mesa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
