import { Router, Request } from "express";
import { db, licencesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, AuthPayload } from "../middlewares/auth";

const router = Router();
type AuthReq = Request & { user: AuthPayload };

// GET /api/licences
router.get("/licences", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthReq).user;
    const licences = await db.select().from(licencesTable).where(eq(licencesTable.userId, userId));
    res.json(licences);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

// GET /api/licences/:id
router.get("/licences/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthReq).user;
    const id = Number(req.params["id"]);
    const [lic] = await db.select().from(licencesTable)
      .where(and(eq(licencesTable.id, id), eq(licencesTable.userId, userId))).limit(1);
    if (!lic) { res.status(404).json({ error: "Not found" }); return; }
    res.json(lic);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

// POST /api/licences
router.post("/licences", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthReq).user;
    const { licenceNumber, type, dob, issueDate, expiryDate, state, status } = req.body;
    if (!licenceNumber || !type || !dob || !issueDate || !expiryDate || !state) {
      res.status(400).json({ error: "All fields are required" }); return;
    }
    const [lic] = await db.insert(licencesTable).values({ userId, licenceNumber, type, dob, issueDate, expiryDate, state, status: status ?? "valid" }).returning();
    res.status(201).json(lic);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

// PUT /api/licences/:id
router.put("/licences/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthReq).user;
    const id = Number(req.params["id"]);
    const { licenceNumber, type, dob, issueDate, expiryDate, state, status } = req.body;
    const [updated] = await db.update(licencesTable)
      .set({ licenceNumber, type, dob, issueDate, expiryDate, state, status })
      .where(and(eq(licencesTable.id, id), eq(licencesTable.userId, userId))).returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(updated);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

// DELETE /api/licences/:id
router.delete("/licences/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthReq).user;
    const id = Number(req.params["id"]);
    await db.delete(licencesTable).where(and(eq(licencesTable.id, id), eq(licencesTable.userId, userId)));
    res.json({ message: "Deleted" });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Server error" }); }
});

export default router;
