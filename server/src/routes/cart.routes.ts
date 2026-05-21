import { Router } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest, requireAuth } from "../middleware/auth";

export const cartRouter = Router();

cartRouter.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const cart = await prisma.cart.findFirst({ where: { userId: req.user!.userId }, include: { products: { include: { product: true } } } });
    res.json(cart || { products: [] });
  } catch (err) {
    next(err);
  }
});

cartRouter.post("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { productId, quantity } = req.body as { productId: string; quantity: number };
    let cart = await prisma.cart.findFirst({ where: { userId: req.user!.userId } });
    if (!cart) cart = await prisma.cart.create({ data: { userId: req.user!.userId } });

    const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId } });
    const item = existing
      ? await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: { increment: quantity || 1 } },
          include: { product: true }
        })
      : await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity: quantity || 1 }, include: { product: true } });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

cartRouter.patch("/:itemId", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { quantity } = req.body as { quantity: number };
    if (quantity < 1) {
      await prisma.cartItem.delete({ where: { id: req.params.itemId } });
      return res.json({ message: "Deleted" });
    }
    const item = await prisma.cartItem.update({
      where: { id: req.params.itemId },
      data: { quantity },
      include: { product: true }
    });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

cartRouter.delete("/:itemId", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.itemId } });
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
});
