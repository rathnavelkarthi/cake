/**
 * Verification harness for the bulk import parsers.
 *
 * The parsing layer is pure and holds all the tricky logic (CSV quirks, recipe
 * strings, photo matching), so it is worth testing directly rather than only
 * through the UI. Run with: npx tsx scripts/check-bulk-import.ts
 */
import { parseDelimited, toRecords, detectDelimiter, toCsv } from "../src/lib/bulk-import/csv";
import {
  parseRecipeCell,
  matchRawMaterial,
  parseProductSheet,
  parseRawMaterialSheet,
  parseBoolean,
  parseNumber,
  parseUnit,
  summarise,
} from "../src/lib/bulk-import/schemas";
import { matchImages } from "../src/lib/bulk-import/image-match";

let passed = 0;
const failures: string[] = [];

function check(label: string, condition: boolean, detail?: unknown) {
  if (condition) {
    passed += 1;
  } else {
    failures.push(`${label}${detail !== undefined ? ` -> ${JSON.stringify(detail)}` : ""}`);
  }
}

const catalogue = [
  { id: 1, name: "Refined Wheat Flour (Maida)", sku: "RAW-FLOUR-01", category: "Flours & Grains", stock: 50, unit: "kg" as const, minThreshold: 15, costPerUnit: 48 },
  { id: 3, name: "54% Callebaut Dark Belgian Chocolate", sku: "RAW-CHOC-01", category: "Chocolates & Cocoa", stock: 22.5, unit: "kg" as const, minThreshold: 8, costPerUnit: 850 },
  { id: 4, name: "Unsalted Dairy Butter", sku: "RAW-BUTTER-01", category: "Dairy & Fats", stock: 28, unit: "kg" as const, minThreshold: 6, costPerUnit: 520 },
  { id: 5, name: "Granulated White Sugar", sku: "RAW-SUGAR-01", category: "Sugars", stock: 45, unit: "kg" as const, minThreshold: 12, costPerUnit: 45 },
  { id: 8, name: "Heavy Dairy Whipping Cream", sku: "RAW-CREAM-01", category: "Dairy & Fats", stock: 20, unit: "l" as const, minThreshold: 5, costPerUnit: 220 },
];

const existingProducts = [
  { id: "kch-prod-1", name: "Fudge Brownie", sku: "KCH-1001", slug: "fudge-brownie" },
];

/* -------------------------------------------------------------------------- */
/* CSV                                                                         */
/* -------------------------------------------------------------------------- */

{
  // Excel writes CRLF and a UTF-8 BOM; both must not corrupt the header.
  const csv = '\uFEFFProduct Name,Selling Price\r\nChocolate Truffle,750\r\nFudge Brownie,480\r\n';
  const { rows } = parseDelimited(csv);
  check("csv: strips BOM", rows[0][0] === "Product Name", rows[0][0]);
  check("csv: row count", rows.length === 3, rows.length);
  check("csv: values", rows[1][1] === "750", rows[1]);
}

{
  // A description containing a comma must not shift every later column.
  const csv = 'name,description\nCake,"Rich, moist and dense"\n';
  const { rows } = parseDelimited(csv);
  check("csv: quoted comma", rows[1][1] === "Rich, moist and dense", rows[1]);
  check("csv: column count stable", rows[1].length === 2, rows[1]);
}

{
  // "" is the escape for a literal quote inside a quoted field.
  const csv = 'name,notes\nCake,"He said ""Happy Birthday"" loudly"\n';
  const { rows } = parseDelimited(csv);
  check("csv: escaped quotes", rows[1][1] === 'He said "Happy Birthday" loudly', rows[1]);
}

{
  // Recipe cells hold semicolons and are the usual reason Excel quotes things.
  const csv = 'name,recipe\nTruffle Cake,"Chocolate 300g; Butter 180g"\n';
  const { rows } = parseDelimited(csv);
  check("csv: quoted semicolon list", rows[1][1] === "Chocolate 300g; Butter 180g", rows[1]);
}

{
  const { rows } = parseDelimited("a\tb\tc\n1\t2\t3\n", "\t");
  check("csv: tab delimited", rows[1].length === 3 && rows[1][2] === "3", rows[1]);
  check("csv: tab detection", detectDelimiter("a\tb\tc\n") === "\t");
}

{
  // Semicolon-delimited is the default in much of Europe.
  const { rows, delimiter } = parseDelimited("name;price\nCake;750\n");
  check("csv: semicolon detection", delimiter === ";", delimiter);
  check("csv: semicolon values", rows[1][1] === "750", rows[1]);
}

