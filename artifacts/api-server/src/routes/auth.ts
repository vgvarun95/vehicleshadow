import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken } from "../middlewares/auth";

const router = Router();

// In-memory OTP store (keyed by email)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// POST /api/auth/signup
router.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: "name, email and password are required" });
      return;
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({ name, email, passwordHash, phone }).returning();
    const token = signToken({ userId: user.id, email: user.email });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = signToken({ userId: user.id, email: user.email });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/forgot-password — generate OTP
router.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) { res.status(400).json({ error: "email required" }); return; }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) { res.status(404).json({ error: "Email not found" }); return; }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // 10 min
    req.log.info({ email, otp }, "OTP generated"); // In production: send via SMS/email
    res.json({ message: "OTP sent", otp }); // Remove otp from response in production
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/verify-otp
router.post("/auth/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) { res.status(400).json({ error: "email and otp required" }); return; }
    const stored = otpStore.get(email);
    if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
      res.status(400).json({ error: "Invalid or expired OTP" });
      return;
    }
    res.json({ message: "OTP verified", resetToken: Buffer.from(`${email}:verified`).toString("base64") });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/reset-password
router.post("/auth/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) { res.status(400).json({ error: "email, otp and newPassword required" }); return; }
    const stored = otpStore.get(email);
    if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
      res.status(400).json({ error: "Invalid or expired OTP" });
      return;
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.email, email));
    otpStore.delete(email);
    res.json({ message: "Password reset successful" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
