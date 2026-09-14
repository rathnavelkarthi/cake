"use client";

import React, { useState } from "react";
import {
  Layers,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Image as ImageIcon,
  ShoppingBag,
  FileText,
  MessageSquare,
  HelpCircle,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContentBlock, BlockType } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

interface BlockListProps {
  blocks: ContentBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onReorder: (newBlocks: ContentBlock[]) => void;
  onAddBlock: (type: BlockType) => void;
  onDeleteBlock: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

const BLOCK_META: Record<
  BlockType,
  { label: string; icon: React.ComponentType<{ className?: string }>; desc: string }
> = {
  hero: {
    label: "Hero Banner",
    icon: ImageIcon,
    desc: "Large headline, background image, and primary call-to-action.",
  },
  product_showcase: {
    label: "Product Showcase",
    icon: ShoppingBag,
    desc: "Dynamic grid of cakes, bagels, or bakes from inventory.",
  },
  gallery: {
    label: "Image Gallery",
    icon: ImageIcon,
    desc: "Photo showcase grid or carousel of bakery bakes.",
  },
  rich_text: {
    label: "Story & Rich Text",
    icon: FileText,
    desc: "Editorial paragraphs, kitchen philosophy, and quotes.",
  },
  reviews: {
    label: "Customer Reviews",
    icon: MessageSquare,
    desc: "Customer testimonials and star ratings.",
  },
  faq: {
    label: "FAQ Accordion",
    icon: HelpCircle,
    desc: "Expandable questions regarding ordering and delivery.",
  },
  cta_banner: {
    label: "CTA Banner",
    icon: Megaphone,
    desc: "High-contrast promotional strip to drive orders.",
  },
};

export function BlockList({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onReorder,
  onAddBlock,
  onDeleteBlock,
  onToggleVisibility,
}: BlockListProps) {
  const [isAddPickerOpen, setIsAddPickerOpen] = useState(false);

  const handleMoveUp = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === 0) return;
    const newArr = [...blocks];
    const temp = newArr[index - 1];
    newArr[index - 1] = newArr[index];
    newArr[index] = temp;
    onReorder(newArr);
  };

  const handleMoveDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === blocks.length - 1) return;
    const newArr = [...blocks];
    const temp = newArr[index + 1];
    newArr[index + 1] = newArr[index];
    newArr[index] = temp;
    onReorder(newArr);
  };

  const handlePickBlock = (type: BlockType) => {
    onAddBlock(type);
    setIsAddPickerOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-stone-200 bg-stone-50/70">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-amber-900" />
          <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
            Page Sections ({blocks.length})
          </span>
        </div>
        <Button
          size="sm"
          onClick={() => setIsAddPickerOpen(true)}
          className="h-7 text-xs bg-amber-900 hover:bg-amber-950 text-white font-medium"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Block
        </Button>
      </div>

      {/* Block List Items */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {blocks.map((block, index) => {
          const meta = BLOCK_META[block.type] || {
            label: block.type,
            icon: Layers,
            desc: "",
          };
          const Icon = meta.icon;
          const isSelected = block.id === selectedBlockId;

          return (
            <div
              key={block.id}
              onClick={() => onSelectBlock(block.id)}
              className={cn(
                "group flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all",
                isSelected
                  ? "border-amber-900 bg-amber-900/5 shadow-xs"
                  : "border-stone-200 hover:border-stone-300 hover:bg-stone-50/70",
                !block.isVisible && "opacity-50 bg-stone-100/50"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md shrink-0",
                    isSelected
                      ? "bg-amber-900 text-amber-50"
                      : "bg-stone-100 text-stone-600"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-stone-900 truncate">
                    {meta.label}
                  </p>
                  <p className="text-[10px] text-stone-400 truncate">
                    {"title" in block
                      ? (block as { title?: string }).title
                      : "headline" in block
                      ? (block as { headline?: string }).headline
                      : (block as { type?: string }).type}
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-0.5 shrink-0">
                {/* Move Up */}
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={index === 0}
                  onClick={(e) => handleMoveUp(index, e)}
                  className="h-6 w-6 text-stone-400 hover:text-stone-900"
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>

                {/* Move Down */}
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={index === blocks.length - 1}
                  onClick={(e) => handleMoveDown(index, e)}
                  className="h-6 w-6 text-stone-400 hover:text-stone-900"
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>

                {/* Visibility Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(block.id);
                  }}
                  className="h-6 w-6 text-stone-400 hover:text-stone-900"
                >
                  {block.isVisible ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-stone-400" />
                  )}
                </Button>

                {/* Delete */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBlock(block.id);
                  }}
                  className="h-6 w-6 text-stone-400 hover:text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Block Picker Modal */}
      <Dialog open={isAddPickerOpen} onOpenChange={setIsAddPickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Content Section</DialogTitle>
            <DialogDescription>
              Select a section block type to insert into your page layout.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-2 py-2">
            {(Object.keys(BLOCK_META) as BlockType[]).map((type) => {
              const item = BLOCK_META[type];
              const Icon = item.icon;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handlePickBlock(type)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 hover:border-amber-900 hover:bg-amber-900/5 text-left transition-all group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-900/10 text-amber-900 group-hover:bg-amber-900 group-hover:text-amber-50 transition-colors shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-stone-500">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
