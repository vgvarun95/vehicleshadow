import { Router, Request } from "express";
import { db, gpsVehiclesTable, gpsTripsTable, gpsAlertsTable, geofencesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, AuthPayload } from "../middlewares/auth";

const router = Router();
type AuthReq = Request & { user: AuthPayload };

// GET /api/gps/vehicles — all GPS-tracked vehicles for user
router.get("/gps/vehicles", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthReq).user;
    const vehicles = await db.select().from(gpsVehiclesTable).where(eq(gpsVehiclesTable.userId, userId));
    res.json(vehicles);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

// POST /api/gps/vehicles — add GPS vehicle
router.post("/gps/vehicles", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthReq).user;
    const { vehicleId, name, number, status, speed, signal, battery, address, lat, lng } = req.body;
    if (!name || !number) { res.status(400).json({ error: "name and number required" }); return; }
    const [v] = await db.insert(gpsVehiclesTable)
      .values({ userId, vehicleId, name, number, status: status ?? "parked", speed: speed ?? 0, signal: signal ?? 4, battery: battery ?? 100, address, lat, lng })
      .returning();
    res.status(201).json(v);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

// GET /api/gps/trips/:vehicleId
router.get("/gps/trips/:vehicleId", requireAuth, async (req, res) => {
  try {
    const trips = await db.select().from(gpsTripsTable)
      .where(eq(gpsTripsTable.gpsVehicleId, Number(req.params["vehicleId"])));
    res.json(trips);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

// GET /api/gps/alerts/:vehicleId
router.get("/gps/alerts/:vehicleId", requireAuth, async (req, res) => {
  try {
    const alerts = await db.select().from(gpsAlertsTable)
      .where(eq(gpsAlertsTable.gpsVehicleId, Number(req.params["vehicleId"])));
    res.json(alerts);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

// GET /api/gps/geofences/:vehicleId
router.get("/gps/geofences/:vehicleId", requireAuth, async (req, res) => {
  try {
    const fences = await db.select().from(geofencesTable)
      .where(eq(geofencesTable.gpsVehicleId, Number(req.params["vehicleId"])));
    res.json(fences);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

// POST /api/gps/geofences
router.post("/gps/geofences", requireAuth, async (req, res) => {
  try {
    const { gpsVehicleId, name, radiusM, zoneType, lat, lng } = req.body;
    if (!gpsVehicleId || !name) { res.status(400).json({ error: "gpsVehicleId and name required" }); return; }
    const [fence] = await db.insert(geofencesTable)
      .values({ gpsVehicleId, name, radiusM: radiusM ?? 200, zoneType: zoneType ?? "Stay Inside", status: "active", lat, lng })
      .returning();
    res.status(201).json(fence);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

// DELETE /api/gps/geofences/:id
router.delete("/gps/geofences/:id", requireAuth, async (req, res) => {
  try {
    await db.delete(geofencesTable).where(eq(geofencesTable.id, Number(req.params["id"])));
    res.json({ message: "Deleted" });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

// PATCH /api/gps/command/:vehicleId — immobilize / mobilize / share
router.patch("/gps/command/:vehicleId", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthReq).user;
    const { command } = req.body; // "immobilize" | "mobilize"
    if (!command) { res.status(400).json({ error: "command required" }); return; }
    const immobilized = command === "immobilize";
    const [updated] = await db.update(gpsVehiclesTable)
      .set({ immobilized })
      .where(and(eq(gpsVehiclesTable.id, Number(req.params["vehicleId"])), eq(gpsVehiclesTable.userId, userId)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Vehicle not found" }); return; }
    res.json({ message: `Vehicle ${immobilized ? "immobilized" : "mobilized"}`, immobilized });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

// PATCH /api/gps/geofences/:id/toggle — toggle status
router.patch("/gps/geofences/:id/toggle", requireAuth, async (req, res) => {
  try {
    const [fence] = await db.select().from(geofencesTable).where(eq(geofencesTable.id, Number(req.params["id"]))).limit(1);
    if (!fence) { res.status(404).json({ error: "Not found" }); return; }
    const newStatus = fence.status === "active" ? "inactive" : "active";
    const [updated] = await db.update(geofencesTable).set({ status: newStatus }).where(eq(geofencesTable.id, fence.id)).returning();
    res.json(updated);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

export default router;
