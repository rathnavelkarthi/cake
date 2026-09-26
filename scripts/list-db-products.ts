import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data, error } = await supabase.from("products").select("id, name, slug, sku, category_name, category_id");
  if (error) {
    console.error("Error:", error);
    return;
  }
  console.log(`Total in DB: ${data.length}`);
  data.forEach((p, idx) => console.log(`${idx + 1}. [${p.id}] ${p.name} | slug: ${p.slug} | sku: ${p.sku} | cat: ${p.category_name}`));
}

main();
