import { BriefcaseBusiness, ChefHat, ShieldCheck, UsersRound, WalletCards } from "lucide-react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { createClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const roleCards = [
  {
    title: "Gerencia",
    description: "Ventas, usuarios, caja y seguimiento general desde una sola vista.",
    icon: BriefcaseBusiness
  },
  {
    title: "Capitanes y meseros",
    description: "Acceso rapido para piso, mesas, servicio y cobro sin pasos innecesarios.",
    icon: UsersRound
  },
  {
    title: "Caja",
    description: "Interfaz directa para apertura, cierre y control operativo del turno.",
    icon: WalletCards
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
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6f1e8_0%,#efe7da_100%)] text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1480px] flex-col gap-5 px-4 py-4 lg:grid lg:grid-cols-[0.92fr_1.08fr] lg:px-6">
        <section className="rounded-[32px] border border-stone-200/80 bg-[#f8f4ec] p-6 shadow-[0_18px_60px_rgba(67,56,39,0.08)] lg:p-8">
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-cloud">
                <ChefHat className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Acceso operativo</p>
                <h1 className="font-semibold">ZiiiPos</h1>
              </div>
            </div>

            <div className="mt-10 rounded-[28px] bg-[#1f1b16] px-6 py-7 text-cloud">
              <p className="text-xs uppercase tracking-[0.3em] text-cloud/55">Login</p>
              <h2 className="mt-3 max-w-md text-3xl font-semibold tracking-tight lg:text-5xl">
                Entrada simple para una operacion que no puede perder tiempo.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-cloud/70 lg:text-base">
                Disenado para gerencia, capitanes, meseros y caja. Menos adorno, mas velocidad, lectura clara y acceso inmediato.
              </p>
            </div>

            <div className="mt-5 grid gap-3">
              {roleCards.map(({ title, description, icon: Icon }) => (
                <article key={title} className="flex items-start gap-4 rounded-[24px] border border-stone-200 bg-white px-5 py-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#efe5d5] text-[#7a4c17]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-ink">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-ink/60">{description}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-5 grid gap-3 rounded-[24px] border border-stone-200 bg-white px-5 py-4 text-sm text-ink/65 md:grid-cols-2 lg:mt-auto">
              <div>
                <p className="font-semibold text-ink">Seguridad activa</p>
                <p className="mt-1">Sesion centralizada con Supabase y base lista para permisos por rol.</p>
              </div>
              <div>
                <p className="font-semibold text-ink">Listo para tablets</p>
                <p className="mt-1">Campos amplios, contraste alto y recorrido corto para entrar rapido.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center rounded-[32px] border border-stone-200/80 bg-white/82 p-4 shadow-[0_18px_60px_rgba(67,56,39,0.08)] backdrop-blur lg:p-8">
          <div className="w-full max-w-[620px] rounded-[30px] border border-stone-200 bg-[#fffdfa] p-6 lg:p-8">
            <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Control de acceso</p>
                <h3 className="mt-2 text-3xl font-semibold tracking-tight">Entrar al sistema</h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-ink/62 lg:text-base">
                  Usa tu cuenta de trabajo para abrir tu vista segun el rol. Sin panel promocional, sin pasos extra y sin ruido visual.
                </p>
              </div>
              <div className="grid shrink-0 grid-cols-2 gap-3 text-sm lg:w-[220px] lg:grid-cols-1">
                <div className="rounded-2xl border border-stone-200 bg-[#f6f1e8] px-4 py-3">
                  <p className="text-ink/45">Canal</p>
                  <p className="mt-1 font-semibold text-ink">VM Local</p>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-[#f6f1e8] px-4 py-3">
                  <p className="text-ink/45">Acceso</p>
                  <div className="mt-1 flex items-center gap-2 font-semibold text-ink">
                    <ShieldCheck className="h-4 w-4 text-emerald-700" />
                    <span>Seguro</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-stone-200 bg-[#f7f3eb] px-5 py-4 text-sm text-ink/62">
              <p className="font-semibold text-ink">Pensado para el equipo</p>
              <p className="mt-1 leading-6">
                Gerencia entra a control, capitanes a operacion, meseros a servicio y caja a turno. El sistema decide la ruta segun permisos.
              </p>
            </div>

            <div className="mt-6">
              <LoginForm error={error} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}