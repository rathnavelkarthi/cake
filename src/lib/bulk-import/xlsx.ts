/**
 * Spreadsheet reader supporting XLSX, XLS, CSV and TSV formats using SheetJS (xlsx).
 *
 * Normalises sheet data into Record<string, string>[] matching the exact output
 * expected by our schemas and parseProductSheet / parseRawMaterialSheet pipelines.
 */

import * as XLSX from "xlsx";
import { normaliseHeader, parseDelimited, toRecords } from "./csv";

export interface ParsedSpreadsheet {
  headers: string[];
  records: Record<string, string>[];
  sheetName?: string;
  totalRows: number;
}

/**
 * Reads any supported file (xlsx, xls, csv, tsv, txt) into normalised records.
 */
export async function readSpreadsheetFile(file: File): Promise<ParsedSpreadsheet> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  // If CSV or text, try plain text first (preserves fastest path), or fallback to SheetJS
  if (extension === "csv" || extension === "txt" || extension === "tsv") {
    try {
      const text = await file.text();
      const delimiter = extension === "tsv" ? "\t" : undefined;
      const { rows } = parseDelimited(text, delimiter);
      const { headers, records } = toRecords(rows);
      return {
        headers,
        records,
        totalRows: records.length,
      };
    } catch (e) {
      console.warn("Plain text parse failed, falling back to XLSX reader:", e);
    }
  }

  // Use SheetJS for Excel files (.xlsx, .xls) and binary CSVs
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    return { headers: [], records: [], totalRows: 0 };
  }

  const worksheet = workbook.Sheets[sheetName];
  // header: 1 returns an array of arrays (rows)
  const rawRows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
    raw: false, // formatted strings so dates/numbers read naturally
  }) as (string | number | boolean | null | undefined)[][];

  if (rawRows.length === 0) {
    return { headers: [], records: [], sheetName, totalRows: 0 };
  }

  // Convert all cells to strings
  const stringRows: string[][] = rawRows
    .map((row) => row.map((cell) => (cell === null || cell === undefined ? "" : String(cell).trim())))
    .filter((row) => row.some((c) => c.length > 0));

  if (stringRows.length === 0) {
    return { headers: [], records: [], sheetName, totalRows: 0 };
  }

  const rawHeaders = stringRows[0];
  const headers = rawHeaders.map((h) => normaliseHeader(h));

  const records: Record<string, string>[] = [];
  for (let i = 1; i < stringRows.length; i++) {
    const row = stringRows[i];
    const record: Record<string, string> = {};
    headers.forEach((header, colIdx) => {
      record[header] = row[colIdx] ?? "";
    });
    records.push(record);
  }

  return {
    headers,
    records,
    sheetName,
    totalRows: records.length,
  };
}

/**
 * Creates and triggers a download of an XLSX file with styled columns and header.
 */
export function exportToXlsx(
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][],
  filename: string,
  sheetName = "Sheet1"
): void {
  const data = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Set column widths based on longest cell
  const colWidths = headers.map((header, colIdx) => {
    let maxLen = header.length;
    for (const row of rows) {
      const val = row[colIdx];
      if (val !== undefined && val !== null) {
        maxLen = Math.max(maxLen, String(val).length);
      }
    }
    return { wch: Math.min(Math.max(maxLen + 3, 12), 50) };
  });
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}
