import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { BlogPost } from "@/lib/cms/types";

// GET /api/cms/blogs - Get all blogs
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const posts: BlogPost[] = (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      coverImage: row.cover_image || "/images/hero-truffle.jpg",
      excerpt: row.excerpt || "",
      author: row.author || "Kichees Editorial",
      publishedAt: row.published_at || new Date().toISOString(),
      status: row.status as any,
      category: row.category || "Guides & Features",
      blocks: row.content || [],
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
    }));

    return NextResponse.json({ posts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/cms/blogs - Upsert a blog
export async function POST(req: NextRequest) {
  try {
    const post: BlogPost = await req.json();

    const { error } = await supabaseAdmin
      .from("blog_posts")
      .upsert({
        id: post.id,
        title: post.title,
        slug: post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        cover_image: post.coverImage,
        excerpt: post.excerpt,
        author: post.author,
        category: post.category,
        status: post.status,
        content: post.blocks,
        seo_title: post.seoTitle,
        seo_description: post.seoDescription,
        published_at: post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString(),
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, post });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/cms/blogs - Delete a blog post
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("blog_posts")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
