"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { createAreaAction } from "@/app/backoffice/tables/actions";

type AreaFormDialogProps = {
  open: boolean;
  onClose: () => void;
  branchId: string;
};

export function AreaFormDialog({ open, onClose, branchId }: AreaFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("branchId", branchId);

    try {
      const result = await createAreaAction(formData);
      if (result.error) {
        setError(result.error);
      } else {
        onClose();
      }
    } catch (err) {
      setError("Error al crear el area");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[32px] border border-ink/10 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Nueva area</h2>
          <button onClick={onClose} className="rounded-xl p-2 transition hover:bg-ink/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink/70">
              Nombre del area *
            </label>
            <input
              type="text"
              name="name"
              required
              className="mt-1 w-full rounded-xl border border-ink/10 px-4 py-3 transition focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
              placeholder="Ej: Salon principal, Terraza, VIP"
            />
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
              {loading ? "Creando..." : "Crear area"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
