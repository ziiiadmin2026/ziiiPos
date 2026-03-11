import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/data/dashboard";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const { data: appUser } = await admin
      .from("app_users")
      .select("branch_id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const branchId = appUser?.branch_id ?? "22222222-2222-2222-2222-222222222222";
    const data = await getDashboardData(branchId);
    return NextResponse.json(data);
  } catch (err) {
    console.error("dashboard api error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}