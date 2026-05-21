import { Router } from "express";
import { prisma } from "../config/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { resolveCategory } from "../utils/category";

export const productsRouter = Router();

function normalizeBrand(brand?: string) {
  if (!brand) return undefined;

  const trimmed = brand.trim();
  const key = trimmed.toLocaleLowerCase("tr-TR");

  const aliases: Record<string, string> = {
    altinbas: "Altınbaş",
    "altınbaş": "Altınbaş",
    lenova: "Lenova",
    lancom: "Lancom"
  };

  return aliases[key] || trimmed;
}

productsRouter.get("/", async (req, res, next) => {
  try {
    const brand = normalizeBrand(req.query.brand?.toString());
    const search = req.query.search?.toString();

    const products = await prisma.product.findMany({
      where: {
        image: { startsWith: "/images/" },
        ...(brand ? { brand: { equals: brand, mode: "insensitive" } } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { brand: { contains: search, mode: "insensitive" } }
              ]
            }
          : {})
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(products);
  } catch (err) {
    next(err);
  }
});

productsRouter.post("/", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const payload = req.body as Record<string, unknown>;
    const title = typeof payload.title === "string" ? payload.title : "";
    const description = typeof payload.description === "string" ? payload.description : "";
    const category = typeof payload.category === "string" && payload.category.trim() ? payload.category : resolveCategory(title, description);
    const product = await prisma.product.create({ data: { ...payload, category } });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

productsRouter.put("/:id", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: "Product not found" });

    const payload = req.body as Record<string, unknown>;
    const nextTitle = typeof payload.title === "string" ? payload.title : existing.title;
    const nextDescription = typeof payload.description === "string" ? payload.description : existing.description || "";
    const category =
      typeof payload.category === "string" && payload.category.trim()
        ? payload.category
        : resolveCategory(nextTitle, nextDescription);

    const product = await prisma.product.update({ where: { id: req.params.id }, data: { ...payload, category } });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

productsRouter.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
});