{
  // A blank line in the middle must not become a phantom row.
  const { rows } = parseDelimited("name,price\n\nCake,750\n\n");
  check("csv: blank lines dropped", rows.length === 2, rows);
}

{
  // Header names are normalised so "Sale Price" == "sale_price".
  const { records } = toRecords(parseDelimited("Product Name,Sale Price\nCake,699\n").rows);
  check("csv: header normalisation", records[0].product_name === "Cake" && records[0].sale_price === "699", records[0]);
}

{
  // Round trip through the writer used for templates.
  const out = toCsv(["name", "notes"], [["Cake", 'He said "hi", loudly']]);
  const { rows } = parseDelimited(out);
  check("csv: writer round trip", rows[1][1] === 'He said "hi", loudly', rows[1]);
}

/* -------------------------------------------------------------------------- */
/* Coercion                                                                    */
/* -------------------------------------------------------------------------- */

check("bool: veg", parseBoolean("veg", false) === true);
check("bool: nonveg", parseBoolean("Non-Veg", true) === false);
check("bool: yes", parseBoolean("YES", false) === true);
check("bool: blank falls back", parseBoolean("", false) === false);
check("bool: junk returns null", parseBoolean("maybe", true) === null);

check("number: currency stripped", parseNumber("₹1,250.00", 0).value === 1250);
check("number: invalid flagged", parseNumber("abc", 5).invalid === true);
check("number: blank uses fallback", parseNumber("", 7).value === 7);

check("unit: kg", parseUnit("kg") === "kg");
check("unit: spelled litre", parseUnit("Litres") === "l");
check("unit: junk -> null", parseUnit("bananas") === null);

/* -------------------------------------------------------------------------- */
/* Recipes                                                                     */
/* -------------------------------------------------------------------------- */

{
  const { parts } = parseRecipeCell("54% Callebaut Dark Belgian Chocolate 300g; Butter 180g; Sugar 150");
  check("recipe: three parts", parts.length === 3, parts);
  check("recipe: name keeps % and digits", parts[0].name === "54% Callebaut Dark Belgian Chocolate", parts[0]);
  check("recipe: amount parsed", parts[0].amount === 300 && parts[0].unit === "g", parts[0]);
  check("recipe: missing unit defaults to g", parts[2].unit === "g" && parts[2].amount === 150, parts[2]);
}

{
  const { parts } = parseRecipeCell("Cream 200ml | Butter 0.18 kg");
  check("recipe: pipe separator", parts.length === 2, parts);
  check("recipe: ml kept", parts[0].unit === "ml", parts[0]);
  check("recipe: decimal kg", parts[1].amount === 0.18 && parts[1].unit === "kg", parts[1]);
}

{
  // Junk with no amount is surfaced rather than silently dropped.
  const { unparsed } = parseRecipeCell("Chocolate 300g; some vague note");
  check("recipe: unparsed surfaced", unparsed.length === 1 && unparsed[0] === "some vague note", unparsed);
}

{
  const match = matchRawMaterial("54% Callebaut Dark Belgian Chocolate", catalogue);
  check("match: exact", match?.id === 3, match?.id);
  check("match: case/space insensitive", matchRawMaterial("unsalted   dairy BUTTER", catalogue)?.id === 4);
  check("match: partial contains", matchRawMaterial("dairy butter", catalogue)?.id === 4);
  check("match: unknown returns undefined", matchRawMaterial("Saffron", catalogue) === undefined);
}

/* -------------------------------------------------------------------------- */
/* Product sheet                                                               */
/* -------------------------------------------------------------------------- */

