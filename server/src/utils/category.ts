export function resolveCategory(title?: string, description?: string): string {
  const name = `${title || ""} ${description || ""}`
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");

  if (["parfum", "rimel", "kirpik", "krem", "ruj", "fondoten", "makyaj"].some((k) => name.includes(k))) return "Kozmetik";
  if (["ceket", "etek", "gomlek", "tisort", "elbise", "pantolon", "kazak", "hirka"].some((k) => name.includes(k))) return "Giyim";
  if (["canta", "sandalet", "ayakkabi", "sneaker", "bot", "topuklu", "terlik"].some((k) => name.includes(k))) return "Çanta ve Ayakkabı";
  if (["bilgisayar", "telefon", "tablet", "kulaklik", "klavye", "mouse", "monitor"].some((k) => name.includes(k))) return "Teknolojik";
  if (["kahve", "supurge", "blender", "tencere", "fincan"].some((k) => name.includes(k))) return "Ev Eşyası";
  if (["kolye", "bileklik", "yuzuk", "kupe", "aksesuar", "saat"].some((k) => name.includes(k))) return "Saat ve Aksesuar";

  return "Saat ve Aksesuar";
}
