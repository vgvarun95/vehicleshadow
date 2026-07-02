import { pgTable, serial, text, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sparePartsTable = pgTable("spare_parts", {
  id: serial("id").primaryKey(),
  brand: text("brand").notNull(),
  carModel: text("car_model").notNull(),
  category: text("category").notNull(),
  subCategory: text("sub_category").notNull(),
  name: text("name").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(10),
  imageUrl: text("image_url"),
});

export const cartItemsTable = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  partId: integer("part_id").notNull().references(() => sparePartsTable.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
});

export const insertSparePartSchema = createInsertSchema(sparePartsTable).omit({ id: true });
export const insertCartItemSchema = createInsertSchema(cartItemsTable).omit({ id: true });
export type InsertSparePart = z.infer<typeof insertSparePartSchema>;
export type SparePart = typeof sparePartsTable.$inferSelect;
export type CartItem = typeof cartItemsTable.$inferSelect;
