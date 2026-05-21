import { Router } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest, requireAuth, requireRole } from "../middleware/auth";

export const ordersRouter = Router();

ordersRouter.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const where = req.user?.role === "ADMIN" ? {} : { userId: req.user?.userId };
    const orders = await prisma.order.findMany({ where, include: { products: { include: { product: true } } }, orderBy: { createdAt: "desc" } });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

ordersRouter.post("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const body = req.body as {
      items: { productId: string; quantity: number }[];
      fullName?: string;
      phone?: string;
      contactEmail?: string;
      addressLine1?: string;
      addressLine2?: string;
      district?: string;
      city?: string;
      postalCode?: string;
      paymentMethod?: string;
      invoiceType?: string;
      invoiceTitle?: string;
      invoiceTaxId?: string;
      invoiceTaxOffice?: string;
      invoiceAddress?: string;
      invoiceSameAsDelivery?: boolean;
      orderNote?: string;
    };

    const { items } = body;
    if (!items?.length) return res.status(400).json({ message: "Sepet boş veya geçersiz" });

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    const totalPrice = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);

    const same = Boolean(body.invoiceSameAsDelivery);
    const deliveryParts = [body.addressLine1, body.addressLine2, body.district, body.city, body.postalCode].filter(Boolean);
    const resolvedInvoiceAddress = same ? deliveryParts.join(", ") : body.invoiceAddress?.trim() || null;

    const order = await prisma.order.create({
      data: {
        userId: req.user!.userId,
        totalPrice,
        status: "Hazırlanıyor",
        fullName: body.fullName?.trim() || null,
        phone: body.phone?.trim() || null,
        contactEmail: body.contactEmail?.trim() || null,
        addressLine1: body.addressLine1?.trim() || null,
        addressLine2: body.addressLine2?.trim() || null,
        district: body.district?.trim() || null,
        city: body.city?.trim() || null,
        postalCode: body.postalCode?.trim() || null,
        paymentMethod: body.paymentMethod?.trim() || null,
        invoiceType: body.invoiceType?.trim() || null,
        invoiceTitle: body.invoiceTitle?.trim() || null,
        invoiceTaxId: body.invoiceTaxId?.trim() || null,
        invoiceTaxOffice: body.invoiceTaxOffice?.trim() || null,
        invoiceAddress: resolvedInvoiceAddress,
        invoiceSameAsDelivery: same,
        orderNote: body.orderNote?.trim() || null,
        products: {
          create: items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
        }
      },
      include: { products: { include: { product: true } } }
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

ordersRouter.patch("/:id/status", requireAuth, requireRole("ADMIN"), async (req: AuthRequest, res, next) => {
  try {
    const { status } = req.body as { status: "Hazırlanıyor" | "Kargoda" | "Tamamlandı" };
    if (!["Hazırlanıyor", "Kargoda", "Tamamlandı"].includes(status)) return res.status(400).json({ message: "Geçersiz durum" });

    const order = await prisma.order.update({ where: { id: req.params.id }, data: { status } });
    res.json(order);
  } catch (err) {
    next(err);
  }
});
