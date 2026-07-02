import { Router, Request } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, AuthPayload } from "../middlewares/auth";

const router = Router();
type AuthReq = Request & { user: AuthPayload };

// GET /api/user/profile
router.get("/user/profile", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthReq).user;
    const [user] = await db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, phone: usersTable.phone, createdAt: usersTable.createdAt })
      .from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    res.json(user);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/user/profile
router.put("/user/profile", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthReq).user;
    const { name, phone } = req.body;
    const [updated] = await db.update(usersTable).set({ name, phone }).where(eq(usersTable.id, userId)).returning({
      id: usersTable.id, name: usersTable.name, email: usersTable.email, phone: usersTable.phone
    });
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
