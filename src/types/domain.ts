export type ProductType = "Monitors" | "Laptops" | "Motherboards" | "Accessories";

export type ProductStatus = "Available" | "In service" | "Reserved";
export type ProductCondition = "New" | "Used";

export interface Price {
    usd: number;
    uah: number;
}

export interface Warranty {
    start: string;
    end: string;
}

export interface Order {
    id: string;
    title: string;
    createdAt: string;
}

export interface Product {
    id: string;
    orderId: string;
    title: string;
    serialNumber: string;
    type: ProductType;
    status: ProductStatus;
    condition: ProductCondition;
    specification: string;
    groupName: string;
    ownerName?: string;
    warranty: Warranty;
    price: Price;
}

export interface OrderDraft {
    title: string;
    createdAt: string;
}

export interface ProductDraft {
    title: string;
    serialNumber: string;
    type: ProductType;
    status: ProductStatus;
    warrantyStart: string;
    warrantyEnd: string;
    priceUsd: string;
    priceUah: string;
}
