"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRoles, type AppRole } from "@/lib/auth/permissions";

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeBranchId(value: string) {
  return value || null;
}

export async function createManagedUserAction(formData: FormData) {
  const { appUser } = await requireRoles(["admin"]);
  const fullName = getValue(formData, "full_name");
  const email = getValue(formData, "email").toLowerCase();
  const password = getValue(formData, "password");
  const role = getValue(formData, "role") as AppRole;
  const branchId = normalizeBranchId(getValue(formData, "branch_id"));

  if (!fullName || !email || !password || !role) {
    redirect("/backoffice/users?error=Completa%20todos%20los%20campos%20requeridos");
  }

  const admin = createAdminClient();
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  if (authError || !authData.user) {
    redirect("/backoffice/users?error=No%20se%20pudo%20crear%20el%20usuario%20en%20Auth");
  }

  const { error: appUserError } = await admin.from("app_users").insert({
    auth_user_id: authData.user.id,
    organization_id: appUser.organization_id,
    branch_id: branchId,
    full_name: fullName,
    email,
    role,
    is_active: true
  });

  if (appUserError) {
    await admin.auth.admin.deleteUser(authData.user.id);
    redirect("/backoffice/users?error=No%20se%20pudo%20crear%20el%20perfil%20operativo");
  }

  revalidatePath("/backoffice/users");
  redirect("/backoffice/users?success=Usuario%20creado");
}

export async function updateManagedUserAction(formData: FormData) {
  await requireRoles(["admin"]);
  const appUserId = getValue(formData, "app_user_id");
  const authUserId = getValue(formData, "auth_user_id");
  const fullName = getValue(formData, "full_name");
  const email = getValue(formData, "email").toLowerCase();
  const password = getValue(formData, "password");
  const role = getValue(formData, "role") as AppRole;
  const branchId = normalizeBranchId(getValue(formData, "branch_id"));
  const isActive = getValue(formData, "is_active") === "true";

  if (!appUserId || !authUserId || !fullName || !email || !role) {
    redirect("/backoffice/users?error=Datos%20de%20actualizacion%20invalidos");
  }

  const admin = createAdminClient();
  const updatePayload: {
    email: string;
    email_confirm: true;
    user_metadata: { full_name: string };
    password?: string;
  } = {
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  };

  if (password) {
    updatePayload.password = password;
  }

  const { error: authError } = await admin.auth.admin.updateUserById(authUserId, updatePayload);

  if (authError) {
    redirect("/backoffice/users?error=No%20se%20pudo%20actualizar%20el%20usuario%20de%20Auth");
  }

  const { error: appUserError } = await admin
    .from("app_users")
    .update({
      full_name: fullName,
      email,
      role,
      branch_id: branchId,
      is_active: isActive
    })
    .eq("id", appUserId);

  if (appUserError) {
    redirect("/backoffice/users?error=No%20se%20pudo%20actualizar%20el%20perfil%20operativo");
  }

  revalidatePath("/backoffice/users");
  redirect("/backoffice/users?success=Usuario%20actualizado");
}