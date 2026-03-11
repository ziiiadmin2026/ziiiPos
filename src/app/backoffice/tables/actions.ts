"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createTableAction(formData: FormData) {
  const admin = createAdminClient();

  const branchId = formData.get("branchId") as string;
  const tableNumber = formData.get("table_number") as string;
  const serviceAreaId = formData.get("service_area_id") as string;
  const capacity = parseInt(formData.get("capacity") as string);
  const status = formData.get("status") as string;
  const shape = formData.get("shape") as string;
  const isActive = formData.get("is_active") === "on";

  if (!branchId || !tableNumber) {
    return { error: "Numero de mesa es requerido" };
  }

  const { error } = await admin.from("restaurant_tables").insert({
    branch_id: branchId,
    table_number: tableNumber,
    service_area_id: serviceAreaId || null,
    capacity: capacity || 4,
    status: status || "available",
    shape: shape || "square",
    is_active: isActive
  });

  if (error) {
    console.error("Error creating table:", error);
    if (error.code === "23505") {
      return { error: "Ya existe una mesa con este numero" };
    }
    return { error: "Error al crear la mesa" };
  }

  revalidatePath("/backoffice/tables");
  return { success: true };
}

export async function updateTableAction(formData: FormData) {
  const admin = createAdminClient();

  const id = formData.get("id") as string;
  const tableNumber = formData.get("table_number") as string;
  const serviceAreaId = formData.get("service_area_id") as string;
  const capacity = parseInt(formData.get("capacity") as string);
  const status = formData.get("status") as string;
  const shape = formData.get("shape") as string;
  const isActive = formData.get("is_active") === "on";

  if (!id || !tableNumber) {
    return { error: "ID y numero de mesa son requeridos" };
  }

  const { error } = await admin
    .from("restaurant_tables")
    .update({
      table_number: tableNumber,
      service_area_id: serviceAreaId || null,
      capacity: capacity || 4,
      status: status || "available",
      shape: shape || "square",
      is_active: isActive
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating table:", error);
    if (error.code === "23505") {
      return { error: "Ya existe una mesa con este numero" };
    }
    return { error: "Error al actualizar la mesa" };
  }

  revalidatePath("/backoffice/tables");
  return { success: true };
}

export async function createAreaAction(formData: FormData) {
  const admin = createAdminClient();

  const branchId = formData.get("branchId") as string;
  const name = formData.get("name") as string;

  if (!branchId || !name) {
    return { error: "Nombre del area es requerido" };
  }

  // Get max sort_order
  const { data: maxArea } = await admin
    .from("service_areas")
    .select("sort_order")
    .eq("branch_id", branchId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const sortOrder = (maxArea?.sort_order ?? -1) + 1;

  const { error } = await admin.from("service_areas").insert({
    branch_id: branchId,
    name,
    sort_order: sortOrder
  });

  if (error) {
    console.error("Error creating area:", error);
    if (error.code === "23505") {
      return { error: "Ya existe un area con este nombre" };
    }
    return { error: "Error al crear el area" };
  }

  revalidatePath("/backoffice/tables");
  return { success: true };
}

export async function updateTablePositionAction(formData: FormData) {
  const admin = createAdminClient();

  const tableId = formData.get("tableId") as string;
  const posX = parseInt(formData.get("pos_x") as string);
  const posY = parseInt(formData.get("pos_y") as string);

  if (!tableId) {
    return { error: "ID de mesa es requerido" };
  }

  const { error } = await admin
    .from("restaurant_tables")
    .update({
      pos_x: posX,
      pos_y: posY
    })
    .eq("id", tableId);

  if (error) {
    console.error("Error updating table position:", error);
    return { error: "Error al actualizar la posicion" };
  }

  revalidatePath("/backoffice/tables");
  return { success: true };
}
