import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env.local if present
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      const val = (match[2] || "").trim().replace(/^['"]|['"]$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  const email = process.env.ADMIN_EMAIL || process.argv[2] || "admin@kicheesbakeddelights.in";
  const password = process.env.ADMIN_PASSWORD || process.argv[3];

  if (!password) {
    console.error("Please provide password as 2nd argument or ADMIN_PASSWORD env var");
    process.exit(1);
  }

  console.log(`Checking if admin ${email} already exists...`);
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing users:", listError);
    process.exit(1);
  }

  const existing = usersData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  let userId;
  if (existing) {
    console.log(`User ${email} already exists with ID ${existing.id}. Updating password and metadata...`);
    const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: {
        name: "Kichees Super Admin",
        role: "SUPER_ADMIN",
      },
    });
    if (updateError) {
      console.error("Error updating user:", updateError);
      process.exit(1);
    }
    userId = updated.user.id;
    console.log("Admin user updated successfully.");
  } else {
    console.log(`Creating user ${email}...`);
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: "Kichees Super Admin",
        role: "SUPER_ADMIN",
      },
    });

    if (createError) {
      console.error("Error creating user:", createError);
      process.exit(1);
    }
    userId = created.user.id;
    console.log(`Admin user created successfully with ID: ${userId}`);
  }

  // Ensure public.profiles has SUPER_ADMIN role
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      email,
      name: "Kichees Super Admin",
      role: "SUPER_ADMIN",
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    console.error("Error upserting profile:", profileError);
    process.exit(1);
  }

  console.log("Admin profile verified and updated in public.profiles table.");
}

main().catch(console.error);
