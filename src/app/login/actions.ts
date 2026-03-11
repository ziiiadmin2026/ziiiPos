"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDefaultRouteForRole } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function loginAction(formData: FormData) {
  const email = getStringValue(formData, "email");
  const password = getStringValue(formData, "password");

  if (!email || !password) {
    redirect("/login?error=Completa%20correo%20y%20contrasena");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent("No se pudo iniciar sesion. Verifica tus credenciales.")}`);
  }

  const admin = createAdminClient();
  const { data: appUser } = await admin
    .from("app_users")
    .select("role, is_active")
    .eq("auth_user_id", data.user.id)
    .maybeSingle<{ role: Parameters<typeof getDefaultRouteForRole>[0]; is_active: boolean }>();

  if (!appUser?.is_active) {
    redirect("/unauthorized?reason=perfil");
  }

  revalidatePath("/", "layout");
  redirect(getDefaultRouteForRole(appUser.role));
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}