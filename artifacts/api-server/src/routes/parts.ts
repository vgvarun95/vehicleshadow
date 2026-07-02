import { Router, Request } from "express";
import { db, sparePartsTable, cartItemsTable } from "@workspace/db";
import { eq, and, ilike } from "drizzle-orm";
import { requireAuth, AuthPayload } from "../middlewares/auth";

const router = Router();
type AuthReq = Request & { user: AuthPayload };

// GET /api/parts  (query: brand, carModel, category, subCategory, search)
router.get("/parts", async (req, res) => {
  try {
    const parts = await db.select().from(sparePartsTable);
    let result = parts;
    const { brand, carModel, category, subCategory, search } = req.query as Record<string, string>;
    if (brand) result = result.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
    if (carModel) result = result.filter(p => p.carModel.toLowerCase().includes(carModel.toLowerCase()));
    if (category) result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    if (subCategory) result = result.filter(p => p.subCategory.toLowerCase() === subCategory.toLowerCase());
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    res.json(result);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

// GET /api/parts/:id
router.get("/parts/:id", async (req, res) => {
  try {
    const [part] = await db.select().from(sparePartsTable).where(eq(sparePartsTable.id, Number(req.params["id"]))).limit(1);
    if (!part) { res.status(404).json({ error: "Not found" }); return; }
    res.json(part);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

// GET /api/cart
router.get("/cart", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthReq).user;
    const items = await db.select({
      id: cartItemsTable.id,
      quantity: cartItemsTable.quantity,
      partId: cartItemsTable.partId,
      name: sparePartsTable.name,
      price: sparePartsTable.price,
      brand: sparePartsTable.brand,
      category: sparePartsTable.category,
      imageUrl: sparePartsTable.imageUrl,
    }).from(cartItemsTable)
      .innerJoin(sparePartsTable, eq(cartItemsTable.partId, sparePartsTable.id))
      .where(eq(cartItemsTable.userId, userId));
    res.json(items);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

// POST /api/cart
router.post("/cart", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthReq).user;
    const { partId, quantity } = req.body;
    if (!partId) { res.status(400).json({ error: "partId required" }); return; }
    // upsert: if already in cart, increment quantity
    const [existing] = await db.select().from(cartItemsTable)
      .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.partId, partId))).limit(1);
    if (existing) {
      const [updated] = await db.update(cartItemsTable)
        .set({ quantity: existing.quantity + (quantity ?? 1) })
        .where(eq(cartItemsTable.id, existing.id)).returning();
      res.json(updated);
    } else {
      const [item] = await db.insert(cartItemsTable).values({ userId, partId, quantity: quantity ?? 1 }).returning();
      res.status(201).json(item);
    }
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

// DELETE /api/cart/:id
router.delete("/cart/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthReq).user;
    await db.delete(cartItemsTable)
      .where(and(eq(cartItemsTable.id, Number(req.params["id"])), eq(cartItemsTable.userId, userId)));
    res.json({ message: "Removed from cart" });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

export default router;
