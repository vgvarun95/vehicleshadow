import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const licencesTable = pgTable("licences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  licenceNumber: text("licence_number").notNull(),
  type: text("type").notNull(),
  dob: text("dob").notNull(),
  issueDate: text("issue_date").notNull(),
  expiryDate: text("expiry_date").notNull(),
  state: text("state").notNull(),
  status: text("status").notNull().default("valid"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLicenceSchema = createInsertSchema(licencesTable).omit({ id: true, createdAt: true });
export type InsertLicence = z.infer<typeof insertLicenceSchema>;
export type Licence = typeof licencesTable.$inferSelect;
