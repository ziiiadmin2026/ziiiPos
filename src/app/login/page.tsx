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
    description: "Control general y reportes.",
    icon: BriefcaseBusiness
  },
  {
    title: "Servicio",
    description: "Mesas y salon.",
    icon: UsersRound
  },
  {
    title: "Caja",
    description: "Turno y cobros.",
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
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4efe7_0%,#ece3d6_100%)] text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1180px] items-center px-4 py-6 lg:px-6">
        <section className="w-full rounded-[32px] border border-stone-200/80 bg-[#fcfaf6] shadow-[0_24px_80px_rgba(58,42,24,0.08)]">
          <div className="flex flex-col gap-0 lg:grid lg:grid-cols-[0.88fr_1.12fr]">
            <div className="border-b border-stone-200 p-6 lg:border-b-0 lg:border-r lg:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#211d18] text-cloud">
                  <ChefHat className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-ink/42">Restaurant OS</p>
                  <h1 className="font-semibold">ZiiiPos</h1>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="mt-3 max-w-sm text-3xl font-semibold tracking-tight lg:text-4xl">
                  Entrar al sistema
                </h2>
              </div>

              <div className="mt-8 grid gap-3">
                {roleCards.map(({ title, description, icon: Icon }) => (
                  <article key={title} className="rounded-[22px] border border-stone-200 bg-white px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f0e4d2] text-[#835220]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink">{title}</h3>
                        <p className="mt-1 text-sm leading-6 text-ink/58">{description}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-8 rounded-[22px] bg-[#201c17] px-5 py-4 text-sm text-cloud/72">
                <div className="flex items-center justify-between gap-4">
                  <span className="uppercase tracking-[0.2em] text-cloud/45">Estado</span>
                  <span className="inline-flex items-center gap-2 font-semibold text-cloud">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Acceso seguro
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 lg:p-8">
              <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-3xl font-semibold tracking-tight">Entrar</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm sm:w-[240px]">
                  <div className="rounded-2xl border border-stone-200 bg-[#f5efe4] px-4 py-3">
                    <p className="text-ink/45">Canal</p>
                    <p className="mt-1 font-semibold text-ink">VM Local</p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-[#f5efe4] px-4 py-3">
                    <p className="text-ink/45">Modo</p>
                    <p className="mt-1 font-semibold text-ink">Operacion</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 max-w-[560px]">
                <LoginForm error={error} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}