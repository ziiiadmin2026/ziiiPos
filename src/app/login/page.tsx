import { ChefHat, ShieldCheck, TabletSmartphone, Wifi } from "lucide-react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { createClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const featureCards = [
  {
    title: "Diseno tactil",
    description: "Controles amplios y lectura clara para tablets en piso, barra y caja.",
    icon: TabletSmartphone
  },
  {
    title: "Acceso seguro",
    description: "Sesion centralizada en Supabase con base lista para perfiles y permisos.",
    icon: ShieldCheck
  },
  {
    title: "Operacion conectada",
    description: "La VM local ya expone app, auth y Studio sobre la red del negocio.",
    icon: Wifi
  }
];

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const [{ data: { user } }, resolvedParams] = await Promise.all([
    supabase.auth.getUser(),
    (searchParams ?? Promise.resolve({})) as Promise<Record<string, string | string[] | undefined>>
  ]);

  if (user) {
    redirect("/");
  }

  const errorParam = resolvedParams.error;
  const error = Array.isArray(errorParam) ? errorParam[0] : errorParam;

  return (
    <main className="min-h-screen bg-canvas bg-grain text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-6 px-4 py-4 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:px-6">
        <section className="relative overflow-hidden rounded-[34px] border border-white/60 bg-ink px-6 py-8 text-cloud shadow-panel lg:px-10 lg:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(138,176,142,0.18),transparent_30%)]" />
          <div className="relative flex h-full flex-col">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cloud text-ink">
                <ChefHat className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cloud/55">Restaurant OS</p>
                <h1 className="font-semibold">ZiiiPos</h1>
              </div>
            </div>

            <div className="mt-12 max-w-xl lg:mt-16">
              <p className="text-xs uppercase tracking-[0.32em] text-cloud/55">Produccion local</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight lg:text-6xl">Login operativo listo para tablet e iPad.</h2>
              <p className="mt-5 max-w-lg text-base text-cloud/72 lg:text-lg">
                La infraestructura ya vive en la VM. Ahora el acceso del equipo entra por una interfaz limpia, rapida y preparada para sesiones reales.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3 lg:mt-auto lg:grid-cols-1 xl:grid-cols-3">
              {featureCards.map(({ title, description, icon: Icon }) => (
                <article key={title} className="rounded-[26px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cloud/10 text-cloud">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-cloud/68">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center rounded-[34px] border border-white/60 bg-cloud/85 p-4 shadow-panel backdrop-blur lg:p-8">
          <div className="w-full max-w-[560px] rounded-[30px] border border-ink/10 bg-white/88 p-6 shadow-sm lg:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Control de acceso</p>
                <h3 className="mt-2 text-3xl font-semibold tracking-tight">Iniciar sesion</h3>
              </div>
              <div className="rounded-2xl border border-ink/10 bg-canvas/80 px-4 py-3 text-right text-sm">
                <p className="text-ink/45">Canal</p>
                <p className="mt-1 font-semibold">VM Local</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-ink/65 lg:text-base">
              Usa una cuenta creada en Supabase Auth. Este acceso servira como base para permisos por rol, sesiones de caja y trazabilidad operativa.
            </p>

            <div className="mt-8">
              <LoginForm error={error} />
            </div>

            <div className="mt-8 grid gap-3 rounded-[24px] bg-canvas/70 p-4 text-sm text-ink/60 md:grid-cols-2">
              <div>
                <p className="font-semibold text-ink">Ideal para piso y caja</p>
                <p className="mt-1">Tap targets amplios y lectura estable en 10 a 13 pulgadas.</p>
              </div>
              <div>
                <p className="font-semibold text-ink">Siguiente capa natural</p>
                <p className="mt-1">Roles, apertura de turno, usuarios reales y permisos por modulo.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}