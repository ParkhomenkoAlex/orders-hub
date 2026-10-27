import "server-only";

import { and, eq, like, or, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import type { CreateOrderInput, CreateProductInput } from "@/lib/api-validation";
import type { Order, Product } from "@/types/domain";

const toOrder = (record: typeof orders.$inferSelect): Order => ({
    id: record.id,
    title: record.title,
    createdAt: record.orderDate,
});

const toProduct = (record: typeof products.$inferSelect): Product => ({
    id: record.id,
    orderId: record.orderId,
    title: record.title,
    serialNumber: record.serialNumber,
    type: record.type,
    status: record.status,
    condition: record.condition,
    specification: record.specification,
    groupName: record.groupName,
    ...(record.ownerName ? { ownerName: record.ownerName } : {}),
    warranty: { start: record.warrantyStart, end: record.warrantyEnd },
    price: { usd: Number(record.priceUsd), uah: Number(record.priceUah) },
});

export const listOrders = async () => (await db.select().from(orders)).map(toOrder);

export const createOrder = async (input: CreateOrderInput): Promise<Order> => {
    const id = crypto.randomUUID();
    await db.insert(orders).values({ id, title: input.title, orderDate: input.createdAt });
    return { id, title: input.title, createdAt: input.createdAt };
};

export const deleteOrder = async (id: string) => {
    const [order] = await db
        .select({ id: orders.id })
        .from(orders)
        .where(eq(orders.id, id))
        .limit(1);
    if (!order) return false;

    await db.delete(orders).where(eq(orders.id, id));
    return true;
};

interface ProductFilters {
    orderId?: string;
    type?: Product["type"];
    search?: string;
}

export const listProducts = async ({ orderId, type, search }: ProductFilters = {}) => {
    const filters: SQL[] = [];
    if (orderId) filters.push(eq(products.orderId, orderId));
    if (type) filters.push(eq(products.type, type));
    if (search) {
        const searchFilter = or(
            like(products.title, `%${search}%`),
            like(products.serialNumber, `%${search}%`),
            like(products.type, `%${search}%`),
        );
        if (searchFilter) filters.push(searchFilter);
    }

    const where = filters.length ? and(...filters) : undefined;
    return (await db.select().from(products).where(where)).map(toProduct);
};

export const createProduct = async (input: CreateProductInput): Promise<Product | null> => {
    const [order] = await db
        .select({ id: orders.id })
        .from(orders)
        .where(eq(orders.id, input.orderId))
        .limit(1);
    if (!order) return null;

    const id = crypto.randomUUID();
    await db.insert(products).values({
        id,
        orderId: input.orderId,
        title: input.title,
        serialNumber: input.serialNumber,
        type: input.type,
        status: input.status,
        condition: input.condition,
        specification: input.specification,
        groupName: input.groupName,
        ownerName: input.ownerName,
        warrantyStart: input.warranty.start,
        warrantyEnd: input.warranty.end,
        priceUsd: input.price.usd.toFixed(2),
        priceUah: input.price.uah.toFixed(2),
    });

    return { id, ...input };
};

export const deleteProduct = async (id: string) => {
    const [product] = await db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.id, id))
        .limit(1);
    if (!product) return false;

    await db.delete(products).where(eq(products.id, id));
    return true;
};
