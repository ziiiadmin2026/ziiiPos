"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createBranchAction(formData: FormData) {
  const admin = createAdminClient();

  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const isActive = formData.get("is_active") === "on";
  const organizationId = formData.get("organizationId") as string;

  if (!name || !organizationId) {
    return { error: "Nombre y organizacion son requeridos" };
  }

  const { error } = await admin.from("branches").insert({
    organization_id: organizationId,
    name,
    code: code || null,
    address: address || null,
    phone: phone || null,
    is_active: isActive
  });

  if (error) {
    console.error("Error creating branch:", error);
    return { error: "Error al crear la sede" };
  }

  revalidatePath("/backoffice/branches");
  return { success: true };
}

export async function updateBranchAction(formData: FormData) {
  const admin = createAdminClient();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const isActive = formData.get("is_active") === "on";

  if (!id || !name) {
    return { error: "ID y nombre son requeridos" };
  }

  const { error } = await admin
    .from("branches")
    .update({
      name,
      code: code || null,
      address: address || null,
      phone: phone || null,
      is_active: isActive
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating branch:", error);
    return { error: "Error al actualizar la sede" };
  }

  revalidatePath("/backoffice/branches");
  return { success: true };
}
