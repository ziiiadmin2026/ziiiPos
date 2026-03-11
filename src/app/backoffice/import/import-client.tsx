"use client";

import { useRef, useState } from "react";
import type { ImportPreview, ImportResult, ParsedProduct } from "@/app/api/import/menu/route";
import { useCurrency } from "@/components/providers/regional-provider";

type Step = "upload" | "preview" | "done";

export default function ImportClient() {
  const fmt = useCurrency();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Selecciona un archivo antes de continuar.");
      return;
    }
    setCurrentFile(file);
    setError(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("action", "preview");

      const res = await fetch("/api/import/menu", { method: "POST", body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Error ${res.status}`);
      }
      const data: ImportPreview = await res.json();
      setPreview(data);
      setStep("preview");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al leer el archivo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    if (!currentFile || !preview) return;
    setError(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("file", currentFile);
      fd.append("action", "import");

      const res = await fetch("/api/import/menu", { method: "POST", body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Error ${res.status}`);
      }
      const data: ImportResult = await res.json();
      setResult(data);
      setStep("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error durante la importación.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setStep("upload");
    setPreview(null);
    setResult(null);
    setCurrentFile(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  // Group products by category for preview table
  const grouped = preview
    ? preview.categories.map((cat) => ({
        category: cat,
        products: preview.products.filter((p: ParsedProduct) => p.category === cat)
      }))
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Stepper */}
      <div className="flex items-center gap-2 text-sm font-medium">
        {(["upload", "preview", "done"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <span className="text-gray-400">›</span>}
            <span
              className={
                step === s
                  ? "text-amber-600 font-semibold"
                  : i < (["upload", "preview", "done"] as Step[]).indexOf(step)
                  ? "text-green-600"
                  : "text-gray-400"
              }
            >
              {s === "upload" ? "1. Cargar archivo" : s === "preview" ? "2. Vista previa" : "3. Resultado"}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Seleccionar archivo de menú</h2>
          <p className="text-sm text-gray-500">
            Formatos admitidos: <strong>.xlsx</strong>, <strong>.xls</strong>, <strong>.csv</strong> — Columnas
            requeridas: <em>Categoría, Producto, Precio</em>.
          </p>

          <div className="flex items-center gap-4">
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-amber-700 hover:file:bg-amber-100"
            />
            <button
              onClick={handleUpload}
              disabled={loading}
              className="shrink-0 rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
            >
              {loading ? "Leyendo…" : "Cargar y previsualizar"}
            </button>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>}
        </div>
      )}

      {/* Step 2: Preview */}
      {step === "preview" && preview && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Vista previa del menú</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Se encontraron <strong>{preview.products.length}</strong> productos en{" "}
                  <strong>{preview.categories.length}</strong> categorías.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Cambiar archivo
              </button>
            </div>

            {preview.errors.length > 0 && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800 space-y-1">
                <p className="font-semibold">Advertencias ({preview.errors.length}):</p>
                {preview.errors.map((e, i) => (
                  <p key={i}>• {e}</p>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Categoría
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Descripción
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Precio
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Tipo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {grouped.map(({ category, products }) =>
                  products.map((p, pi) => (
                    <tr key={`${category}-${pi}`} className="hover:bg-gray-50">
                      {pi === 0 && (
                        <td
                          rowSpan={products.length}
                          className="px-4 py-2 font-semibold text-gray-700 align-top border-r border-gray-100 bg-gray-50/60"
                        >
                          {category}
                          <span className="ml-2 text-xs font-normal text-gray-400">
                            ({products.length})
                          </span>
                        </td>
                      )}
                      <td className="px-4 py-2 text-gray-800">{p.name}</td>
                      <td className="px-4 py-2 text-gray-500 max-w-xs truncate">{p.description || "—"}</td>
                      <td className="px-4 py-2 text-right font-medium text-gray-800">
                        {fmt(p.price)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            p.productType === "drink"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {p.productType === "drink" ? "Bebida" : "Platillo"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleReset}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={loading}
              className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
            >
              {loading ? "Importando…" : `Confirmar importación (${preview.products.length} productos)`}
            </button>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>}
        </div>
      )}

      {/* Step 3: Done */}
      {step === "done" && result && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Importación completada</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">{result.categoriesCreated}</p>
              <p className="text-sm text-gray-500 mt-1">Categorías nuevas</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">{result.productsUpserted}</p>
              <p className="text-sm text-gray-500 mt-1">Productos importados</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800 space-y-1">
              <p className="font-semibold">Advertencias ({result.errors.length}):</p>
              {result.errors.map((e, i) => (
                <p key={i}>• {e}</p>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600"
            >
              Importar otro archivo
            </button>
            <a
              href="/pos"
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 inline-flex items-center"
            >
              Ver POS →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