{
  const csv = [
    "Product Name,Selling Price,Stock,Recipe,Veg / Non-Veg,Outlet",
    'Fudge Brownie,480,24,"54% Callebaut Dark Belgian Chocolate 250g; Unsalted Dairy Butter 150g",veg,all',
    "Chocolate Truffle,750,10,Granulated White Sugar 150g,veg,harrisons",
  ].join("\n");
  const { records } = toRecords(parseDelimited(csv).rows);
  const { rows } = parseProductSheet(records, {
    catalogue,
    existingProducts,
    autoCreateIngredients: true,
  });
  const stats = summarise(rows);
  check("products: two rows", rows.length === 2, rows.length);
  check("products: existing name is an update", rows[0].action === "update", rows[0].action);
  check("products: new name is a create", rows[1].action === "create", rows[1].action);
  check("products: no errors", stats.errors === 0, stats.issues ?? stats);
  check("products: recipe resolved to 2 ingredients", rows[0].value?.recipe.length === 2, rows[0].value?.recipe);
  check("products: recipe ids mapped", rows[0].value?.recipe[0].rawMaterialId === 3, rows[0].value?.recipe[0]);
  check("products: stock coerced", rows[0].value?.stock === 24, rows[0].value?.stock);
  check("products: retired harrisons maps to single kitchen", rows[1].value?.availableBranches === "nungambakkam", rows[1].value?.availableBranches);
  check("products: branchIds collapsed", rows[1].value?.branchIds.join() === "nungambakkam", rows[1].value?.branchIds);
  check("products: slug built from name", rows[1].value?.slug === "chocolate-truffle", rows[1].value?.slug);
}

{
  // The example row shipped in the template must import with zero errors.
  const csv = [
    "Product Name,Selling Price,Stock Quantity,Low Stock Alert,Veg / Non-Veg,Recipe",
    'Belgian Chocolate Truffle,750,10,5,veg,"54% Callebaut Dark Belgian Chocolate 300g; Refined Wheat Flour (Maida) 250g; Unsalted Dairy Butter 180g; Granulated White Sugar 150g; Heavy Dairy Whipping Cream 200ml"',
  ].join("\n");
  const { records } = toRecords(parseDelimited(csv).rows);
  const { rows } = parseProductSheet(records, { catalogue, existingProducts, autoCreateIngredients: true });
  check("template row: no errors", rows[0].issues.filter((i) => i.severity === "error").length === 0, rows[0].issues);
  check("template row: no unknown ingredients", rows[0].unknownIngredients.length === 0, rows[0].unknownIngredients);
  check("template row: five ingredients", rows[0].value?.recipe.length === 5, rows[0].value?.recipe.length);
}

{
  // Missing required fields must block the row, not write junk.
  const { records } = toRecords(parseDelimited("Product Name,Selling Price\n,750\nCake,abc\n").rows);
  const { rows } = parseProductSheet(records, { catalogue, existingProducts, autoCreateIngredients: false });
  check("products: blank name blocked", rows[0].action === "skip", rows[0].action);
  check("products: bad price blocked", rows[1].action === "skip", rows[1].action);
  check("products: both counted as errors", summarise(rows).errors >= 2, summarise(rows));
}

{
  // Unknown ingredients are flagged; the toggle controls whether we create them.
  const { records } = toRecords(
    parseDelimited("Product Name,Selling Price,Recipe\nCake,500,Saffron 5g\n").rows
  );
  const on = parseProductSheet(records, { catalogue, existingProducts, autoCreateIngredients: true });
  check("products: unknown flagged when auto-create on", on.rows[0].unknownIngredients.length === 1, on.rows[0].unknownIngredients);
  check("products: unknown noted as created", on.rows[0].issues.some((i) => i.message.includes("created")), on.rows[0].issues);
  const off = parseProductSheet(records, { catalogue, existingProducts, autoCreateIngredients: false });
  check("products: unknown recipe dropped when off", off.rows[0].value?.recipe.length === 0, off.rows[0].value?.recipe);
}

{
  // Duplicate names in one file are reported rather than silently last-wins.
  const { records } = toRecords(
    parseDelimited("Product Name,Selling Price\nCake,500\nCake,600\n").rows
  );
  const { rows, problems } = parseProductSheet(records, { catalogue, existingProducts, autoCreateIngredients: false });
  check("products: duplicate reported", problems.length === 1, problems);
  check("products: duplicate keeps last price", rows[1].value?.price === 600, rows[1].value?.price);
}

{
  // Unrecognised columns are surfaced so typos do not silently do nothing.
  const { records } = toRecords(parseDelimited("Product Name,Selling Price,Prise\nCake,500,500\n").rows);
  const { unknownHeaders } = parseProductSheet(records, { catalogue, existingProducts, autoCreateIngredients: false });
  check("products: typo column surfaced", unknownHeaders.includes("prise"), unknownHeaders);
}

{
  // An offer price above the selling price must be ignored, not applied.
  const { records } = toRecords(parseDelimited("Product Name,Selling Price,Sale Price\nCake,500,900\n").rows);
  const { rows } = parseProductSheet(records, { catalogue, existingProducts, autoCreateIngredients: false });
  check("products: bad offer price ignored", rows[0].value?.salePrice === undefined, rows[0].value?.salePrice);
  check("products: bad offer price warned", rows[0].issues.some((i) => i.field === "sale_price"), rows[0].issues);
}

