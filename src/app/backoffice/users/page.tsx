import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRoles, type AppRole } from "@/lib/auth/permissions";
import { createManagedUserAction, updateManagedUserAction } from "@/app/backoffice/users/actions";

type UsersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const roleOptions: Array<{ value: AppRole; label: string }> = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "cashier", label: "Cashier" },
  { value: "waiter", label: "Waiter" },
  { value: "kitchen", label: "Kitchen" },
  { value: "inventory", label: "Inventory" }
];

type BranchRecord = {
  id: string;
  name: string;
  code: string | null;
};

type ManagedUserRecord = {
  id: string;
  auth_user_id: string | null;
  full_name: string;
  email: string | null;
  role: AppRole;
  is_active: boolean;
  branch_id: string | null;
  branches: BranchRecord | null;
};

type RawManagedUserRecord = Omit<ManagedUserRecord, "branches"> & {
  branches: BranchRecord[] | BranchRecord | null;
};

function selectClassName() {
  return "h-11 w-full rounded-2xl border border-ink/10 bg-white px-3 text-sm outline-none focus:border-ink/30 focus:ring-2 focus:ring-ink/10";
}

function inputClassName() {
  return "h-11 w-full rounded-2xl border border-ink/10 bg-white px-3 text-sm outline-none placeholder:text-ink/35 focus:border-ink/30 focus:ring-2 focus:ring-ink/10";
}

export default async function UsersManagementPage({ searchParams }: UsersPageProps) {
  const { appUser } = await requireRoles(["admin"]);
  const admin = createAdminClient();
  const resolvedParams = await ((searchParams ?? Promise.resolve({})) as Promise<Record<string, string | string[] | undefined>>);
  const errorParam = resolvedParams.error;
  const successParam = resolvedParams.success;
  const error = Array.isArray(errorParam) ? errorParam[0] : errorParam;
  const success = Array.isArray(successParam) ? successParam[0] : successParam;

  const [{ data: branches, error: branchesError }, { data: users, error: usersError }] = await Promise.all([
    admin
      .from("branches")
      .select("id, name, code")
      .eq("organization_id", appUser.organization_id)
      .order("name"),
    admin
      .from("app_users")
      .select("id, auth_user_id, full_name, email, role, is_active, branch_id, branches(id, name, code)")
      .eq("organization_id", appUser.organization_id)
      .order("created_at", { ascending: true })
  ]);

  if (branchesError) {
    throw branchesError;
  }

  if (usersError) {
    throw usersError;
  }

  const normalizedUsers: ManagedUserRecord[] = ((users ?? []) as RawManagedUserRecord[]).map((user) => ({
    ...user,
    branches: Array.isArray(user.branches) ? (user.branches[0] ?? null) : user.branches
  }));

  return (
    <AppShell
      module="backoffice"
      title="Gestion de usuarios"
      subtitle="Altas, cambios, activacion, roles y sucursales para el equipo operativo conectado a Supabase Auth."
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-3 rounded-[28px] border border-ink/10 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Control de acceso</p>
            <h3 className="mt-2 text-2xl font-semibold">Usuarios del sistema</h3>
            <p className="mt-2 text-sm text-ink/60">Solo un admin puede administrar usuarios, roles y acceso por sucursal.</p>
          </div>
          <Link href="/backoffice" className="inline-flex h-11 items-center justify-center rounded-2xl border border-ink/10 px-4 text-sm font-medium">
            Volver al backoffice
          </Link>
        </div>

        {error ? <div className="rounded-[24px] border border-ember/20 bg-orange-50 px-4 py-3 text-sm text-ember">{error}</div> : null}
        {success ? <div className="rounded-[24px] border border-forest/20 bg-emerald-50 px-4 py-3 text-sm text-forest">{success}</div> : null}

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[32px] border border-ink/10 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Alta de usuario</p>
            <h3 className="mt-2 text-2xl font-semibold">Crear nuevo usuario</h3>
            <form action={createManagedUserAction} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-ink/75">Nombre completo</label>
                <input name="full_name" className={inputClassName()} placeholder="Johnattan Osorio E." required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-ink/75">Correo</label>
                <input name="email" type="email" className={inputClassName()} placeholder="usuario@ziii.com.mx" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-ink/75">Contrasena inicial</label>
                <input name="password" type="password" className={inputClassName()} placeholder="Temporal segura" required />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-ink/75">Rol</label>
                  <select name="role" className={selectClassName()} defaultValue="cashier">
                    {roleOptions.map((role) => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-ink/75">Sucursal</label>
                  <select name="branch_id" className={selectClassName()} defaultValue="">
                    <option value="">Sin sucursal</option>
                    {(branches as BranchRecord[] | null)?.map((branch) => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-ink px-5 text-sm font-semibold text-cloud">
                Crear usuario
              </button>
            </form>
          </article>

          <article className="rounded-[32px] border border-ink/10 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Directorio operativo</p>
            <h3 className="mt-2 text-2xl font-semibold">Usuarios existentes</h3>
            <div className="mt-6 space-y-4">
              {normalizedUsers.map((user) => (
                <form key={user.id} action={updateManagedUserAction} className="rounded-[28px] border border-ink/10 bg-canvas/55 p-4">
                  <input type="hidden" name="app_user_id" value={user.id} />
                  <input type="hidden" name="auth_user_id" value={user.auth_user_id ?? ""} />
                  <div className="grid gap-4 lg:grid-cols-[1.2fr_1.1fr_0.9fr]">
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-ink/45">Nombre</label>
                      <input name="full_name" defaultValue={user.full_name} className={inputClassName()} required />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-ink/45">Correo</label>
                      <input name="email" type="email" defaultValue={user.email ?? ""} className={inputClassName()} required />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-ink/45">Rol</label>
                      <select name="role" defaultValue={user.role} className={selectClassName()}>
                        {roleOptions.map((role) => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end">
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-ink/45">Sucursal</label>
                      <select name="branch_id" defaultValue={user.branch_id ?? ""} className={selectClassName()}>
                        <option value="">Sin sucursal</option>
                        {(branches as BranchRecord[] | null)?.map((branch) => (
                          <option key={branch.id} value={branch.id}>{branch.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-ink/45">Nueva contrasena</label>
                      <input name="password" type="password" className={inputClassName()} placeholder="Opcional" />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-ink/45">Estado</label>
                      <select name="is_active" defaultValue={user.is_active ? "true" : "false"} className={selectClassName()}>
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </div>
                    <button className="inline-flex h-11 items-center justify-center rounded-2xl bg-ink px-4 text-sm font-semibold text-cloud">
                      Guardar
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink/55">
                    <span className="rounded-full bg-white px-3 py-1">{user.role}</span>
                    <span>{user.branches?.name ?? "Sin sucursal"}</span>
                    <span>{user.is_active ? "Activo" : "Inactivo"}</span>
                  </div>
                </form>
              ))}
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  );
}