import { AppShell } from "@/components/layout/app-shell";
import { requireAppAccess } from "@/lib/auth/permissions";
import Link from "next/link";
import { Building2, LayoutGrid, Users, FileUp } from "lucide-react";
import type { Route } from "next";

const moduleCards = [
  {
    href: "/backoffice/branches" as Route,
    title: "Sedes y locales",
    description: "Configura tus ubicaciones de operacion",
    icon: Building2,
    color: "bg-forest"
  },
  {
    href: "/backoffice/tables" as Route,
    title: "Gestion de mesas",
    description: "Organiza areas de servicio y distribucion",
    icon: LayoutGrid,
    color: "bg-ember"
  },
  {
    href: "/backoffice/users" as Route,
    title: "Usuarios y permisos",
    description: "Administra el equipo y roles",
    icon: Users,
    color: "bg-ink"
  },
  {
    href: "/backoffice/import" as Route,
    title: "Importar menu",
    description: "Carga productos desde archivo",
    icon: FileUp,
    color: "bg-amber-600"
  }
];

export default async function BackofficePage() {
  await requireAppAccess("backoffice");

  return (
    <AppShell
      module="backoffice"
      title="Backoffice"
      subtitle="Panel de administracion y configuracion del sistema. Gestiona sedes, usuarios, mesas y productos."
    >
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {moduleCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-[28px] border border-ink/10 bg-white p-8 shadow-sm transition hover:shadow-lg"
          >
            <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${card.color} text-white`}>
              <card.icon className="h-7 w-7" />
            </div>
            <h3 className="mt-6 text-2xl font-semibold group-hover:text-forest">{card.title}</h3>
            <p className="mt-2 text-sm text-ink/60">{card.description}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
