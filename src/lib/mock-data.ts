export type Metric = {
  label: string;
  value: string;
  delta: string;
  tone: "warm" | "forest";
};

export type PosCategory = {
  id: string;
  name: string;
  accent: string;
};

export type PosProduct = {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  prepTime: string;
};

export type TableStatus = {
  id: string;
  label: string;
  guests: number;
  total: number;
  status: "Libre" | "Activa" | "Por cerrar";
};

export const metrics: Metric[] = [
  { label: "Ventas del dia", value: "$18,420", delta: "+12.4%", tone: "warm" },
  { label: "Ticket promedio", value: "$286", delta: "+4.2%", tone: "forest" },
  { label: "Food cost", value: "31.8%", delta: "-1.1%", tone: "forest" },
  { label: "Alertas de stock", value: "7", delta: "2 criticas", tone: "warm" }
];

export const posCategories: PosCategory[] = [
  { id: "cat-1", name: "Entradas", accent: "from-orange-500/70 to-amber-300/80" },
  { id: "cat-2", name: "Parrilla", accent: "from-stone-900/80 to-orange-700/70" },
  { id: "cat-3", name: "Bebidas", accent: "from-emerald-700/70 to-lime-300/70" },
  { id: "cat-4", name: "Postres", accent: "from-rose-400/70 to-orange-200/80" }
];

export const posProducts: PosProduct[] = [
  { id: "prod-1", categoryId: "cat-1", name: "Tostada de atun", price: 169, prepTime: "6 min" },
  { id: "prod-2", categoryId: "cat-1", name: "Croquetas de elote", price: 132, prepTime: "8 min" },
  { id: "prod-3", categoryId: "cat-2", name: "Ribeye 350g", price: 448, prepTime: "14 min" },
  { id: "prod-4", categoryId: "cat-2", name: "Hamburguesa achsas", price: 219, prepTime: "10 min" },
  { id: "prod-5", categoryId: "cat-3", name: "Limonada mineral", price: 68, prepTime: "2 min" },
  { id: "prod-6", categoryId: "cat-3", name: "Carajillo", price: 145, prepTime: "3 min" },
  { id: "prod-7", categoryId: "cat-4", name: "Cheesecake vasco", price: 118, prepTime: "4 min" },
  { id: "prod-8", categoryId: "cat-4", name: "Flan de cajeta", price: 96, prepTime: "3 min" }
];

export const openTables: TableStatus[] = [
  { id: "M1", label: "Mesa 1", guests: 2, total: 542, status: "Activa" },
  { id: "M4", label: "Mesa 4", guests: 6, total: 1820, status: "Por cerrar" },
  { id: "M7", label: "Mesa 7", guests: 0, total: 0, status: "Libre" },
  { id: "M9", label: "Mesa 9", guests: 3, total: 786, status: "Activa" }
];

export const stockAlerts = [
  { ingredient: "Carne molida premium", stock: "4.2 kg", minimum: "8 kg" },
  { ingredient: "Jarabe natural", stock: "1.0 l", minimum: "3 l" },
  { ingredient: "Pan brioche", stock: "18 pzas", minimum: "30 pzas" }
];

export const topProducts = [
  { name: "Hamburguesa achsas", sold: 38, revenue: "$8,322" },
  { name: "Ribeye 350g", sold: 21, revenue: "$9,408" },
  { name: "Carajillo", sold: 29, revenue: "$4,205" }
];

export const kitchenQueue = [
  { ticket: "#1024", table: "Mesa 1", items: 3, stage: "En parrilla" },
  { ticket: "#1025", table: "Mesa 9", items: 2, stage: "Emplatando" },
  { ticket: "#1026", table: "Pickup", items: 4, stage: "Listo en 2 min" }
];