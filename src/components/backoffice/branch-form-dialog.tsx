"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { createBranchAction, updateBranchAction } from "@/app/backoffice/branches/actions";

type Branch = {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
  phone: string | null;
  is_active: boolean;
};

type BranchFormDialogProps = {
  open: boolean;
  onClose: () => void;
  branch: Branch | null;
  organizationId: string;
};

export function BranchFormDialog({ open, onClose, branch, organizationId }: BranchFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    try {
      if (branch) {
        formData.append("id", branch.id);
        const result = await updateBranchAction(formData);
        if (result.error) {
          setError(result.error);
        } else {
          onClose();
        }
      } else {
        formData.append("organizationId", organizationId);
        const result = await createBranchAction(formData);
        if (result.error) {
          setError(result.error);
        } else {
          onClose();
        }
      }
    } catch (err) {
      setError("Error al guardar la sede");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[32px] border border-ink/10 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{branch ? "Editar sede" : "Nueva sede"}</h2>
          <button
            onClick={onClose}
            className="rounded-xl p-2 transition hover:bg-ink/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink/70">
              Nombre de la sede *
            </label>
            <input
              type="text"
              name="name"
              defaultValue={branch?.name}
              required
              className="mt-1 w-full rounded-xl border border-ink/10 px-4 py-3 transition focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
              placeholder="Ej: Sucursal Centro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70">
              Codigo (opcional)
            </label>
            <input
              type="text"
              name="code"
              defaultValue={branch?.code ?? ""}
              className="mt-1 w-full rounded-xl border border-ink/10 px-4 py-3 uppercase transition focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
              placeholder="Ej: CTR"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70">
              Direccion (opcional)
            </label>
            <input
              type="text"
              name="address"
              defaultValue={branch?.address ?? ""}
              className="mt-1 w-full rounded-xl border border-ink/10 px-4 py-3 transition focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
              placeholder="Calle, numero, colonia, ciudad"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70">
              Telefono (opcional)
            </label>
            <input
              type="tel"
              name="phone"
              defaultValue={branch?.phone ?? ""}
              className="mt-1 w-full rounded-xl border border-ink/10 px-4 py-3 transition focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
              placeholder="+52 55 1234 5678"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              defaultChecked={branch?.is_active ?? true}
              className="h-4 w-4 rounded border-ink/20 text-forest focus:ring-forest"
            />
            <label htmlFor="is_active" className="text-sm text-ink/70">
              Sede activa
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
              {loading ? "Guardando..." : branch ? "Actualizar" : "Crear sede"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
