import { createAdminClient } from "@/lib/supabase/admin";

export type PosCategory = {
  id: string;
  name: string;
  color: string;
};

export type PosProduct = {
  id: string;
  categoryId: string;
  name: string;
  price: number;
};

export type PosTable = {
  id: string;
  tableNumber: string;
  areaName: string;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "disabled";
  openSaleId: string | null;
  openSaleTotal: number;
  guestCount: number;
};

export async function getPosData(branchId: string) {
  const admin = createAdminClient();

  const [categoriesResult, productsResult, tablesResult] = await Promise.all([
    admin
      .from("product_categories")
      .select("id, name, color")
      .eq("branch_id", branchId)
      .eq("is_active", true)
      .order("sort_order"),

    admin
      .from("products")
      .select("id, category_id, name, price")
      .eq("branch_id", branchId)
      .eq("is_active", true)
      .order("name"),

    admin
      .from("restaurant_tables")
      .select(`
        id,
        table_number,
        capacity,
        status,
        service_areas(name),
        table_sessions(id, status, guest_count, sales(id, total, status))
      `)
      .eq("branch_id", branchId)
      .eq("is_active", true)
      .order("table_number")
  ]);

  const categories: PosCategory[] = (categoriesResult.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color ?? "#1c1917"
  }));

  const products: PosProduct[] = (productsResult.data ?? []).map((p) => ({
    id: p.id,
    categoryId: p.category_id ?? "",
    name: p.name,
    price: Number(p.price)
  }));

  const tables: PosTable[] = (tablesResult.data ?? []).map((t) => {
    const areaRaw = Array.isArray(t.service_areas) ? t.service_areas[0] : t.service_areas;
    const areaName = (areaRaw as { name: string } | null)?.name ?? "Salon";

    // Find open table session
    const sessions = Array.isArray(t.table_sessions) ? t.table_sessions : t.table_sessions ? [t.table_sessions] : [];
    const openSession = sessions.find((s: { status: string }) => s.status === "open");

    let openSaleId: string | null = null;
    let openSaleTotal = 0;
    let guestCount = 0;

    if (openSession) {
      guestCount = (openSession as { guest_count: number }).guest_count ?? 0;
      const salesRaw = (openSession as { sales: unknown }).sales;
      const salesArr = Array.isArray(salesRaw) ? salesRaw : salesRaw ? [salesRaw] : [];
      const openSale = salesArr.find((s: { status: string }) => s.status === "open");
      if (openSale) {
        openSaleId = (openSale as { id: string }).id;
        openSaleTotal = Number((openSale as { total: number }).total);
      }
    }

    return {
      id: t.id,
      tableNumber: t.table_number,
      areaName,
      capacity: t.capacity ?? 4,
      status: t.status as PosTable["status"],
      openSaleId,
      openSaleTotal,
      guestCount
    };
  });

  return { categories, products, tables };
}

export async function getShellContextData(branchId: string) {
  const admin = createAdminClient();

  const [branchResult, tablesCountResult, cashResult] = await Promise.all([
    admin.from("branches").select("name").eq("id", branchId).single(),

    admin
      .from("restaurant_tables")
      .select("id", { count: "exact", head: true })
      .eq("branch_id", branchId)
      .eq("status", "occupied"),

    admin
      .from("cash_sessions")
      .select(`
        id,
        opening_amount,
        status,
        opened_at,
        opened_by:app_users!opened_by(full_name),
        cash_registers(name),
        cash_movements(amount, movement_type)
      `)
      .eq("status", "open")
      .order("opened_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  const branchName = branchResult.data?.name ?? "Sucursal";
  const activeTables = tablesCountResult.count ?? 0;

  let cashInfo: {
    registerName: string;
    cashierName: string;
    openingAmount: number;
    totalSales: number;
    isOpen: boolean;
  } | null = null;

  if (cashResult.data) {
    const cs = cashResult.data;
    const movements = Array.isArray(cs.cash_movements) ? cs.cash_movements : cs.cash_movements ? [cs.cash_movements] : [];
    const totalSales = movements
      .filter((m: { movement_type: string }) => m.movement_type === "sale_income")
      .reduce((sum: number, m: { amount: number }) => sum + Number(m.amount), 0);

    const openedByRaw = Array.isArray(cs.opened_by) ? cs.opened_by[0] : cs.opened_by;
    const registerRaw = Array.isArray(cs.cash_registers) ? cs.cash_registers[0] : cs.cash_registers;

    cashInfo = {
      registerName: (registerRaw as { name: string } | null)?.name ?? "Caja",
      cashierName: (openedByRaw as { full_name: string } | null)?.full_name ?? "—",
      openingAmount: Number(cs.opening_amount),
      totalSales,
      isOpen: cs.status === "open"
    };
  }

  return { branchName, activeTables, cashInfo };
}
