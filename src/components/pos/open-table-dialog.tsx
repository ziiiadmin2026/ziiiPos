"use client";

import { Users, X } from "lucide-react";
import { useState } from "react";
import type { PosTable } from "@/lib/data/pos";
import { openTableAction } from "@/app/pos/actions";

type OpenTableDialogProps = {
  table: PosTable | null;
  onClose: () => void;
  branchId: string;
  userId: string;
};

export function OpenTableDialog({ table, onClose, branchId, userId }: OpenTableDialogProps) {
  const [guestCount, setGuestCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!table) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("tableId", table.id);
    formData.append("branchId", branchId);
    formData.append("userId", userId);
    formData.append("guestCount", guestCount.toString());

    const result = await openTableAction(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[32px] border border-ink/10 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Abrir Mesa {table.tableNumber}</h2>
          <button onClick={onClose} className="rounded-xl p-2 transition hover:bg-ink/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-ink/70">
              Numero de comensales
            </label>
            <div className="mt-3 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-ink/10 text-xl font-semibold transition hover:bg-ink/5"
              >
                -
              </button>
              <div className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-ink/10 py-3">
                <Users className="h-5 w-5 text-ink/40" />
                <span className="text-2xl font-semibold">{guestCount}</span>
              </div>
              <button
                type="button"
                onClick={() => setGuestCount(Math.min(20, guestCount + 1))}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-ink/10 text-xl font-semibold transition hover:bg-ink/5"
              >
                +
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-forest/5 p-4 text-sm">
            <p className="text-ink/60">
              <strong className="text-ink">Mesa {table.tableNumber}</strong> • {table.areaName}
            </p>
            {table.capacity && (
              <p className="mt-1 text-ink/50">Capacidad: {table.capacity} personas</p>
            )}
          </div>

          {error && (
            <div className="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember">
              {error}
            </div>
          )}

          <div className="flex gap-3">
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
              className="flex-1 rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-white transition hover:bg-forest/90 disabled:opacity-50"
            >
              {loading ? "Abriendo..." : "Abrir mesa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
