import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CDN_BASE = "https://uiftoqlzlarfkfzqnedk.supabase.co/storage/v1/object/public/custom-cakes";

async function main() {
  const { data: prods } = await supabase.from("products").select("id, name, image_url, images");
  if (!prods) return;

  let updated = 0;
  for (const p of prods) {
    if (p.image_url && p.image_url.startsWith("/custom-cakes/")) {
      const fileName = p.image_url.replace("/custom-cakes/", "");
      const newUrl = `${CDN_BASE}/${fileName}`;
      await supabase
        .from("products")
        .update({
          image_url: newUrl,
          images: [newUrl],
        })
        .eq("id", p.id);
      updated++;
      console.log(`✓ Updated ${p.name}: ${newUrl}`);
    }
  }

  console.log(`\nUpdated ${updated} products in Supabase to use Supabase Storage CDN URLs!`);
}

main().catch(console.error);
