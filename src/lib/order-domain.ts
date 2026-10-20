import type { Order, Price, Product, ProductType } from "@/types/domain";

export const PRODUCT_TYPES: readonly ProductType[] = [
    "Monitors",
    "Laptops",
    "Motherboards",
    "Accessories",
];

export const getOrderProducts = (products: Product[], orderId: string) =>
    products.filter((product) => product.orderId === orderId);

export const groupProductsByOrderId = (products: Product[]) =>
    products.reduce<Map<string, Product[]>>((groups, product) => {
        const group = groups.get(product.orderId) ?? [];
        group.push(product);
        groups.set(product.orderId, group);
        return groups;
    }, new Map());

export const getOrderTotal = (products: Product[]): Price => {
    const totals = products.reduce(
        (total, product) => ({
            usd: total.usd + Math.round(product.price.usd * 100),
            uah: total.uah + Math.round(product.price.uah * 100),
        }),
        { usd: 0, uah: 0 },
    );
    return { usd: totals.usd / 100, uah: totals.uah / 100 };
};

export const filterProducts = (products: Product[], type: ProductType | "all", query: string) => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return products.filter((product) => {
        const matchesType = type === "all" || product.type === type;
        const searchableValue =
            `${product.title} ${product.serialNumber} ${product.type}`.toLocaleLowerCase();
        return matchesType && (!normalizedQuery || searchableValue.includes(normalizedQuery));
    });
};

export const filterOrders = (
    orders: Order[],
    productsByOrderId: Map<string, Product[]>,
    query: string,
) => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return orders;
    return orders.filter((order) => {
        const products = productsByOrderId.get(order.id) ?? [];
        return (
            order.title.toLocaleLowerCase().includes(normalizedQuery) ||
            products.some((product) =>
                `${product.title} ${product.serialNumber} ${product.type}`
                    .toLocaleLowerCase()
                    .includes(normalizedQuery),
            )
        );
    });
};

export const createId = (prefix: "order" | "product") => `${prefix}-${crypto.randomUUID()}`;
