// Unit-aware scaling for recipes (metric + tsp/tbsp)

type Dim = "mass" | "volume";
type CanonUnit = "g" | "kg" | "ml" | "cl" | "dl" | "l" | "tsp" | "tbsp";

type UnitDef = {
  dim: Dim;
  toBase: (n: number) => number; // -> g for mass, ml for volume
  fromBase: (n: number) => number; // g or ml -> this unit
  aliases: string[];
  group?: "spoons"; // tsp/tbsp
};

const U: Record<CanonUnit, UnitDef> = {
  g: {
    dim: "mass",
    toBase: (n) => n,
    fromBase: (n) => n,
    aliases: ["g", "gram", "grams", "gramme", "grammes"],
  },
  kg: {
    dim: "mass",
    toBase: (n) => n * 1000,
    fromBase: (n) => n / 1000,
    aliases: ["kg", "kilogram", "kilograms", "kilogramme", "kilogrammes"],
  },

  ml: {
    dim: "volume",
    toBase: (n) => n,
    fromBase: (n) => n,
    aliases: ["ml", "milliliter", "millilitre", "milliliters", "millilitres"],
  },
  cl: {
    dim: "volume",
    toBase: (n) => n * 10,
    fromBase: (n) => n / 10,
    aliases: ["cl", "centiliter", "centilitre", "centiliters", "centilitres"],
  },
  dl: {
    dim: "volume",
    toBase: (n) => n * 100,
    fromBase: (n) => n / 100,
    aliases: ["dl", "deciliter", "decilitre", "deciliters", "decilitres"],
  },
  l: {
    dim: "volume",
    toBase: (n) => n * 1000,
    fromBase: (n) => n / 1000,
    aliases: ["l", "liter", "litre", "liters", "litres"],
  },

  tsp: {
    dim: "volume",
    toBase: (n) => n * 5,
    fromBase: (n) => n / 5,
    aliases: [
      "tsp",
      "teaspoon",
      "teaspoons",
      "cac",
      "càc",
      "c.à.c",
      "c a c",
      "c-a-c",
      "cuil. à café",
      "cuil. a cafe",
      "cuillere a cafe",
      "cuillère à café",
    ],
    group: "spoons",
  },
  tbsp: {
    dim: "volume",
    toBase: (n) => n * 15,
    fromBase: (n) => n / 15,
    aliases: [
      "tbsp",
      "tablespoon",
      "tablespoons",
      "cas",
      "càs",
      "c.à.s",
      "c a s",
      "c-a-s",
      "cuil. à soupe",
      "cuil. a soupe",
      "cuillere a soupe",
      "cuillère à soupe",
    ],
    group: "spoons",
  },
};

// --- parsing helpers (supports unicode fractions, "1 1/2", "400–500") ---
const UNICODE_FRAC: Record<string, number> = {
  "¼": 0.25,
  "½": 0.5,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅛": 0.125,
  "⅜": 0.375,
  "⅝": 0.625,
  "⅞": 0.875,
};

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\./g, "")
    .trim();
}

function parseNumberToken(s: string): number | null {
  s = s.trim();
  // unicode only
  if ([...s].every((ch) => UNICODE_FRAC[ch] != null)) {
    return [...s].reduce((t, ch) => t + UNICODE_FRAC[ch], 0);
  }
  // mixed like "1 1/2" or "1-1/2"
  const m1 = s.match(/^(\d+)[\s-]+(\d+)\/(\d+)$/);
  if (m1) return Number(m1[1]) + Number(m1[2]) / Number(m1[3]);
  // simple fraction "2/3"
  const m2 = s.match(/^(\d+)\/(\d+)$/);
  if (m2) return Number(m2[1]) / Number(m2[2]);
  // decimal or int (allow comma)
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function firstNumberFromRange(s: string): number | null {
  const parts = s.split(/[-–—]/).map((x) => x.trim());
  return parts.length >= 2 ? parseNumberToken(parts[0]) : parseNumberToken(s);
}

function canonicalUnit(raw?: string): CanonUnit | null {
  if (!raw) return null;
  const w = norm(raw);
  for (const [canon, def] of Object.entries(U) as [CanonUnit, UnitDef][]) {
    if (def.aliases.map(norm).includes(w)) return canon;
  }
  return null;
}

export type ParsedIngredient = {
  qty: number | null;
  unit: CanonUnit | null;
  item: string;
  note?: string;
  original: string;
};

export function parseIngredient(line: string): ParsedIngredient {
  const original = line;
  // take trailing parentheses as note
  let note: string | undefined;
  const nm = line.match(/\(([^)]+)\)\s*$/);
  if (nm) {
    note = nm[1];
    line = line.slice(0, nm.index).trim();
  }

  const tokens = line.split(/\s+/);
  // try first 1-2 tokens as quantity
  const qtyTokens: string[] = [];
  if (tokens[0]) qtyTokens.push(tokens[0]);
  if (tokens[1] && /^[\d¼½¾⅓⅔⅛⅜⅝⅞/.-]+$/.test(tokens[1]))
    qtyTokens.push(tokens[1]);
  const qtyStr = qtyTokens.join(" ");
  const qty = firstNumberFromRange(qtyStr);

  let unit: CanonUnit | null = null;
  let i = 0;
  if (qty != null) {
    i = qtyTokens.length;
    unit = canonicalUnit(tokens[i]);
    if (unit) i += 1;
  }

  const item = tokens.slice(i).join(" ").trim();
  return { qty, unit, item, note, original };
}

