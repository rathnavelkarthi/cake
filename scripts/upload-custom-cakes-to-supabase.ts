import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: path.resolve(".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("=== Creating Supabase Storage Bucket for Custom Cakes ===");

  const bucketName = "custom-cakes";

  // Check if bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === bucketName);

  if (!exists) {
    const { data: created, error: createErr } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/jpg"],
    });

    if (createErr) {
      console.error("Error creating bucket:", createErr);
      return;
    }
    console.log(`✓ Bucket '${bucketName}' created successfully as PUBLIC!`);
  } else {
    console.log(`✓ Bucket '${bucketName}' already exists.`);
  }

  // Directory of custom cakes
  const dirPath = path.resolve("public/custom-cakes");
  const files = fs.readdirSync(dirPath);

  // Focus on the cake-*.jpg files and distinct photos
  const targetFiles = files.filter(f => f.startsWith("cake-") || f.startsWith("Photo from Kichi"));

  console.log(`Uploading ${targetFiles.length} custom cake photos to Supabase Storage...`);

  let successCount = 0;
  for (const fileName of targetFiles) {
    const filePath = path.join(dirPath, fileName);
    const fileBuffer = fs.readFileSync(filePath);
    const cleanFileName = fileName.replace(/\s+/g, "-").toLowerCase();

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(cleanFileName, fileBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error(`Failed to upload ${fileName}:`, error.message);
    } else {
      successCount++;
      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(cleanFileName);
      if (successCount <= 5 || successCount === targetFiles.length) {
        console.log(`✓ Uploaded ${cleanFileName} -> ${publicUrlData.publicUrl}`);
      }
    }
  }

  console.log(`\n🎉 Successfully uploaded ${successCount} custom cake photos to Supabase Storage '${bucketName}'!`);
}

main().catch(console.error);
