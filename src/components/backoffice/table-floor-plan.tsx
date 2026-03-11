"use client";

import { LayoutGrid, Map, Plus } from "lucide-react";
import { useState } from "react";
import { TableCard } from "./table-card";
import { TableFormDialog } from "./table-form-dialog";
import { AreaFormDialog } from "./area-form-dialog";
import { FloorPlanCanvas } from "./floor-plan-canvas";

type ServiceArea = {
  id: string;
  name: string;
  sort_order: number;
};

type Table = {
  id: string;
  table_number: string;
  capacity: number | null;
  status: "available" | "occupied" | "reserved" | "disabled";
  is_active: boolean;
  service_area_id: string | null;
  pos_x: number | null;
  pos_y: number | null;
  width: number | null;
  height: number | null;
  rotation: number | null;
  shape: string | null;
};

type TableFloorPlanProps = {
  branchId: string;
  areas: ServiceArea[];
  tables: Table[];
};

export function TableFloorPlan({ branchId, areas, tables }: TableFloorPlanProps) {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [showTableForm, setShowTableForm] = useState(false);
  const [showAreaForm, setShowAreaForm] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "map">("map");

  const filteredTables = selectedArea
    ? tables.filter((t) => t.service_area_id === selectedArea)
    : tables;

  return (
    <>
      <div className="space-y-6">
        {/* View mode toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-white p-1">
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                viewMode === "map"
                  ? "bg-forest text-white"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              <Map className="h-4 w-4" />
              Mapa visual
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                viewMode === "grid"
                  ? "bg-forest text-white"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Lista
            </button>
          </div>

          <button
            onClick={() => setShowTableForm(true)}
            className="flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-cloud transition hover:bg-ember"
          >
            <Plus className="h-4 w-4" />
            Nueva mesa
          </button>
        </div>

        {/* Areas selector */}
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedArea(null)}
            className={`shrink-0 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
              selectedArea === null
                ? "bg-ink text-cloud"
                : "border border-ink/10 bg-white text-ink/70 hover:bg-ink/5"
            }`}
          >
            Todas las areas
          </button>
          {areas.map((area) => (
            <button
              key={area.id}
              onClick={() => setSelectedArea(area.id === selectedArea ? null : area.id)}
              className={`shrink-0 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                area.id === selectedArea
                  ? "bg-forest text-white"
                  : "border border-ink/10 bg-white text-ink/70 hover:bg-ink/5"
              }`}
            >
              {area.name}
            </button>
          ))}
          <button
            onClick={() => setShowAreaForm(true)}
            className="shrink-0 rounded-2xl border border-dashed border-ink/20 px-5 py-3 text-sm font-medium text-ink/50 transition hover:border-ink/40 hover:text-ink"
          >
            + Nueva area
          </button>
        </div>

        {/* Content: Map or Grid */}
        {viewMode === "map" ? (
          <FloorPlanCanvas
            tables={filteredTables}
            areas={areas}
            branchId={branchId}
            onEditTable={setEditingTable}
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink/60">
                  {filteredTables.length} {filteredTables.length === 1 ? "mesa" : "mesas"}
                </p>
              </div>
            </div>

            {filteredTables.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-ink/20 bg-white p-12 text-center">
                <LayoutGrid className="mx-auto h-12 w-12 text-ink/20" />
                <h3 className="mt-4 text-lg font-semibold">Sin mesas configuradas</h3>
                <p className="mt-2 text-sm text-ink/60">
                  {selectedArea
                    ? "Esta area no tiene mesas asignadas. Crea tu primera mesa."
                    : "Crea tus primeras mesas para empezar a operar el salon."}
                </p>
                <button
                  onClick={() => setShowTableForm(true)}
                  className="mt-6 rounded-2xl bg-ink px-6 py-3 text-sm font-semibold text-cloud transition hover:bg-ember"
                >
                  Crear mesa
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredTables.map((table) => {
                  const areaName = areas.find((a) => a.id === table.service_area_id)?.name ?? "Sin area";
                  return (
                    <TableCard
                      key={table.id}
                      table={table}
                      areaName={areaName}
                      onEdit={() => setEditingTable(table)}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <TableFormDialog
        open={showTableForm || editingTable !== null}
        onClose={() => {
          setShowTableForm(false);
          setEditingTable(null);
        }}
        table={editingTable}
        branchId={branchId}
        areas={areas}
      />

      <AreaFormDialog
        open={showAreaForm}
        onClose={() => setShowAreaForm(false)}
        branchId={branchId}
      />
    </>
  );
}
