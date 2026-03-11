import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    parsed[key] = next && !next.startsWith("--") ? next : "true";
  }

  return parsed;
}

function loadEnvFile(envFilePath) {
  if (!envFilePath) {
    return;
  }

  const absolutePath = path.resolve(process.cwd(), envFilePath);
  const content = fs.readFileSync(absolutePath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separator = line.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  loadEnvFile(args["env-file"]);

  const email = args.email;
  const password = args.password;
  const fullName = args["full-name"] ?? "Administrador ZiiiPos";
  const role = args.role ?? "admin";
  const organizationId = args["organization-id"];
  const branchId = args["branch-id"];

  if (!email || !password) {
    throw new Error("Usage: node scripts/bootstrap-admin.mjs --env-file .env.vm-local --email admin@ziiipos.com --password <secret> [--full-name 'Admin'] [--role admin]");
  }

  const url = process.env.SUPABASE_PUBLIC_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_PUBLIC_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    throw listError;
  }

  let authUser = listData.users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) ?? null;

  if (!authUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });

    if (error) {
      throw error;
    }

    authUser = data.user;
  } else {
    const { data, error } = await supabase.auth.admin.updateUserById(authUser.id, {
      email,
      password,
      user_metadata: { ...(authUser.user_metadata ?? {}), full_name: fullName },
      email_confirm: true
    });

    if (error) {
      throw error;
    }

    authUser = data.user;
  }

  const { data: organizations, error: orgError } = await supabase
    .from("organizations")
    .select("id")
    .limit(1);

  if (orgError) {
    throw orgError;
  }

  const effectiveOrganizationId = organizationId ?? organizations?.[0]?.id;
  if (!effectiveOrganizationId) {
    throw new Error("No organization found. Seed or create one before bootstrapping users.");
  }

  let effectiveBranchId = branchId ?? null;
  if (!effectiveBranchId) {
    const { data: branches, error: branchError } = await supabase
      .from("branches")
      .select("id")
      .eq("organization_id", effectiveOrganizationId)
      .limit(1);

    if (branchError) {
      throw branchError;
    }

    effectiveBranchId = branches?.[0]?.id ?? null;
  }

  const { error: upsertError } = await supabase.from("app_users").upsert(
    {
      auth_user_id: authUser.id,
      organization_id: effectiveOrganizationId,
      branch_id: effectiveBranchId,
      full_name: fullName,
      email,
      role,
      is_active: true
    },
    { onConflict: "auth_user_id" }
  );

  if (upsertError) {
    throw upsertError;
  }

  console.log("Admin bootstrap completed successfully.");
  console.log(JSON.stringify({ email, role, authUserId: authUser.id, organizationId: effectiveOrganizationId, branchId: effectiveBranchId }, null, 2));
}

main().catch((error) => {
  console.error("Failed to bootstrap admin user.");
  console.error(error);
  process.exit(1);
});