// --- formatting ---
function toNiceFraction(n: number): string {
  const WHOLE = Math.floor(n);
  const frac = n - WHOLE;
  const opts = [
    0,
    1 / 8,
    1 / 6,
    1 / 5,
    1 / 4,
    1 / 3,
    3 / 8,
    1 / 2,
    5 / 8,
    2 / 3,
    3 / 4,
    5 / 6,
    7 / 8,
  ];
  let best = 0,
    diff = 1;
  opts.forEach((v) => {
    const d = Math.abs(frac - v);
    if (d < diff) {
      diff = d;
      best = v;
    }
  });
  if (WHOLE === 0 && best === 0) return "0";
  if (best === 0) return String(WHOLE);
  return WHOLE ? `${WHOLE} ${ratioToString(best)}` : ratioToString(best);
}
function ratioToString(v: number): string {
  const MAP: Record<number, string> = {
    0.125: "1/8",
    0.1667: "1/6",
    0.2: "1/5",
    0.25: "1/4",
    0.3333: "1/3",
    0.375: "3/8",
    0.5: "1/2",
    0.625: "5/8",
    0.6667: "2/3",
    0.75: "3/4",
    0.8333: "5/6",
    0.875: "7/8",
  };
  // find key by closeness
  let bestKey = 0.5,
    diff = 1;
  Object.keys(MAP).forEach((k) => {
    const key = Number(k);
    const d = Math.abs(v - key);
    if (d < diff) {
      diff = d;
      bestKey = key;
    }
  });
  return MAP[bestKey];
}
function formatNumber(n: number, preferFractions = true) {
  if (n === 0) return "0";
  if (preferFractions && n <= 10) return toNiceFraction(n);
  return (Math.round(n * 100) / 100).toString().replace(/\.00$/, "");
}

/** Decide when to show fractions instead of decimals (more consistent UX) */
export function shouldUseFractions(
  unit: CanonUnit | null,
  qty: number
): boolean {
  if (unit === "tsp" || unit === "tbsp") return true; // spoons feel natural in fractions
  if (!unit) return qty <= 10; // counts like eggs/zucchini: fractions when small
  if (unit === "ml") return qty <= 250;
  if (unit === "cl") return qty <= 25;
  if (unit === "dl") return qty <= 2.5;
  if (unit === "l") return qty < 1;
  // mass: keep decimals (fractions for g/kg are awkward)
  return false;
}

// --- choosing best unit ---
function chooseVolumeUnit(
  baseMl: number,
  origin?: CanonUnit
): { unit: CanonUnit; qty: number } {
  const fromSpoons = origin === "tsp" || origin === "tbsp";

  // spoon-first for spoon-origin, but promote/demote sensibly
  const tbspQty = U.tbsp.fromBase(baseMl);
  const tspQty = U.tsp.fromBase(baseMl);

  if (fromSpoons) {
    if (tbspQty >= 1 && tbspQty <= 12) return { unit: "tbsp", qty: tbspQty };
    if (tspQty < 12) return { unit: "tsp", qty: tspQty };
    // otherwise fall through to metric scale
  }

  // metric-first
  if (baseMl >= 1000) return { unit: "l", qty: U.l.fromBase(baseMl) };
  if (baseMl >= 100 && baseMl < 1000)
    return { unit: "dl", qty: U.dl.fromBase(baseMl) };
  if (baseMl >= 10 && baseMl < 100)
    return { unit: "cl", qty: U.cl.fromBase(baseMl) };
  return { unit: "ml", qty: baseMl };
}

function chooseMassUnit(baseG: number): { unit: CanonUnit; qty: number } {
  if (baseG >= 1000) return { unit: "kg", qty: U.kg.fromBase(baseG) };
  return { unit: "g", qty: baseG };
}

export function scaleAndNormalize(
  qty: number,
  unit: CanonUnit | null,
  factor: number
) {
  if (!unit) return { qty: qty * factor, unit: null as CanonUnit | null };

  const def = U[unit];
  const base = def.toBase(qty) * factor;

  if (def.dim === "volume") {
    return chooseVolumeUnit(base, unit);
  } else {
    return chooseMassUnit(base);
  }
}

/** Parse a number of servings from strings like "4 servings" / "4 portions" */
export function parseYieldServings(yieldStr: string): number | null {
  const mRange = String(yieldStr).match(/(\d+)\s*[–-]\s*(\d+)/);
  if (mRange) return Number(mRange[1]); // choose lower bound for base
  const m = String(yieldStr).match(/(\d+([.,]\d+)?)/);
  return m ? Number(m[1].replace(",", ".")) : null;
}

// --- public API ---
export function scaleIngredientString(str: string, factor: number): string {
  const p = parseIngredient(str);
  if (p.qty == null) return str; // nothing to scale

  const { qty, unit } = scaleAndNormalize(p.qty, p.unit, factor);

  // format number (fractions for spoons/small amounts; decimals for the rest)
  const qOut = formatNumber(qty, shouldUseFractions(unit, qty));

  const unitOut = unit ?? p.unit ?? "";
  const parts = [qOut, unitOut, p.item].filter(Boolean);
  let line = parts.join(" ").replace(/\s+/g, " ").trim();
  if (p.note) line += ` (${p.note})`;
  return line;
}
