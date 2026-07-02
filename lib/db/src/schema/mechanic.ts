import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const garagesTable = pgTable("garages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  phone: text("phone").notNull(),
  rating: numeric("rating", { precision: 2, scale: 1 }).default("4.0"),
  specialties: text("specialties").notNull().default("General"),
  openTime: text("open_time").default("9:00 AM"),
  closeTime: text("close_time").default("7:00 PM"),
});

export const mechanicBookingsTable = pgTable("mechanic_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  vehicleId: integer("vehicle_id"),
  serviceType: text("service_type").notNull(),
  bookingDate: text("booking_date").notNull(),
  timeSlot: text("time_slot").notNull(),
  garageName: text("garage_name"),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGarageSchema = createInsertSchema(garagesTable).omit({ id: true });
export const insertBookingSchema = createInsertSchema(mechanicBookingsTable).omit({ id: true, createdAt: true });
export type Garage = typeof garagesTable.$inferSelect;
export type MechanicBooking = typeof mechanicBookingsTable.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
