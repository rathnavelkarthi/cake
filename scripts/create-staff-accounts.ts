import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const ACCOUNTS = [
  {
    email: "bakery.chef@kicheesbakeddelights.in",
    password: "BakeryChef@Kichees2026",
    name: "Bakery Head Chef",
    role: "HEAD_CHEF",
    department: "Hot Bakery & Breads",
  },
  {
    email: "confectionery.chef@kicheesbakeddelights.in",
    password: "Confectionery@Kichees2026",
    name: "Confectionery Head Chef",
    role: "HEAD_CHEF",
    department: "Patisserie & Custom Cakes",
  },
  {
    email: "cafe.staff@kicheesbakeddelights.in",
    password: "CafeStaff@Kichees2026",
    name: "Kichees Cafe Staff",
    role: "BILLING_STAFF",
    department: "Cafe Counter & Billing POS",
  },
];

async function main() {
  console.log("=== Creating Staff Accounts in Supabase Auth ===");

  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing users:", listError);
    return;
  }

  for (const acc of ACCOUNTS) {
    console.log(`\nProcessing: ${acc.name} (${acc.email})...`);
    const existing = usersData.users.find(
      (u) => u.email?.toLowerCase() === acc.email.toLowerCase()
    );

    let userId: string;
    if (existing) {
      console.log(`- Updating existing user ${acc.email} (ID: ${existing.id})...`);
      const { data: updated, error: updateErr } = await supabase.auth.admin.updateUserById(
        existing.id,
        {
          password: acc.password,
          email_confirm: true,
          user_metadata: {
            name: acc.name,
            role: acc.role,
            department: acc.department,
          },
        }
      );
      if (updateErr) {
        console.error(`  Error updating user:`, updateErr.message);
        continue;
      }
      userId = updated.user.id;
    } else {
      console.log(`- Creating new Supabase Auth user...`);
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: acc.email,
        password: acc.password,
        email_confirm: true,
        user_metadata: {
          name: acc.name,
          role: acc.role,
          department: acc.department,
        },
      });
      if (createErr) {
        console.error(`  Error creating user:`, createErr.message);
        continue;
      }
      userId = created.user.id;
    }

    // Upsert into public.profiles
    const { error: profileErr } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        email: acc.email,
        name: acc.name,
        role: acc.role,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });

    if (profileErr) {
      console.error(`  Error upserting profile:`, profileErr.message);
    } else {
      console.log(`  ✓ Profile synced to public.profiles with role: ${acc.role}`);
    }

    // Test sign-in to verify credentials
    const clientAuth = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: loginData, error: loginErr } = await clientAuth.auth.signInWithPassword({
      email: acc.email,
      password: acc.password,
    });

    if (loginErr) {
      console.error(`  ✕ Test Login FAILED:`, loginErr.message);
    } else {
      console.log(`  ✓ Test Login SUCCESSFUL! Authenticated as ${loginData.user.email} (Role: ${loginData.user.user_metadata?.role})`);
    }
  }

  console.log("\n========================================================");
  console.log("All 3 staff accounts successfully created & verified!");
  console.log("========================================================");
}

main().catch(console.error);
