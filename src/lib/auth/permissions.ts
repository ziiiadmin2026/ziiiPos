import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "admin" | "manager" | "cashier" | "waiter" | "kitchen" | "inventory";
export type AppModule = "dashboard" | "pos" | "backoffice";

export type AppUserRecord = {
  id: string;
  auth_user_id: string | null;
  organization_id: string;
  branch_id: string | null;
  full_name: string;
  email: string | null;
  role: AppRole;
  is_active: boolean;
};

const modulePermissions: Record<AppRole, AppModule[]> = {
  admin: ["dashboard", "pos", "backoffice"],
  manager: ["dashboard", "pos", "backoffice"],
  cashier: ["dashboard", "pos"],
  waiter: ["pos"],
  kitchen: ["dashboard", "pos"],
  inventory: ["dashboard", "backoffice"]
};

const defaultModuleByRole: Record<AppRole, AppModule> = {
  admin: "dashboard",
  manager: "dashboard",
  cashier: "pos",
  waiter: "pos",
  kitchen: "dashboard",
  inventory: "backoffice"
};

export function canAccessModule(role: AppRole, module: AppModule) {
  return modulePermissions[role].includes(module);
}

export function getDefaultRouteForRole(role: AppRole) {
  const defaultModule = defaultModuleByRole[role];

  switch (defaultModule) {
    case "dashboard":
      return "/";
    case "pos":
      return "/pos";
    case "backoffice":
      return "/backoffice";
  }
}

export async function getCurrentAppUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { authUser: null, appUser: null };
  }

  const admin = createAdminClient();
  const { data: appUser, error } = await admin
    .from("app_users")
    .select("id, auth_user_id, organization_id, branch_id, full_name, email, role, is_active")
    .eq("auth_user_id", user.id)
    .maybeSingle<AppUserRecord>();

  if (error) {
    throw error;
  }

  return { authUser: user, appUser };
}

export async function requireAppAccess(module: AppModule) {
  const { authUser, appUser } = await getCurrentAppUser();

  if (!authUser) {
    redirect("/login");
  }

  if (!appUser || !appUser.is_active) {
    redirect("/unauthorized?reason=perfil");
  }

  if (!canAccessModule(appUser.role, module)) {
    redirect(`/unauthorized?reason=${module}`);
  }

  return { authUser, appUser };
}