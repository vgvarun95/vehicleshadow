import { Router, Request } from "express";
import { db, vehiclesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, AuthPayload } from "../middlewares/auth";

const router = Router();
type AuthReq = Request & { user: AuthPayload };

// GET /api/vehicles
router.get("/vehicles", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthReq).user;
    const vehicles = await db.select().from(vehiclesTable).where(eq(vehiclesTable.userId, userId));
    res.json(vehicles);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

// GET /api/vehicles/:id
router.get("/vehicles/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthReq).user;
    const id = Number(req.params["id"]);
    const [v] = await db.select().from(vehiclesTable)
      .where(and(eq(vehiclesTable.id, id), eq(vehiclesTable.userId, userId))).limit(1);
    if (!v) { res.status(404).json({ error: "Not found" }); return; }
    res.json(v);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

// POST /api/vehicles
router.post("/vehicles", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthReq).user;
    const { registrationNumber, make, model, year, fuelType, insuranceExpiry, pucExpiry, status } = req.body;
    if (!registrationNumber || !make || !model || !year) {
      res.status(400).json({ error: "registrationNumber, make, model and year are required" }); return;
    }
    const [v] = await db.insert(vehiclesTable)
      .values({ userId, registrationNumber, make, model, year, fuelType: fuelType ?? "Petrol", insuranceExpiry, pucExpiry, status: status ?? "active" })
      .returning();
    res.status(201).json(v);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

// PUT /api/vehicles/:id
router.put("/vehicles/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthReq).user;
    const id = Number(req.params["id"]);
    const { registrationNumber, make, model, year, fuelType, insuranceExpiry, pucExpiry, status } = req.body;
    const [updated] = await db.update(vehiclesTable)
      .set({ registrationNumber, make, model, year, fuelType, insuranceExpiry, pucExpiry, status })
      .where(and(eq(vehiclesTable.id, id), eq(vehiclesTable.userId, userId))).returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(updated);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

// DELETE /api/vehicles/:id
router.delete("/vehicles/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthReq).user;
    const id = Number(req.params["id"]);
    await db.delete(vehiclesTable).where(and(eq(vehiclesTable.id, id), eq(vehiclesTable.userId, userId)));
    res.json({ message: "Deleted" });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

export default router;
