"use client";

import { Palette, Upload, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { updateBrandingAction } from "@/app/backoffice/branding/actions";

type Organization = {
  id: string;
  name: string;
  brand_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
};

type BrandingFormProps = {
  organization: Organization;
};

export function BrandingForm({ organization }: BrandingFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    formData.append("organizationId", organization.id);

    const result = await updateBrandingAction(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
      {/* Main form */}
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-[28px] border border-ink/10 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/10 text-forest">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Logo del negocio</h3>
                <p className="text-sm text-ink/60">Tu marca en todo el sistema</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink/70">
                  Nombre de marca (opcional)
                </label>
                <input
                  type="text"
                  name="brand_name"
                  defaultValue={organization.brand_name ?? ""}
                  className="mt-1 w-full rounded-xl border border-ink/10 px-4 py-3 transition focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                  placeholder={organization.name}
                />
                <p className="mt-1 text-xs text-ink/50">
                  Si lo dejas vacio, se usa el nombre legal de la organizacion
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink/70">
                  URL del logo
                </label>
                <div className="mt-1 flex gap-3">
                  <input
                    type="text"
                    name="logo_url"
                    defaultValue={organization.logo_url ?? ""}
                    className="flex-1 rounded-xl border border-ink/10 px-4 py-3 transition focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                    placeholder="https://ejemplo.com/logo.png"
                  />
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl border border-ink/10 px-4 py-3 text-sm font-medium transition hover:bg-ink/5"
                  >
                    <Upload className="h-4 w-4" />
                    Subir
                  </button>
                </div>
                <p className="mt-1 text-xs text-ink/50">
                  Formato PNG o SVG, fondo transparente recomendado
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-ink/10 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ember/10 text-ember">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Colores de marca</h3>
                <p className="text-sm text-ink/60">Personaliza los tonos del sistema</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-ink/70">
                  Color primario
                </label>
                <div className="mt-1 flex gap-3">
                  <input
                    type="color"
                    name="primary_color"
                    defaultValue={organization.primary_color ?? "#1c1917"}
                    className="h-12 w-16 rounded-xl border border-ink/10 cursor-pointer"
                  />
                  <input
                    type="text"
                    defaultValue={organization.primary_color ?? "#1c1917"}
                    readOnly
                    className="flex-1 rounded-xl border border-ink/10 px-4 py-3 text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-ink/50">Base del sistema (botones, headers)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink/70">
                  Color secundario
                </label>
                <div className="mt-1 flex gap-3">
                  <input
                    type="color"
                    name="secondary_color"
                    defaultValue={organization.secondary_color ?? "#16a34a"}
                    className="h-12 w-16 rounded-xl border border-ink/10 cursor-pointer"
                  />
                  <input
                    type="text"
                    defaultValue={organization.secondary_color ?? "#16a34a"}
                    readOnly
                    className="flex-1 rounded-xl border border-ink/10 px-4 py-3 text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-ink/50">Acentos y destacados</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-forest/10 px-4 py-3 text-sm text-forest">
              Configuracion guardada correctamente
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-cloud transition hover:bg-ember disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar configuracion"}
            </button>
          </div>
        </form>
      </div>

      {/* Preview */}
      <div className="space-y-6">
        <div className="rounded-[28px] border border-ink/10 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Vista previa</p>
          <h3 className="mt-2 text-lg font-semibold">Como se vera tu marca</h3>

          <div className="mt-6 space-y-4">
            {/* Logo preview */}
            <div className="rounded-xl border border-ink/10 bg-canvas/50 p-6">
              {organization.logo_url ? (
                <img
                  src={organization.logo_url}
                  alt="Logo"
                  className="h-16 w-auto object-contain"
                />
              ) : (
                <div className="flex h-16 items-center justify-center text-sm text-ink/40">
                  Sin logo configurado
                </div>
              )}
              <p className="mt-3 text-center font-semibold">
                {organization.brand_name || organization.name}
              </p>
            </div>

            {/* Color preview */}
            <div className="space-y-2">
              <div
                className="rounded-xl p-4 text-white"
                style={{ backgroundColor: organization.primary_color ?? "#1c1917" }}
              >
                <p className="text-sm font-semibold">Color primario</p>
                <p className="text-xs opacity-80">Botones y elementos principales</p>
              </div>
              <div
                className="rounded-xl p-4 text-white"
                style={{ backgroundColor: organization.secondary_color ?? "#16a34a" }}
              >
                <p className="text-sm font-semibold">Color secundario</p>
                <p className="text-xs opacity-80">Acentos y destacados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Powered by */}
        <div className="rounded-[28px] border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white font-bold text-lg">
              Z
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-amber-900/60">Powered by</p>
              <p className="font-bold text-amber-900">ZIII Solutions</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-amber-900/70">
            Tu logo y marca en el sistema, respaldado por la tecnologia de ZIII Solutions. 
            En reportes e impresiones siempre aparece el respaldo.
          </p>
        </div>
      </div>
    </div>
  );
}
