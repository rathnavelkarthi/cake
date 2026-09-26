import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const accounts = [
  { role: "Super Admin", email: "admin@kicheesbakeddelights.in", pass: "Admin@Kichees2026" },
  { role: "Bakery Head Chef", email: "bakery.chef@kicheesbakeddelights.in", pass: "BakeryChef@Kichees2026" },
  { role: "Confectionery Head Chef", email: "confectionery.chef@kicheesbakeddelights.in", pass: "Confectionery@Kichees2026" },
  { role: "Kichees Cafe Staff", email: "cafe.staff@kicheesbakeddelights.in", pass: "CafeStaff@Kichees2026" },
];

async function testAll() {
  for (const a of accounts) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: a.email,
      password: a.pass,
    });
    if (error) {
      console.error(`✕ ${a.role} failed:`, error.message);
    } else {
      console.log(`✓ ${a.role} (${a.email}) authenticated successfully! User ID: ${data.user.id}`);
    }
  }
}

testAll();
