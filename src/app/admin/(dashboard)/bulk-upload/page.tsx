"use client";

import { use } from "react";
import BulkUploadWorkspace, { type BulkTab } from "@/components/admin/bulk/BulkUploadWorkspace";

export default function AdminBulkUploadPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  // Next 16 delivers searchParams as a promise; `use` unwraps it on the client.
  const { tab } = use(searchParams);
  const initialTab: BulkTab =
    tab === "raw-materials" ? "raw-materials" : tab === "photos" ? "photos" : "products";

  return <BulkUploadWorkspace initialTab={initialTab} />;
}
