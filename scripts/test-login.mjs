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
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

async function testLogin() {
  const email = process.env.TEST_ADMIN_EMAIL || process.argv[2] || "admin@kicheesbakeddelights.in";
  const password = process.env.TEST_ADMIN_PASSWORD || process.argv[3];
  if (!password) {
    console.error("Please provide password as 2nd argument or TEST_ADMIN_PASSWORD env var");
    process.exit(1);
  }
  console.log(`Testing signInWithPassword for ${email}...`);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login failed:", error.message);
    process.exit(1);
  }

  console.log("Login SUCCESS!");
  console.log("User email:", data.user.email);
  console.log("User metadata:", data.user.user_metadata);

  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (pErr) {
    console.error("Profile fetch error:", pErr);
  } else {
    console.log("Profile from DB:", profile);
  }
}

testLogin();
