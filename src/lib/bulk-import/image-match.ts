/**
 * Matches a folder of product photos to the products being imported.
 *
 * Staff rename photos to whatever makes sense to them, so we walk a ladder of
 * keys before giving up: an explicit filename in the sheet, the SKU, the exact
 * normalised name, the slug, then a containment check in both directions.
 */

export interface ImageTarget {
  /** Index into the parsed row array, so callers can map back. */
  index: number;
  name: string;
  slug?: string;
  sku?: string;
  /** The `image` column value from the sheet, if the client filled one in. */
  imageHint?: string;
}

export type MatchReason = "hint" | "sku" | "name" | "slug" | "contains" | "unmatched";

export interface ImageMatch {
  target: ImageTarget;
  file: File | null;
  /** How we matched, shown in the review table so the choice is auditable. */
  reason: MatchReason;
}

export interface ImageMatchResult {
  matches: ImageMatch[];
  /** Files no product claimed, surfaced so they are not silently dropped. */
  unused: { file: File; base: string }[];
}

interface PoolEntry {
  file: File;
  base: string;
  key: string;
  loose: string;
}

export function normaliseKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function baseName(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "");
}

/**
 * Tolerates the suffixes cameras and design tools append, so "cake (1)" and
 * "cake-final" still resolve to a product called "Cake".
 */
function looseKey(value: string): string {
  return normaliseKey(value)
    .replace(/\b(copy|final|edited|small|new|resized)\b/g, "")
    .replace(/\s*\d+\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchImages(files: File[], targets: ImageTarget[]): ImageMatchResult {
  const available: PoolEntry[] = files.map((file) => {
    const base = baseName(file.name);
    return { file, base, key: normaliseKey(base), loose: looseKey(base) };
  });

  const take = (predicate: (entry: PoolEntry) => boolean): PoolEntry | null => {
    const found = available.find(predicate);
    if (found) available.splice(available.indexOf(found), 1);
    return found ?? null;
  };

  const matches: ImageMatch[] = [];

  for (const target of targets) {
    const nameKey = normaliseKey(target.name);
    const looseName = looseKey(target.name);
    const skuKey = target.sku ? normaliseKey(target.sku) : "";
    const slugKey = target.slug ? normaliseKey(target.slug) : "";
    const hintKey = target.imageHint ? normaliseKey(baseName(target.imageHint)) : "";

    const attempts: { reason: MatchReason; predicate: (entry: PoolEntry) => boolean }[] = [];

    // 1. Explicit filename from the sheet. Compared loosely so a full path or a
    //    slightly different extension still resolves.
    if (hintKey) {
      attempts.push({
        reason: "hint",
        predicate: (e) => e.key === hintKey || e.loose === looseKey(target.imageHint ?? ""),
      });
    }
    // 2. SKU, for teams photographing against a printed sheet.
    if (skuKey) {
      attempts.push({
        reason: "sku",
        predicate: (e) => e.key === skuKey || e.loose === skuKey,
      });
    }
    // 3. Exact name, then the slug.
    attempts.push({
      reason: "name",
      predicate: (e) => e.key === nameKey || e.loose === looseName,
    });
    if (slugKey) {
      attempts.push({ reason: "slug", predicate: (e) => e.key === slugKey || e.loose === slugKey });
    }
    // 4. Either string containing the other, which catches
    //    "chocolate truffle cake" against "chocolate-truffle-cake-01".
    if (nameKey.length >= 4) {
      attempts.push({
        reason: "contains",
        predicate: (e) =>
          (e.key.length >= 4 && e.key.includes(nameKey)) ||
          (e.key.length >= 4 && nameKey.includes(e.key)),
      });
    }

    let entry: PoolEntry | null = null;
    let reason: MatchReason = "unmatched";
    for (const attempt of attempts) {
      entry = take(attempt.predicate);
      if (entry) {
        reason = attempt.reason;
        break;
      }
    }

    matches.push({ target, file: entry?.file ?? null, reason });
  }

  return {
    matches,
    unused: available.map((entry) => ({ file: entry.file, base: entry.base })),
  };
}

/** Accept attribute for the photo picker. */
export const IMAGE_ACCEPT = "image/png,image/jpeg,image/jpg,image/webp,image/avif";
