"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateBrandingAction(formData: FormData) {
  const admin = createAdminClient();

  const organizationId = formData.get("organizationId") as string;
  const brandName = formData.get("brand_name") as string;
  const logoUrl = formData.get("logo_url") as string;
  const primaryColor = formData.get("primary_color") as string;
  const secondaryColor = formData.get("secondary_color") as string;

  if (!organizationId) {
    return { error: "ID de organizacion requerido" };
  }

  const { error } = await admin
    .from("organizations")
    .update({
      brand_name: brandName || null,
      logo_url: logoUrl || null,
      primary_color: primaryColor || "#1c1917",
      secondary_color: secondaryColor || "#16a34a"
    })
    .eq("id", organizationId);

  if (error) {
    console.error("Error updating branding:", error);
    return { error: "Error al actualizar la configuracion" };
  }

  revalidatePath("/backoffice/branding");
  revalidatePath("/", "layout");
  return { success: true };
}
