import { pgTable, serial, text, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gpsVehiclesTable = pgTable("gps_vehicles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  vehicleId: integer("vehicle_id").notNull(),
  name: text("name").notNull(),
  number: text("number").notNull(),
  status: text("status").notNull().default("parked"),
  speed: integer("speed").notNull().default(0),
  signal: integer("signal").notNull().default(4),
  battery: integer("battery").notNull().default(100),
  address: text("address"),
  lat: numeric("lat", { precision: 10, scale: 6 }),
  lng: numeric("lng", { precision: 10, scale: 6 }),
  immobilized: boolean("immobilized").notNull().default(false),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const gpsTripsTable = pgTable("gps_trips", {
  id: serial("id").primaryKey(),
  gpsVehicleId: integer("gps_vehicle_id").notNull().references(() => gpsVehiclesTable.id, { onDelete: "cascade" }),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  distanceKm: numeric("distance_km", { precision: 6, scale: 1 }).notNull(),
  topSpeedKmph: integer("top_speed_kmph").notNull(),
  idleMinutes: integer("idle_minutes").notNull().default(0),
  date: text("date").notNull().default("Today"),
});

export const gpsAlertsTable = pgTable("gps_alerts", {
  id: serial("id").primaryKey(),
  gpsVehicleId: integer("gps_vehicle_id").notNull().references(() => gpsVehiclesTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  detail: text("detail").notNull(),
  severity: text("severity").notNull().default("info"),
  vehicleNumber: text("vehicle_number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const geofencesTable = pgTable("geofences", {
  id: serial("id").primaryKey(),
  gpsVehicleId: integer("gps_vehicle_id").notNull().references(() => gpsVehiclesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  radiusM: integer("radius_m").notNull().default(200),
  zoneType: text("zone_type").notNull().default("Stay Inside"),
  status: text("status").notNull().default("active"),
  lat: numeric("lat", { precision: 10, scale: 6 }),
  lng: numeric("lng", { precision: 10, scale: 6 }),
  lastAlert: text("last_alert").default("Never"),
});

export const insertGpsVehicleSchema = createInsertSchema(gpsVehiclesTable).omit({ id: true, lastUpdated: true });
export const insertGpsTripSchema = createInsertSchema(gpsTripsTable).omit({ id: true });
export const insertGpsAlertSchema = createInsertSchema(gpsAlertsTable).omit({ id: true, createdAt: true });
export const insertGeofenceSchema = createInsertSchema(geofencesTable).omit({ id: true });

export type GpsVehicle = typeof gpsVehiclesTable.$inferSelect;
export type GpsTrip = typeof gpsTripsTable.$inferSelect;
export type GpsAlert = typeof gpsAlertsTable.$inferSelect;
export type Geofence = typeof geofencesTable.$inferSelect;
export type InsertGeofence = z.infer<typeof insertGeofenceSchema>;
