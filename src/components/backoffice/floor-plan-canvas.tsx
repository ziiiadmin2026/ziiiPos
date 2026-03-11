"use client";

import { useRef, useState, useEffect } from "react";
import { Move, ZoomIn, ZoomOut } from "lucide-react";
import { updateTablePositionAction } from "@/app/backoffice/tables/actions";

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

type ServiceArea = {
  id: string;
  name: string;
};

type FloorPlanCanvasProps = {
  tables: Table[];
  areas: ServiceArea[];
  branchId: string;
  onEditTable: (table: Table) => void;
};

const STATUS_COLORS = {
  available: "#16a34a",
  occupied: "#dc2626",
  reserved: "#d97706",
  disabled: "#6b7280"
};

export function FloorPlanCanvas({ tables, areas, branchId, onEditTable }: FloorPlanCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedTable, setDraggedTable] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const handleTableMouseDown = (e: React.MouseEvent, tableId: string, table: Table) => {
    if (e.button !== 0) return; // Solo click izquierdo
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDraggedTable(tableId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedTable && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.round((e.clientX - rect.left - dragOffset.x) / zoom);
      const y = Math.round((e.clientY - rect.top - dragOffset.y) / zoom);

      // Update position visually (optimistic)
      const tableElement = document.getElementById(`table-${draggedTable}`);
      if (tableElement) {
        tableElement.style.left = `${x}px`;
        tableElement.style.top = `${y}px`;
      }
    }

    if (isPanning && canvasRef.current) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setPanOffset({
        x: panOffset.x + dx,
        y: panOffset.y + dy
      });
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = async (e: React.MouseEvent) => {
    if (draggedTable && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.round((e.clientX - rect.left - dragOffset.x) / zoom);
      const y = Math.round((e.clientY - rect.top - dragOffset.y) / zoom);

      // Save to database
      const formData = new FormData();
      formData.append("tableId", draggedTable);
      formData.append("pos_x", x.toString());
      formData.append("pos_y", y.toString());
      
      await updateTablePositionAction(formData);
      
      setDraggedTable(null);
    }

    if (isPanning) {
      setIsPanning(false);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      // Middle click or Ctrl+Click para pan
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleTableDoubleClick = (table: Table) => {
    onEditTable(table);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white p-4">
        <div className="flex items-center gap-3">
          <Move className="h-5 w-5 text-ink/40" />
          <span className="text-sm text-ink/60">
            Arrastra las mesas para posicionarlas. Doble clic para editar.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink/10 transition hover:bg-ink/5"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="w-16 text-center text-sm font-medium">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink/10 transition hover:bg-ink/5"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="overflow-hidden rounded-[28px] border border-ink/10 bg-white">
        <div
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="relative h-[800px] cursor-default bg-[url('/grid-pattern.svg')] bg-repeat"
          style={{
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            cursor: isPanning ? "grabbing" : "default"
          }}
        >
          <div
            style={{
              transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
              transformOrigin: "0 0"
            }}
          >
            {tables.map((table) => {
              const x = table.pos_x ?? 50;
              const y = table.pos_y ?? 50;
              const width = table.width ?? 80;
              const height = table.height ?? 80;
              const shape = table.shape ?? "square";
              const color = STATUS_COLORS[table.status];
              const areaName = areas.find((a) => a.id === table.service_area_id)?.name;

              return (
                <div
                  key={table.id}
                  id={`table-${table.id}`}
                  onMouseDown={(e) => handleTableMouseDown(e, table.id, table)}
                  onDoubleClick={() => handleTableDoubleClick(table)}
                  className="absolute cursor-move select-none transition-shadow hover:shadow-lg"
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                    transform: `rotate(${table.rotation ?? 0}deg)`
                  }}
                >
                  <div
                    className="flex h-full w-full flex-col items-center justify-center border-2 text-white shadow-lg"
                    style={{
                      backgroundColor: color,
                      borderColor: "rgba(255,255,255,0.3)",
                      borderRadius: shape === "round" ? "50%" : "12px"
                    }}
                  >
                    <span className="text-2xl font-bold">{table.table_number}</span>
                    {table.capacity && (
                      <span className="text-xs opacity-80">{table.capacity}p</span>
                    )}
                    {areaName && (
                      <span className="mt-1 text-[10px] uppercase opacity-70">{areaName}</span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Drop zone for new tables */}
            {tables.length === 0 && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="rounded-2xl bg-white/90 p-8 shadow-lg">
                  <p className="text-lg font-semibold text-ink">Área de trabajo vacía</p>
                  <p className="mt-2 text-sm text-ink/60">
                    Crea mesas y arrástralas aquí para diseñar tu layout
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 rounded-2xl border border-ink/10 bg-white p-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded" style={{ backgroundColor: STATUS_COLORS.available }}></div>
          <span className="text-sm text-ink/70">Libre</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded" style={{ backgroundColor: STATUS_COLORS.occupied }}></div>
          <span className="text-sm text-ink/70">Ocupada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded" style={{ backgroundColor: STATUS_COLORS.reserved }}></div>
          <span className="text-sm text-ink/70">Reservada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded" style={{ backgroundColor: STATUS_COLORS.disabled }}></div>
          <span className="text-sm text-ink/70">Deshabilitada</span>
        </div>
      </div>
    </div>
  );
}
