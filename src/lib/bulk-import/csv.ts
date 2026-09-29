/**
 * Dependency-free CSV / TSV reader.
 *
 * Written by hand rather than pulled from npm so bulk import adds nothing to
 * the client bundle. It handles what a bakery actually exports from Excel:
 *
 *  - UTF-8 BOM (Excel writes one, and it corrupts the first header name)
 *  - comma / semicolon / tab / pipe delimiters
 *  - CRLF and LF line endings
 *  - RFC 4180 quoted fields, including "" escapes and embedded newlines
 *  - ragged rows (short rows are padded, long rows are reported)
 */

export type CellMatrix = string[][];

export interface ParseCsvResult {
  rows: CellMatrix;
  delimiter: string;
  /** Rows that had more cells than the header row. */
  raggedRows: { rowNumber: number; cellCount: number }[];
}

const DELIMITER_CANDIDATES = [",", ";", "\t", "|"];

/** Guesses the delimiter by counting candidates outside of quoted sections. */
export function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim().length > 0) ?? "";
  let best = ",";
  let bestCount = 0;

  for (const candidate of DELIMITER_CANDIDATES) {
    let count = 0;
    let inQuotes = false;
    for (let i = 0; i < firstLine.length; i += 1) {
      const char = firstLine[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (!inQuotes && char === candidate) {
        count += 1;
      }
    }
    if (count > bestCount) {
      best = candidate;
      bestCount = count;
    }
  }

  return best;
}

/** Splits CSV/TSV text into rows of raw cell strings. */
export function parseDelimited(text: string, delimiter?: string): ParseCsvResult {
  // Strip BOM and normalise line endings before we start walking characters.
  const clean = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const sep = delimiter ?? detectDelimiter(clean);

  const rows: CellMatrix = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < clean.length; i += 1) {
    const char = clean[i];

    if (inQuotes) {
      if (char === '"') {
        // "" inside a quoted field is a literal quote.
        if (clean[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"' && cell.trim() === "") {
      // Opening quote for a field that had leading whitespace.
      cell = "";
      inQuotes = true;
      continue;
    }

    if (char === sep) {
      row.push(cell);
      cell = "";
      continue;
    }

    if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  // Flush the trailing cell/row unless the file ended with a newline.
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  // Drop entirely blank lines so a stray newline in the export is harmless.
  const nonBlank = rows.filter((r) => r.some((value) => value.trim().length > 0));

  const width = nonBlank.reduce((max, r) => Math.max(max, r.length), 0);
  const raggedRows: { rowNumber: number; cellCount: number }[] = [];
  const padded: CellMatrix = nonBlank.map((r, index) => {
    if (r.length > width) {
      raggedRows.push({ rowNumber: index + 1, cellCount: r.length });
    }
    return Array.from({ length: width }, (_, col) => (r[col] ?? "").trim());
  });

  return { rows: padded, delimiter: sep, raggedRows };
}

/** Escapes a single value for CSV output. */
export function escapeCsvValue(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/** Builds CSV text from a header row and body rows. */
export function toCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const lines = [headers.map(escapeCsvValue).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCsvValue).join(","));
  }
  return lines.join("\r\n");
}

/**
 * Turns a pasted Excel selection (tab separated, newline separated) into the
 * same shape parseDelimited produces, so both entry points share one code path.
 */
export function parseClipboard(text: string): CellMatrix {
  const { rows } = parseDelimited(text.replace(/\r\n?/g, "\n"), "\t");
  return rows.filter((r) => r.some((value) => value.trim().length > 0));
}

/** Converts a sheet of cells into objects keyed by normalised header names. */
export function toRecords(
  rows: CellMatrix
): { headers: string[]; records: Record<string, string>[] } {
  if (rows.length === 0) return { headers: [], records: [] };

  const headers = rows[0].map((h) => normaliseHeader(h));
  const records = rows.slice(1).map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = row[index] ?? "";
    });
    return record;
  });

  return { headers, records };
}

/** Lowercases, trims and collapses separators so "Sale Price" === "sale_price". */
export function normaliseHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
