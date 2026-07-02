import { Router, Request } from "express";
import { db, garagesTable, mechanicBookingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, AuthPayload } from "../middlewares/auth";

const router = Router();
type AuthReq = Request & { user: AuthPayload };

// GET /api/garages  (query: city, state)
router.get("/garages", async (req, res) => {
  try {
    const { city, state } = req.query as Record<string, string>;
    const all = await db.select().from(garagesTable);
    let result = all;
    if (city) result = result.filter(g => g.city.toLowerCase().includes(city.toLowerCase()));
    if (state) result = result.filter(g => g.state.toLowerCase().includes(state.toLowerCase()));
    res.json(result);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

// GET /api/bookings
router.get("/bookings", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthReq).user;
    const bookings = await db.select().from(mechanicBookingsTable).where(eq(mechanicBookingsTable.userId, userId));
    res.json(bookings);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

// POST /api/bookings
router.post("/bookings", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthReq).user;
    const { vehicleId, serviceType, bookingDate, timeSlot, garageName, notes } = req.body;
    if (!serviceType || !bookingDate || !timeSlot) {
      res.status(400).json({ error: "serviceType, bookingDate and timeSlot are required" }); return;
    }
    const [booking] = await db.insert(mechanicBookingsTable)
      .values({ userId, vehicleId, serviceType, bookingDate, timeSlot, garageName, notes, status: "pending" })
      .returning();
    res.status(201).json(booking);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

// PATCH /api/bookings/:id — update status
router.patch("/bookings/:id", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const [updated] = await db.update(mechanicBookingsTable)
      .set({ status })
      .where(eq(mechanicBookingsTable.id, Number(req.params["id"]))).returning();
    res.json(updated);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

export default router;
