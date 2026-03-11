import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ParsedProduct = {
  category: string;
  name: string;
  description: string;
  price: number;
  productType: "dish" | "drink";
};

export type ImportPreview = {
  products: ParsedProduct[];
  categories: string[];
  errors: string[];
};

export type ImportResult = {
  categoriesCreated: number;
  productsUpserted: number;
  errors: string[];
};

const DRINK_CATEGORIES = new Set(["bebidas", "drinks", "cocteles", "cocktails", "licores"]);

const CATEGORY_COLORS: Record<string, string> = {
  entradas: "#f97316",
  "menú infantil": "#f59e0b",
  res: "#292524",
  pescados: "#0ea5e9",
  pollo: "#eab308",
  cerdo: "#e879f9",
  mixtas: "#a78bfa",
  variedades: "#34d399",
  bebidas: "#15803d",
  postres: "#f43f5e"
};

function parseSheet(buffer: Buffer): { data: ParsedProduct[]; errors: string[] } {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: "" }) as string[][];

  if (rows.length < 2) {
    return { data: [], errors: ["El archivo no contiene datos."] };
  }

  // Detect header row (first row with "Categoría" or "Producto")
  const header = rows[0].map((h) => String(h).toLowerCase().trim());
  const catIdx = header.findIndex((h) => h.includes("categor"));
  const nameIdx = header.findIndex((h) => h.includes("producto") || h.includes("nombre"));
  const descIdx = header.findIndex((h) => h.includes("descri") || h.includes("acompa"));
  const priceIdx = header.findIndex((h) => h.includes("precio") || h.includes("price"));

  if (catIdx === -1 || nameIdx === -1 || priceIdx === -1) {
    return {
      data: [],
      errors: ["No se encontraron las columnas requeridas: Categoría, Producto, Precio"]
    };
  }

  const data: ParsedProduct[] = [];
  const errors: string[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const category = String(row[catIdx] ?? "").trim();
    const name = String(row[nameIdx] ?? "").trim();
    const description = descIdx >= 0 ? String(row[descIdx] ?? "").trim() : "";
    const rawPrice = row[priceIdx];
    const price = parseFloat(String(rawPrice).replace(/[^0-9.]/g, ""));

    if (!category || !name) continue;
    if (isNaN(price) || price < 0) {
      errors.push(`Fila ${i + 1}: precio inválido para "${name}" (valor: ${rawPrice})`);
      continue;
    }

    const catLower = category.toLowerCase();
    const productType: "dish" | "drink" = DRINK_CATEGORIES.has(catLower) ? "drink" : "dish";

    data.push({ category, name, description, price, productType });
  }

  return { data, errors };
}

// POST /api/import/menu
// action=preview → parse and return preview only
// action=import  → parse and upsert to DB
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: appUser } = await admin
    .from("app_users")
    .select("id, branch_id, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!appUser || !["admin", "manager"].includes(appUser.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const branchId = appUser.branch_id ?? "22222222-2222-2222-2222-222222222222";

  const formData = await req.formData();
  const action = (formData.get("action") as string) ?? "preview";
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No se recibió archivo." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { data: products, errors: parseErrors } = parseSheet(buffer);

  if (products.length === 0) {
    return NextResponse.json({ error: "No se encontraron productos.", details: parseErrors } as unknown, { status: 422 });
  }

  const categories = [...new Set(products.map((p) => p.category))];
  const preview: ImportPreview = { products, categories, errors: parseErrors };

  if (action === "preview") {
    return NextResponse.json(preview);
  }

  // ── action === "import" ──────────────────────────────────────────────────
  const importErrors: string[] = [...parseErrors];
  let categoriesCreated = 0;
  let productsUpserted = 0;

  // 1. Upsert categories
  const categoryIdMap = new Map<string, string>();

  for (let i = 0; i < categories.length; i++) {
    const catName = categories[i];
    const catLower = catName.toLowerCase();
    const color = CATEGORY_COLORS[catLower] ?? "#6b7280";

    const { data: existing } = await admin
      .from("product_categories")
      .select("id")
      .eq("branch_id", branchId)
      .ilike("name", catName)
      .maybeSingle();

    if (existing) {
      categoryIdMap.set(catName, existing.id);
    } else {
      const { data: created, error } = await admin
        .from("product_categories")
        .insert({ branch_id: branchId, name: catName, color, sort_order: i })
        .select("id")
        .single();

      if (error || !created) {
        importErrors.push(`No se pudo crear categoría "${catName}": ${error?.message}`);
      } else {
        categoryIdMap.set(catName, created.id);
        categoriesCreated++;
      }
    }
  }

  // 2. Upsert products
  for (const p of products) {
    const categoryId = categoryIdMap.get(p.category);
    if (!categoryId) {
      importErrors.push(`Producto "${p.name}" omitido: categoría no encontrada.`);
      continue;
    }

    const { error } = await admin.from("products").upsert(
      {
        branch_id: branchId,
        category_id: categoryId,
        name: p.name,
        description: p.description || null,
        product_type: p.productType,
        price: p.price,
        tax_rate: 0,
        is_active: true
      },
      { onConflict: "branch_id,name", ignoreDuplicates: false }
    );

    if (error) {
      importErrors.push(`Producto "${p.name}": ${error.message}`);
    } else {
      productsUpserted++;
    }
  }

  const result: ImportResult = {
    categoriesCreated,
    productsUpserted,
    errors: importErrors
  };

  return NextResponse.json(result);
}
