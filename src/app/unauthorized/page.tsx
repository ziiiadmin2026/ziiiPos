import Link from "next/link";
import { LockKeyhole, MoveLeft } from "lucide-react";

type UnauthorizedPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const messages: Record<string, string> = {
  perfil: "Tu sesion existe, pero no tiene un perfil operativo activo en ZiiiPos.",
  dashboard: "Tu rol actual no tiene acceso al dashboard operativo.",
  pos: "Tu rol actual no tiene acceso al modulo POS.",
  backoffice: "Tu rol actual no tiene acceso al backoffice."
};

export default async function UnauthorizedPage({ searchParams }: UnauthorizedPageProps) {
  const resolvedParams = (searchParams ?? Promise.resolve({})) as Promise<Record<string, string | string[] | undefined>>;
  const params = await resolvedParams;
  const reasonParam = params.reason;
  const reason = Array.isArray(reasonParam) ? reasonParam[0] : reasonParam;

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas bg-grain px-4 py-8 text-ink">
      <div className="w-full max-w-xl rounded-[34px] border border-white/60 bg-cloud/85 p-8 shadow-panel backdrop-blur">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-ink text-cloud">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <p className="mt-6 text-xs uppercase tracking-[0.28em] text-ink/45">Acceso restringido</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">No tienes permisos para continuar.</h1>
        <p className="mt-4 text-base leading-7 text-ink/65">
          {messages[reason ?? ""] ?? "Tu usuario no tiene permisos suficientes para este modulo de ZiiiPos."}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-ink px-5 text-sm font-semibold text-cloud"
          >
            Volver al login
          </Link>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-white px-5 text-sm font-semibold text-ink"
          >
            <MoveLeft className="h-4 w-4" />
            Intentar inicio
          </Link>
        </div>
      </div>
    </main>
  );
}