import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "achsas-pos",
    timestamp: new Date().toISOString()
  });
}