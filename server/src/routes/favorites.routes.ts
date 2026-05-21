import { Router } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest, requireAuth } from "../middleware/auth";

export const favoritesRouter = Router();

favoritesRouter.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const favorites = await prisma.favorite.findMany({ where: { userId: req.user!.userId }, include: { product: true } });
    res.json(favorites);
  } catch (err) {
    next(err);
  }
});

favoritesRouter.post("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { productId } = req.body as { productId: string };
    const favorite = await prisma.favorite.upsert({
      where: { userId_productId: { userId: req.user!.userId, productId } },
      create: { userId: req.user!.userId, productId },
      update: {}
    });
    res.status(201).json(favorite);
  } catch (err) {
    next(err);
  }
});

favoritesRouter.delete("/:productId", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    await prisma.favorite.delete({ where: { userId_productId: { userId: req.user!.userId, productId: req.params.productId } } });
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
});
