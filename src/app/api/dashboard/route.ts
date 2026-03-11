import { NextResponse } from "next/server";
import { kitchenQueue, metrics, stockAlerts, topProducts } from "@/lib/mock-data";

export function GET() {
  return NextResponse.json({
    metrics,
    topProducts,
    stockAlerts,
    kitchenQueue
  });
}