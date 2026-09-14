"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  Plus,
  Save,
  CheckCircle2,
  ExternalLink,
  Eye,
  Trash2,
  Sparkles,
  ArrowRight,
  BookOpen,
  Layout,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BlockList } from "@/components/admin/cms/BlockList";
import { BlockInspector } from "@/components/admin/cms/BlockInspector";
import { LivePreviewFrame } from "@/components/admin/cms/LivePreviewFrame";
import {
  getLandingPageBlocks,
  updateLandingPageBlocks,
  getBlogPosts,
  saveBlogPost,
  deleteBlogPost,
  subscribeCms,
} from "@/lib/cms/cms-store";
import { ContentBlock, BlockType, BlogPost } from "@/lib/cms/types";

export default function AdminCmsPage() {
  const [activeTab, setActiveTab] = useState<"landing_editor" | "blogs">("landing_editor");

  // Landing Page Blocks State
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Blogs State
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isNewBlogOpen, setIsNewBlogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  // New/Edit Blog Form State
  const [blogTitle, setBlogTitle] = useState("");
  const [blogCategory, setBlogCategory] = useState("Guides & Recipes");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogCoverImage, setBlogCoverImage] = useState("/images/hero-truffle.jpg");
  const [blogStatus, setBlogStatus] = useState<"Published" | "Draft">("Published");
  const [blogBlocks, setBlogBlocks] = useState<ContentBlock[]>([]);

  // Load from store
  useEffect(() => {
    setBlocks(getLandingPageBlocks());
    setBlogs(getBlogPosts());
    if (getLandingPageBlocks().length > 0) {
      setSelectedBlockId(getLandingPageBlocks()[0].id);
    }

    return subscribeCms(() => {
      setBlocks(getLandingPageBlocks());
      setBlogs(getBlogPosts());
    });
  }, []);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || null;

  // Handlers for Landing Page Blocks
  const handleSelectBlock = (id: string) => {
    setSelectedBlockId(id);
  };

  const handleReorderBlocks = (newBlocks: ContentBlock[]) => {
    setBlocks(newBlocks);
  };

  const handleAddBlock = (type: BlockType) => {
    const newId = `block-${type}-${Date.now()}`;
    let newBlock: ContentBlock;

    switch (type) {
      case "hero":
        newBlock = {
          id: newId,
          type: "hero",
          isVisible: true,
          badge: "Specialty Bakes • Nungambakkam",
          headline: "Slow-Crafted Artisanal Delights",
          subline: "Fresh from the morning oven. Doorstep delivery across Chennai.",
          primaryCtaText: "Explore Bakes",
          primaryCtaLink: "#signature-cakes",
          secondaryCtaText: "Custom Cakes",
          secondaryCtaLink: "#custom-cakes",
          imageUrl: "/images/hero-truffle.jpg",
        };
        break;
      case "product_showcase":
        newBlock = {
          id: newId,
          type: "product_showcase",
          isVisible: true,
          title: "Fresh from Our Ovens",
          subtitle: "Discover today's morning bake selections.",
          categoryFilter: "all",
        };
        break;
      case "gallery":
        newBlock = {
          id: newId,
          type: "gallery",
          isVisible: true,
          title: "Kitchen Gallery",
          subtitle: "Moments from our pastry chefs and oven trays.",
          images: [
            { id: "g-new-1", url: "/images/hero-truffle.jpg", caption: "Chocolate Gateau" },
            { id: "g-new-2", url: "/images/fudge-brownies.jpg", caption: "Fresh Fudge Brownies" },
          ],
        };
        break;
      case "rich_text":
        newBlock = {
          id: newId,
          type: "rich_text",
          isVisible: true,
          title: "Our Heritage & Story",
          subtitle: "Slow Baking in Chennai",
          content: "Every morning at 5:00 AM our kitchen lights turn on to bake small, unhurried batches.",
          quote: "Pure ingredients make unforgettable celebrations.",
        };
        break;
      case "cta_banner":
        newBlock = {
          id: newId,
          type: "cta_banner",
          isVisible: true,
          title: "Plan Your Weekend Celebration",
          subtitle: "Customized cakes and party platters delivered fresh.",
          buttonText: "Order on WhatsApp",
          buttonLink: "https://wa.me/919840000000",
        };
        break;
      default:
        newBlock = {
          id: newId,
          type,
          isVisible: true,
          title: `${type.toUpperCase()} Section`,
          subtitle: "Configured section block",
        } as any;
    }

    const updated = [...blocks, newBlock];
    setBlocks(updated);
    setSelectedBlockId(newId);
  };

  const handleDeleteBlock = (id: string) => {
    const updated = blocks.filter((b) => b.id !== id);
    setBlocks(updated);
    if (selectedBlockId === id) {
      setSelectedBlockId(updated[0]?.id || null);
    }
  };

  const handleToggleVisibility = (id: string) => {
    const updated = blocks.map((b) =>
      b.id === id ? { ...b, isVisible: !b.isVisible } : b
    );
    setBlocks(updated);
  };

  const handleUpdateActiveBlock = (updatedBlock: ContentBlock) => {
    const updated = blocks.map((b) =>
      b.id === updatedBlock.id ? updatedBlock : b
    );
    setBlocks(updated);
  };

  const handleSaveLandingPage = () => {
    updateLandingPageBlocks(blocks);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Handlers for Blog Posts
  const handleOpenNewBlog = () => {
    setEditingBlog(null);
    setBlogTitle("");
    setBlogCategory("Guides & Recipes");
    setBlogExcerpt("");
    setBlogCoverImage("/images/hero-truffle.jpg");
    setBlogStatus("Published");
    setBlogBlocks([
      {
        id: `bb-1`,
        type: "rich_text",
        isVisible: true,
        title: "Introduction",
        content: "Write your bakery story or recipe guide here...",
      },
      {
        id: `bb-2`,
        type: "gallery",
        isVisible: true,
        title: "Bake Showcase Gallery",
        subtitle: "Photos from the counter",
        images: [
          { id: "bgi-1", url: "/images/hero-truffle.jpg", caption: "Freshly baked cake" },
          { id: "bgi-2", url: "/images/fudge-brownies.jpg", caption: "Warm chocolate brownies" },
        ],
      },
      {
        id: `bb-3`,
        type: "product_showcase",
        isVisible: true,
        title: "Order Featured Bakes",
        subtitle: "Available for same-day delivery in Chennai",
        categoryFilter: "all",
      },
    ]);
    setIsNewBlogOpen(true);
  };

  const handleSaveBlogPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim()) return;

    const slug = blogTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const post: BlogPost = {
      id: editingBlog ? editingBlog.id : `blog-${Date.now()}`,
      title: blogTitle.trim(),
      slug,
      coverImage: blogCoverImage,
      excerpt: blogExcerpt || `A story from the Kichees artisanal bakery.`,
      author: "Kichees Editorial",
      publishedAt: "Today",
      status: blogStatus,
      category: blogCategory,
      blocks: blogBlocks,
      seoTitle: `${blogTitle.trim()} | Kichees Bakery`,
      seoDescription: blogExcerpt,
    };

    saveBlogPost(post);
    setIsNewBlogOpen(false);
  };

  const handleDeleteBlog = (id: string) => {
    deleteBlogPost(id);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Website & Content Customizer
          </h1>
          <p className="text-sm text-stone-500">
            Shopify-style block editor to customize the landing page, swap photos, and publish blogs per PRODUCT.md Sections 30-32.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-3">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            className="w-auto"
          >
            <TabsList className="bg-stone-100">
              <TabsTrigger value="landing_editor" className="text-xs gap-1.5">
                <Layout className="h-3.5 w-3.5" />
                Landing Page Editor
              </TabsTrigger>
              <TabsTrigger value="blogs" className="text-xs gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                Blog & Content Pages ({blogs.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* TAB 1: LANDING PAGE VISUAL BLOCK EDITOR */}
      {activeTab === "landing_editor" && (
        <div className="space-y-4">
          {/* Editor Action Bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-stone-200 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-stone-800">
                Customizing: <strong>Storefront Homepage (/)</strong>
              </span>
              {saveSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Changes Published to Storefront!</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 font-medium px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50"
              >
                <span>View Live Site</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <Button
                onClick={handleSaveLandingPage}
                className="bg-amber-900 hover:bg-amber-950 text-white text-xs h-8 shadow-sm gap-1.5 font-bold"
              >
                <Save className="h-3.5 w-3.5" />
                Save & Publish
              </Button>
            </div>
          </div>

          {/* Split Customizer: Left (Block Controls) | Right (Live Preview Canvas) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[640px]">
            {/* Left Column: Block Sections List & Active Inspector */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Sections List */}
              <div className="h-64">
                <BlockList
                  blocks={blocks}
                  selectedBlockId={selectedBlockId}
                  onSelectBlock={handleSelectBlock}
                  onReorder={handleReorderBlocks}
                  onAddBlock={handleAddBlock}
                  onDeleteBlock={handleDeleteBlock}
                  onToggleVisibility={handleToggleVisibility}
                />
              </div>

              {/* Inspector for the Selected Block */}
              <div className="flex-1 min-h-[380px]">
                <BlockInspector
                  block={selectedBlock}
                  onUpdateBlock={handleUpdateActiveBlock}
                />
              </div>
            </div>

            {/* Right Column: Live Responsive Preview Canvas */}
            <div className="lg:col-span-7 h-full min-h-[640px]">
              <LivePreviewFrame blocks={blocks} />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BLOG POSTS & CONTENT PAGES */}
      {activeTab === "blogs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900">
              Published Articles & Guides ({blogs.length})
            </h2>
            <Button
              onClick={handleOpenNewBlog}
              className="bg-amber-900 hover:bg-amber-950 text-white text-xs h-9 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Write New Blog Article
            </Button>
          </div>

          {/* Blogs Table */}
          <div className="rounded-xl border border-stone-200 bg-white shadow-xs overflow-hidden">
            <Table>
              <TableHeader className="bg-stone-50/70">
                <TableRow>
                  <TableHead className="w-16 text-xs font-semibold">Cover</TableHead>
                  <TableHead className="text-xs font-semibold">Article Title</TableHead>
                  <TableHead className="text-xs font-semibold">Category</TableHead>
                  <TableHead className="text-xs font-semibold">Embedded Blocks</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold">Date</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogs.map((blog) => (
                  <TableRow key={blog.id} className="hover:bg-stone-50/50">
                    <TableCell>
                      <div className="relative h-10 w-12 rounded overflow-hidden border border-stone-200 bg-stone-100">
                        <Image
                          src={blog.coverImage || "/images/hero-truffle.jpg"}
                          alt={blog.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-stone-900">
                        {blog.title}
                      </div>
                      <div className="text-[10px] font-mono text-stone-400">
                        /blog/{blog.slug}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-stone-600">
                      {blog.category}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {blog.blocks.map((b) => (
                          <span
                            key={b.id}
                            className="bg-stone-100 text-stone-700 rounded px-1.5 py-0.5 text-[10px]"
                          >
                            {b.type.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={blog.status === "Published" ? "success" : "secondary"}
                        className="text-[10px]"
                      >
                        {blog.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-stone-500">
                      {blog.publishedAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteBlog(blog.id)}
                        className="h-7 w-7 text-stone-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Write / Edit Blog Article Dialog */}
      <Dialog open={isNewBlogOpen} onOpenChange={setIsNewBlogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Write New Blog Article</DialogTitle>
            <DialogDescription>
              Create articles with embedded photo galleries and product showcases per PRODUCT.md Section 32.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveBlogPost} className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-stone-700">Article Title</label>
              <Input
                placeholder="e.g. 5 Reasons to Choose Slow-Fermented Artisanal Bagels"
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700">Category</label>
                <Input
                  value={blogCategory}
                  onChange={(e) => setBlogCategory(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700">Publish Status</label>
                <select
                  value={blogStatus}
                  onChange={(e) => setBlogStatus(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-stone-200 px-3 bg-white text-xs"
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-stone-700">Excerpt Summary</label>
              <textarea
                rows={2}
                value={blogExcerpt}
                onChange={(e) => setBlogExcerpt(e.target.value)}
                placeholder="Brief hook for social previews and SEO meta description..."
                className="w-full rounded-md border border-stone-200 p-2 text-xs"
              />
            </div>

            {/* Embedded Blocks in this Blog Post */}
            <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900">
                  Embedded Section Blocks in Article ({blogBlocks.length})
                </span>
                <span className="text-[10px] text-stone-500">
                  Includes Photo Gallery & Product Showcase
                </span>
              </div>

              <div className="space-y-1.5">
                {blogBlocks.map((b, idx) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-2 rounded bg-white border border-stone-200"
                  >
                    <span className="font-semibold text-stone-800">
                      {idx + 1}. {b.type.toUpperCase()}: {"title" in b ? b.title : b.type}
                    </span>
                    <Badge variant="outline" className="text-[9px]">
                      {b.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewBlogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-amber-900 hover:bg-amber-950 text-white font-bold"
              >
                Publish Article
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
