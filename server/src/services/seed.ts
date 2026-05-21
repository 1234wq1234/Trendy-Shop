import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const brands = ["nike", "adidas", "apple", "samsung", "zara", "lcw", "mango", "casio"];

async function main() {
  const count = await prisma.product.count();
  if (count > 0) return;

  await prisma.product.createMany({
    data: Array.from({ length: 30 }, (_, i) => ({
      title: `Ürün ${i + 1}`,
      description: "Production seed ürün açiklamasi",
      price: 199 + i * 10,
      image: `https://picsum.photos/seed/prod${i + 1}/500/500`,
      brand: brands[i % brands.length],
      size: ["S", "M", "L", "XL", "Standart"][i % 5],
      color: ["Siyah", "Beyaz", "Mavi", "Kirmizi"][i % 4]
    }))
  });
}

main().finally(() => prisma.$disconnect());
