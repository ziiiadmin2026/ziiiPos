import type { Route } from "next";
import Link from "next/link";
import { ChartNoAxesCombined, ChefHat, LayoutDashboard, WalletCards } from "lucide-react";
import { logoutAction } from "@/app/login/actions";
import { canAccessModule, type AppModule, requireAppAccess } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
  { href: "/pos", label: "POS", icon: WalletCards, module: "pos" },
  { href: "/backoffice", label: "Backoffice", icon: ChartNoAxesCombined, module: "backoffice" }
] satisfies Array<{ href: Route; label: string; icon: typeof LayoutDashboard; module: AppModule }>;

type AppShellProps = {
  title: string;
  subtitle: string;
  module: AppModule;
  children: React.ReactNode;
};

export async function AppShell({ title, subtitle, module, children }: AppShellProps) {
  const { authUser, appUser } = await requireAppAccess(module);
  const displayName = appUser.full_name || authUser.user_metadata.full_name || authUser.email || "Operacion";
  const visibleNavItems = navItems.filter((item) => canAccessModule(appUser.role, item.module as AppModule));

  return (
    <div className="min-h-screen bg-canvas bg-grain text-ink">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[260px_1fr] lg:px-6">
        <aside className="rounded-[32px] border border-white/60 bg-cloud/85 p-6 shadow-panel backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-cloud">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-ink/55">Restaurant OS</p>
              <h1 className="font-semibold">ZiiiPos</h1>
            </div>
          </div>

          <nav className="mt-10 space-y-3">
            {visibleNavItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-ink/72 transition",
                  "hover:bg-white hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-10 rounded-[28px] border border-ink/10 bg-white/80 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Sesion activa</p>
            <p className="mt-3 text-lg font-semibold">{displayName}</p>
            <p className="mt-1 break-all text-sm text-ink/55">{authUser.email}</p>
            <p className="mt-3 inline-flex rounded-full bg-canvas px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
              {appUser.role}
            </p>
            <form action={logoutAction} className="mt-5">
              <button className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-ink/10 bg-canvas px-4 text-sm font-medium transition hover:border-ink/20 hover:bg-white">
                Cerrar sesion
              </button>
            </form>
          </div>

          <div className="mt-10 rounded-[28px] bg-ink p-5 text-cloud">
            <p className="text-xs uppercase tracking-[0.28em] text-cloud/60">Turno actual</p>
            <p className="mt-3 text-3xl font-semibold">Caja abierta</p>
            <p className="mt-2 text-sm text-cloud/70">Cajero: Andrea Soto</p>
            <div className="mt-6 rounded-2xl bg-cloud/10 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span>Fondo inicial</span>
                <span>$2,000</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Ventas</span>
                <span>$18,420</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="rounded-[36px] border border-white/60 bg-cloud/75 p-5 shadow-panel backdrop-blur lg:p-8">
          <header className="flex flex-col gap-4 border-b border-ink/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Control operativo</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight lg:text-4xl">{title}</h2>
              <p className="mt-2 max-w-2xl text-sm text-ink/65 lg:text-base">{subtitle}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm lg:grid-cols-3">
              <div className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3">
                <p className="text-ink/50">Sucursal</p>
                <p className="mt-1 font-semibold">Polanco</p>
              </div>
              <div className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3">
                <p className="text-ink/50">Servicio</p>
                <p className="mt-1 font-semibold">Cena</p>
              </div>
              <div className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3">
                <p className="text-ink/50">Mesas activas</p>
                <p className="mt-1 font-semibold">14</p>
              </div>
            </div>
          </header>

          <section className="mt-6">{children}</section>
        </main>
      </div>
    </div>
  );
}