/* -------------------------------------------------------------------------- */
/* Raw material sheet                                                          */
/* -------------------------------------------------------------------------- */

{
  const csv = [
    "Material Name,SKU,Category,Opening Stock,Unit,Low Stock Alert,Cost Per Unit",
    "Organic Rolled Oats,RAW-OATS-01,Cereals,25,kg,6,90",
    "Matcha Powder,RAW-MATCHA-01,Flavours & Extracts,1.5,kg,0.5,2400",
  ].join("\n");
  const { records } = toRecords(parseDelimited(csv).rows);
  const { rows } = parseRawMaterialSheet(records, { existingMaterials: catalogue });
  check("raws: two rows", rows.length === 2, rows.length);
  check("raws: both new", rows.every((r) => r.action === "create"), rows.map((r) => r.action));
  check("raws: decimal stock kept", rows[1].value?.stock === 1.5, rows[1].value?.stock);
  check("raws: unit normalised", rows[0].value?.unit === "kg", rows[0].value?.unit);
  check("raws: no errors", summarise(rows).errors === 0, summarise(rows));
}

{
  // A name that already exists should be flagged as an update, not a new row.
  const { records } = toRecords(
    parseDelimited("Material Name,Opening Stock\nUnsalted Dairy Butter,40\n").rows
  );
  const { rows } = parseRawMaterialSheet(records, { existingMaterials: catalogue });
  check("raws: existing name is update", rows[0].action === "update", rows[0].action);
  check("raws: existing name warned", rows[0].issues.some((i) => i.message.includes("already exists")), rows[0].issues);
}

/* -------------------------------------------------------------------------- */
/* Image matching                                                              */
/* -------------------------------------------------------------------------- */

function fakeFile(name: string): File {
  return new File([new Blob(["x"])], name, { type: "image/jpeg" });
}

{
  const files = [
    fakeFile("belgian-chocolate-truffle.jpg"),
    fakeFile("fudge-brownie.jpg"),
    fakeFile("IMG_20260915_142233.jpg"),
  ];
  const targets = [
    { index: 0, name: "Belgian Chocolate Truffle", slug: "belgian-chocolate-truffle", sku: "KCH-1001" },
    { index: 1, name: "Fudge Brownie", slug: "fudge-brownie", sku: "KCH-1002" },
    { index: 2, name: "Red Velvet Cake", slug: "red-velvet-cake", sku: "KCH-1003" },
  ];
  const { matches, unused } = matchImages(files, targets);
  check("images: matched by name", matches[0].file?.name === "belgian-chocolate-truffle.jpg", matches[0].file?.name);
  check("images: second matched", matches[1].file?.name === "fudge-brownie.jpg", matches[1].file?.name);
  check("images: unmatched stays null", matches[2].file === null, matches[2].file);
  check("images: one unused file reported", unused.length === 1 && unused[0].base === "IMG_20260915_142233", unused.map((u) => u.base));
  check("images: no file used twice", new Set(matches.map((m) => m.file?.name).filter(Boolean)).size === 2);
}

{
  // Camera filenames like "cake (1).jpg" should still land on "Cake".
  const { matches } = matchImages([fakeFile("cake (1).jpg")], [{ index: 0, name: "Cake" }]);
  check("images: loose camera name", matches[0].file?.name === "cake (1).jpg", matches[0].file?.name);
}

{
  // An explicit filename in the sheet beats every heuristic.
  const { matches } = matchImages(
    [fakeFile("hero-shot.png")],
    [{ index: 0, name: "Chocolate Truffle", imageHint: "hero-shot.png" }]
  );
  check("images: hint wins", matches[0].reason === "hint", matches[0].reason);
}

{
  // Two products must not both claim the same photo.
  const { matches } = matchImages(
    [fakeFile("brownie.jpg")],
    [
      { index: 0, name: "Brownie" },
      { index: 1, name: "Fudge Brownie" },
    ]
  );
  const claimed = matches.filter((m) => m.file).length;
  check("images: one photo claimed once", claimed === 1, claimed);
}

/* -------------------------------------------------------------------------- */

console.log(`\n  ${passed} checks passed`);
if (failures.length > 0) {
  console.log(`  ${failures.length} FAILED:\n`);
  for (const failure of failures) console.log(`   x ${failure}`);
  process.exit(1);
}
console.log("  all good\n");
