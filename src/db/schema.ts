import { relations, sql } from "drizzle-orm";
import {
    char,
    check,
    date,
    decimal,
    index,
    mysqlEnum,
    mysqlTable,
    timestamp,
    varchar,
} from "drizzle-orm/mysql-core";

export const orders = mysqlTable("orders", {
    id: char("id", { length: 36 }).primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    orderDate: date("order_date", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const products = mysqlTable(
    "products",
    {
        id: char("id", { length: 36 }).primaryKey(),
        orderId: char("order_id", { length: 36 })
            .notNull()
            .references(() => orders.id, { onDelete: "cascade" }),
        title: varchar("title", { length: 255 }).notNull(),
        serialNumber: varchar("serial_number", { length: 128 }).notNull(),
        type: mysqlEnum("product_type", [
            "Monitors",
            "Laptops",
            "Motherboards",
            "Accessories",
        ]).notNull(),
        status: mysqlEnum("product_status", ["Available", "In service", "Reserved"]).notNull(),
        condition: mysqlEnum("product_condition", ["New", "Used"]).notNull(),
        specification: varchar("specification", { length: 255 }).notNull(),
        groupName: varchar("group_name", { length: 255 }).notNull(),
        ownerName: varchar("owner_name", { length: 255 }),
        warrantyStart: date("warranty_start", { mode: "string" }).notNull(),
        warrantyEnd: date("warranty_end", { mode: "string" }).notNull(),
        priceUsd: decimal("price_usd", { precision: 14, scale: 2 }).notNull(),
        priceUah: decimal("price_uah", { precision: 14, scale: 2 }).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    },
    (table) => [
        index("products_order_id_idx").on(table.orderId),
        index("products_type_idx").on(table.type),
        index("products_status_idx").on(table.status),
        index("products_serial_number_idx").on(table.serialNumber),
        check(
            "products_warranty_range_check",
            sql`${sql.identifier("warranty_end")} >= ${sql.identifier("warranty_start")}`,
        ),
        check("products_price_usd_check", sql`${sql.identifier("price_usd")} >= 0`),
        check("products_price_uah_check", sql`${sql.identifier("price_uah")} >= 0`),
    ],
);

export const ordersRelations = relations(orders, ({ many }) => ({
    products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
    order: one(orders, {
        fields: [products.orderId],
        references: [orders.id],
    }),
}));
