"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function openTableAction(formData: FormData) {
  const admin = createAdminClient();

  const tableId = formData.get("tableId") as string;
  const branchId = formData.get("branchId") as string;
  const guestCount = parseInt(formData.get("guestCount") as string) || 1;
  const userId = formData.get("userId") as string;

  if (!tableId || !branchId || !userId) {
    return { error: "Mesa, sede y usuario son requeridos" };
  }

  // Check if table already has an open session
  const { data: existingSession } = await admin
    .from("table_sessions")
    .select("id")
    .eq("table_id", tableId)
    .eq("status", "open")
    .single();

  if (existingSession) {
    return { error: "Esta mesa ya tiene una sesion abierta" };
  }

  // Create table session
  const { data: session, error: sessionError } = await admin
    .from("table_sessions")
    .insert({
      branch_id: branchId,
      table_id: tableId,
      guest_count: guestCount,
      status: "open",
      opened_by: userId,
      opened_at: new Date().toISOString()
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    console.error("Error creating table session:", sessionError);
    return { error: "Error al abrir la mesa" };
  }

  // Create initial sale
  const { error: saleError } = await admin.from("sales").insert({
    branch_id: branchId,
    table_session_id: session.id,
    sale_type: "dine_in",
    status: "open",
    subtotal: 0,
    tax_total: 0,
    discount_total: 0,
    total: 0,
    opened_by: userId
  });

  if (saleError) {
    console.error("Error creating sale:", saleError);
    // Rollback: delete the session
    await admin.from("table_sessions").delete().eq("id", session.id);
    return { error: "Error al crear la venta" };
  }

  // Update table status
  await admin
    .from("restaurant_tables")
    .update({ status: "occupied" })
    .eq("id", tableId);

  revalidatePath("/pos");
  return { success: true, sessionId: session.id };
}

export async function closeTableAction(formData: FormData) {
  const admin = createAdminClient();

  const sessionId = formData.get("sessionId") as string;
  const userId = formData.get("userId") as string;

  if (!sessionId || !userId) {
    return { error: "Sesion y usuario son requeridos" };
  }

  // Get session and table
  const { data: session } = await admin
    .from("table_sessions")
    .select("table_id")
    .eq("id", sessionId)
    .single();

  if (!session) {
    return { error: "Sesion no encontrada" };
  }

  // Close table session
  const { error: sessionError } = await admin
    .from("table_sessions")
    .update({
      status: "closed",
      closed_at: new Date().toISOString(),
      closed_by: userId
    })
    .eq("id", sessionId);

  if (sessionError) {
    console.error("Error closing table session:", sessionError);
    return { error: "Error al cerrar la mesa" };
  }

  // Update table status to available
  await admin
    .from("restaurant_tables")
    .update({ status: "available" })
    .eq("id", session.table_id);

  revalidatePath("/pos");
  return { success: true };
}
