import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const originalExt = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const cleanExt = (originalExt || "jpg").toLowerCase();
    const fileName = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${cleanExt}`;

    const { data, error: uploadError } = await supabaseAdmin.storage
      .from("custom-cakes")
      .upload(fileName, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("custom-cakes")
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      path: data?.path || fileName,
    });
  } catch (err: any) {
    console.error("API error in POST /api/upload:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
