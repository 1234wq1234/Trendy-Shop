import { Product } from "@/lib/types";

export const categoryItems = ["Tümü", "Kozmetik", "Giyim", "Çanta ve Ayakkabı", "Teknolojik", "Ev Eşyası", "Saat ve Aksesuar"] as const;

const categoryMap: Record<string, (typeof categoryItems)[number]> = {
  "kozmetik": "Kozmetik",
  "giyim": "Giyim",
  "canta ve ayakkabi": "Çanta ve Ayakkabı",
  "çanta ve ayakkabı": "Çanta ve Ayakkabı",
  "teknolojik": "Teknolojik",
  "ev esyasi": "Ev Eşyası",
  "ev eşyası": "Ev Eşyası",
  "saat ve aksesuar": "Saat ve Aksesuar"
};

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim();
}

function containsAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

export function getProductCategory(product: Product): (typeof categoryItems)[number] {
  const normalizedCategory = normalizeText(product.category || "");
  const name = normalizeText(`${product.title} ${product.description ?? ""}`);

  let inferred: (typeof categoryItems)[number] = "Saat ve Aksesuar";
  if (containsAny(name, ["parfum", "rimel", "kirpik", "krem", "ruj", "fondoten", "makyaj"])) inferred = "Kozmetik";
  else if (containsAny(name, ["ceket", "etek", "gomlek", "tisort", "elbise", "pantolon", "kazak", "hirka"])) inferred = "Giyim";
  else if (containsAny(name, ["canta", "sandalet", "ayakkabi", "sneaker", "bot", "topuklu", "terlik"])) inferred = "Çanta ve Ayakkabı";
  else if (containsAny(name, ["bilgisayar", "telefon", "tablet", "kulaklik", "klavye", "mouse", "monitor"])) inferred = "Teknolojik";
  else if (containsAny(name, ["kahve", "supurge", "blender", "tencere", "fincan"])) inferred = "Ev Eşyası";
  else if (containsAny(name, ["kolye", "bileklik", "yuzuk", "kupe", "aksesuar", "saat"])) inferred = "Saat ve Aksesuar";

  if (normalizedCategory && categoryMap[normalizedCategory]) {
    const mapped = categoryMap[normalizedCategory];
   
    if (mapped === "Saat ve Aksesuar" && inferred !== "Saat ve Aksesuar") return inferred;
    return mapped;
  }

  
  return inferred;
}
