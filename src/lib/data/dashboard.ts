import { createAdminClient } from "@/lib/supabase/admin";
import { getRegionalConfig, formatMoney } from "@/lib/config/regional";

export type DashboardMetric = {
  label: string;
  value: string;
  delta: string;
  tone: "warm" | "forest";
};

export type TopProduct = {
  name: string;
  sold: number;
  revenue: string;
};

export type StockAlert = {
  ingredient: string;
  stock: string;
  minimum: string;
};

export type KitchenTicket = {
  ticket: string;
  table: string;
  items: number;
  stage: string;
};

export async function getDashboardData(branchId: string) {
  const admin = createAdminClient();
  const regionalConfig = await getRegionalConfig();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [salesResult, itemsResult, stockResult, kitchenResult] = await Promise.all([
    // Today's paid sales
    admin
      .from("sales")
      .select("total, subtotal")
      .eq("branch_id", branchId)
      .eq("status", "paid")
      .gte("closed_at", todayStart.toISOString()),

    // Top products today (by quantity sold)
    admin
      .from("sale_items")
      .select("quantity, line_total, product_id, products(name), sales!inner(branch_id, status, closed_at)")
      .eq("sales.branch_id", branchId)
      .eq("sales.status", "paid")
      .gte("sales.closed_at", todayStart.toISOString()),

    // Stock alerts: ingredients below minimum
    admin
      .from("ingredients")
      .select(`
        id,
        name,
        min_stock,
        unit_id,
        units_of_measure(code),
        inventory_movements(quantity, movement_type)
      `)
      .eq("branch_id", branchId)
      .eq("is_active", true),

    // Kitchen queue: open sale items not yet served
    admin
      .from("sale_items")
      .select(`
        id,
        quantity,
        kitchen_status,
        sales!inner(id, branch_id, status, sale_number, restaurant_tables(table_number))
      `)
      .eq("sales.branch_id", branchId)
      .eq("sales.status", "open")
      .in("kitchen_status", ["pending", "preparing", "ready"])
      .order("created_at", { ascending: true })
  ]);

  // ── Metrics ──────────────────────────────────────────────
  const sales = salesResult.data ?? [];
  const totalSales = sales.reduce((sum, s) => sum + Number(s.total), 0);
  const avgTicket = sales.length > 0 ? totalSales / sales.length : 0;

  const metrics: DashboardMetric[] = [
    {
      label: "Ventas del dia",
      value: formatMoney(totalSales, regionalConfig),
      delta: `${sales.length} ventas cerradas`,
      tone: "warm"
    },
    {
      label: "Ticket promedio",
      value: formatMoney(avgTicket, regionalConfig),
      delta: `${sales.length} tickets`,
      tone: "forest"
    },
    {
      label: "Food cost",
      value: "—",
      delta: "Requiere recetas",
      tone: "forest"
    },
    {
      label: "Alertas de stock",
      value: "0",
      delta: "Calculando…",
      tone: "warm"
    }
  ];

  // ── Top Products ──────────────────────────────────────────
  const productMap = new Map<string, { name: string; sold: number; revenue: number }>();
  for (const item of itemsResult.data ?? []) {
    const product = Array.isArray(item.products) ? item.products[0] : item.products;
    if (!product) continue;
    const name = (product as { name: string }).name;
    const existing = productMap.get(item.product_id);
    if (existing) {
      existing.sold += Number(item.quantity);
      existing.revenue += Number(item.line_total);
    } else {
      productMap.set(item.product_id, {
        name,
        sold: Number(item.quantity),
        revenue: Number(item.line_total)
      });
    }
  }

  const topProducts: TopProduct[] = Array.from(productMap.values())
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5)
    .map((p) => ({
      name: p.name,
      sold: Math.round(p.sold),
      revenue: formatMoney(p.revenue, regionalConfig)
    }));

  // ── Stock Alerts ──────────────────────────────────────────
  const stockAlerts: StockAlert[] = [];
  for (const ing of stockResult.data ?? []) {
    const movements = Array.isArray(ing.inventory_movements) ? ing.inventory_movements : [];
    const onHand = movements.reduce((sum: number, m: { quantity: number }) => sum + Number(m.quantity), 0);
    const unitCode = Array.isArray(ing.units_of_measure)
      ? (ing.units_of_measure[0] as { code: string })?.code
      : (ing.units_of_measure as { code: string } | null)?.code ?? "";

    if (onHand < Number(ing.min_stock)) {
      stockAlerts.push({
        ingredient: ing.name,
        stock: `${formatQty(onHand)} ${unitCode}`,
        minimum: `${formatQty(Number(ing.min_stock))} ${unitCode}`
      });
    }
  }

  // Update metrics with real stock count
  metrics[3].value = String(stockAlerts.length);
  metrics[3].delta = stockAlerts.filter((_, i) => i < 2).length + " criticas";

  // ── Kitchen Queue ─────────────────────────────────────────
  // Group by sale
  const saleMap = new Map<
    string,
    { saleId: string; saleNumber: string; tableLabel: string; items: number; statuses: string[] }
  >();

  for (const item of kitchenResult.data ?? []) {
    const sale = Array.isArray(item.sales) ? item.sales[0] : item.sales;
    if (!sale) continue;
    const saleId = (sale as { id: string }).id;
    const saleNumber = String((sale as { sale_number: number }).sale_number);
    const tableRaw = (sale as unknown as { restaurant_tables: { table_number: string }[] | { table_number: string } | null }).restaurant_tables;
    const table = Array.isArray(tableRaw) ? tableRaw[0] ?? null : tableRaw;
    const tableLabel = table ? `Mesa ${table.table_number}` : "Pickup";
    const existing = saleMap.get(saleId);
    if (existing) {
      existing.items += 1;
      existing.statuses.push(item.kitchen_status);
    } else {
      saleMap.set(saleId, { saleId, saleNumber, tableLabel, items: 1, statuses: [item.kitchen_status] });
    }
  }

  const kitchenQueue: KitchenTicket[] = Array.from(saleMap.values())
    .slice(0, 6)
    .map((s) => ({
      ticket: `#${s.saleNumber}`,
      table: s.tableLabel,
      items: s.items,
      stage: resolveStage(s.statuses)
    }));

  return { metrics, topProducts, stockAlerts, kitchenQueue };
}

// ── helpers ──────────────────────────────────────────────────────────────────



function formatQty(n: number) {
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

function resolveStage(statuses: string[]): string {
  if (statuses.includes("ready")) return "Listo para despachar";
  if (statuses.includes("preparing")) return "En preparacion";
  return "Pendiente";
}
