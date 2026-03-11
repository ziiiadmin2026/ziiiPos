"use client";

import { MapPin, Phone, Plus, Store } from "lucide-react";
import { useState } from "react";
import { BranchFormDialog } from "./branch-form-dialog";

type Branch = {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
  phone: string | null;
  is_active: boolean;
};

type BranchListProps = {
  branches: Branch[];
  organizationId: string;
};

export function BranchList({ branches, organizationId }: BranchListProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink/60">{branches.length} sedes configuradas</p>
          </div>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-cloud transition hover:bg-ember"
          >
            <Plus className="h-4 w-4" />
            Nueva sede
          </button>
        </div>

        {branches.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-ink/20 bg-white p-12 text-center">
            <Store className="mx-auto h-12 w-12 text-ink/20" />
            <h3 className="mt-4 text-lg font-semibold">Sin sedes configuradas</h3>
            <p className="mt-2 text-sm text-ink/60">
              Crea tu primera sede para empezar a operar. Cada sede maneja su inventario y personal de forma independiente.
            </p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="mt-6 rounded-2xl bg-ink px-6 py-3 text-sm font-semibold text-cloud transition hover:bg-ember"
            >
              Crear primera sede
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {branches.map((branch) => (
              <article
                key={branch.id}
                className="rounded-[28px] border border-ink/10 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest/10 text-forest">
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{branch.name}</h3>
                      {branch.code && (
                        <p className="text-xs uppercase tracking-widest text-ink/40">{branch.code}</p>
                      )}
                    </div>
                  </div>
                  {!branch.is_active && (
                    <span className="rounded-xl bg-ink/5 px-3 py-1 text-xs font-medium text-ink/50">
                      Inactiva
                    </span>
                  )}
                </div>

                {(branch.address || branch.phone) && (
                  <div className="mt-4 space-y-2 text-sm text-ink/60">
                    {branch.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{branch.address}</span>
                      </div>
                    )}
                    {branch.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>{branch.phone}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 flex gap-2">
                  <button
                    onClick={() => setEditingBranch(branch)}
                    className="flex-1 rounded-xl border border-ink/10 px-4 py-2 text-sm font-medium transition hover:bg-ink/5"
                  >
                    Editar
                  </button>
                  <button className="flex-1 rounded-xl border border-ink/10 px-4 py-2 text-sm font-medium transition hover:bg-ink/5">
                    Ver mesas
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <BranchFormDialog
        open={showCreateDialog || editingBranch !== null}
        onClose={() => {
          setShowCreateDialog(false);
          setEditingBranch(null);
        }}
        branch={editingBranch}
        organizationId={organizationId}
      />
    </>
  );
}
