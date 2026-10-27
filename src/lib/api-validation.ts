import { PRODUCT_TYPES } from "@/lib/order-domain";
import type { ProductCondition, ProductStatus, ProductType } from "@/types/domain";

const PRODUCT_STATUSES: readonly ProductStatus[] = ["Available", "In service", "Reserved"];
const PRODUCT_CONDITIONS: readonly ProductCondition[] = ["New", "Used"];
const MAX_TITLE_LENGTH = 255;
const MAX_SERIAL_NUMBER_LENGTH = 128;
const MAX_DECIMAL_VALUE = 999_999_999_999.99;

export interface CreateOrderInput {
    title: string;
    createdAt: string;
}

export interface CreateProductInput {
    orderId: string;
    title: string;
    serialNumber: string;
    type: ProductType;
    status: ProductStatus;
    condition: ProductCondition;
    specification: string;
    groupName: string;
    ownerName?: string;
    warranty: {
        start: string;
        end: string;
    };
    price: {
        usd: number;
        uah: number;
    };
}

type ValidationResult<T> =
    { success: true; data: T } | { success: false; details: Record<string, string> };

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const isCalendarDate = (value: string) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return false;

    const [year, month, day] = match.slice(1).map(Number);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

const readRequiredString = (
    value: unknown,
    field: string,
    maxLength: number,
    details: Record<string, string>,
) => {
    if (typeof value !== "string" || !value.trim()) {
        details[field] = "Required.";
        return undefined;
    }

    const normalized = value.trim();
    if (normalized.length > maxLength) {
        details[field] = `Must not exceed ${maxLength} characters.`;
        return undefined;
    }

    return normalized;
};

const readOptionalString = (
    value: unknown,
    field: string,
    maxLength: number,
    details: Record<string, string>,
) => {
    if (value === undefined || value === null || value === "") return undefined;
    return readRequiredString(value, field, maxLength, details);
};

const readPrice = (value: unknown, field: string, details: Record<string, string>) => {
    if (
        typeof value !== "number" ||
        !Number.isFinite(value) ||
        value < 0 ||
        value > MAX_DECIMAL_VALUE ||
        Math.abs(value * 100 - Math.round(value * 100)) > 0.000001
    ) {
        details[field] = "Must be a non-negative DECIMAL(14,2) value.";
        return undefined;
    }

    return value;
};

const isProductType = (value: unknown): value is ProductType =>
    typeof value === "string" && PRODUCT_TYPES.includes(value as ProductType);

const isProductStatus = (value: unknown): value is ProductStatus =>
    typeof value === "string" && PRODUCT_STATUSES.includes(value as ProductStatus);

const isProductCondition = (value: unknown): value is ProductCondition =>
    typeof value === "string" && PRODUCT_CONDITIONS.includes(value as ProductCondition);

export const validateCreateOrder = (body: unknown): ValidationResult<CreateOrderInput> => {
    const details: Record<string, string> = {};
    if (!isRecord(body)) return { success: false, details: { body: "Must be a JSON object." } };

    const title = readRequiredString(body.title, "title", MAX_TITLE_LENGTH, details);
    const createdAt = body.createdAt ?? new Date().toISOString().slice(0, 10);

    if (typeof createdAt !== "string" || !isCalendarDate(createdAt)) {
        details.createdAt = "Must be a valid ISO calendar date.";
    }

    if (Object.keys(details).length || !title || typeof createdAt !== "string") {
        return { success: false, details };
    }

    return { success: true, data: { title, createdAt } };
};

export const validateCreateProduct = (body: unknown): ValidationResult<CreateProductInput> => {
    const details: Record<string, string> = {};
    if (!isRecord(body)) return { success: false, details: { body: "Must be a JSON object." } };

    const orderId = readRequiredString(body.orderId, "orderId", 36, details);
    const title = readRequiredString(body.title, "title", MAX_TITLE_LENGTH, details);
    const serialNumber = readRequiredString(
        body.serialNumber,
        "serialNumber",
        MAX_SERIAL_NUMBER_LENGTH,
        details,
    );
    const specification = readOptionalString(
        body.specification ?? "Standard",
        "specification",
        MAX_TITLE_LENGTH,
        details,
    );
    const groupName = readOptionalString(
        body.groupName ?? "New arrivals",
        "groupName",
        MAX_TITLE_LENGTH,
        details,
    );
    const ownerName = readOptionalString(body.ownerName, "ownerName", MAX_TITLE_LENGTH, details);
    const warranty = isRecord(body.warranty) ? body.warranty : undefined;
    const price = isRecord(body.price) ? body.price : undefined;

    const type = isProductType(body.type) ? body.type : undefined;
    const status = isProductStatus(body.status) ? body.status : undefined;
    const condition = body.condition ?? "New";
    const productCondition = isProductCondition(condition) ? condition : undefined;
    if (!type) details.type = "Must be a supported product type.";
    if (!status) details.status = "Must be a supported product status.";
    if (!productCondition) details.condition = "Must be a supported product condition.";

    const warrantyStart = warranty?.start;
    const warrantyEnd = warranty?.end;
    if (typeof warrantyStart !== "string" || !isCalendarDate(warrantyStart)) {
        details["warranty.start"] = "Must be a valid ISO calendar date.";
    }
    if (typeof warrantyEnd !== "string" || !isCalendarDate(warrantyEnd)) {
        details["warranty.end"] = "Must be a valid ISO calendar date.";
    }
    if (
        typeof warrantyStart === "string" &&
        typeof warrantyEnd === "string" &&
        isCalendarDate(warrantyStart) &&
        isCalendarDate(warrantyEnd) &&
        warrantyEnd < warrantyStart
    ) {
        details["warranty.end"] = "Must not be earlier than the warranty start date.";
    }

    const priceUsd = readPrice(price?.usd, "price.usd", details);
    const priceUah = readPrice(price?.uah, "price.uah", details);

    if (
        Object.keys(details).length ||
        !orderId ||
        !title ||
        !serialNumber ||
        !specification ||
        !groupName ||
        !type ||
        !status ||
        !productCondition ||
        typeof warrantyStart !== "string" ||
        typeof warrantyEnd !== "string" ||
        priceUsd === undefined ||
        priceUah === undefined
    ) {
        return { success: false, details };
    }

    return {
        success: true,
        data: {
            orderId,
            title,
            serialNumber,
            type,
            status,
            condition: productCondition,
            specification,
            groupName,
            ...(ownerName ? { ownerName } : {}),
            warranty: { start: warrantyStart, end: warrantyEnd },
            price: { usd: priceUsd, uah: priceUah },
        },
    };
};

export const validateProductQuery = (searchParams: URLSearchParams) => {
    const requestedType = searchParams.get("type");
    if (requestedType && !isProductType(requestedType)) {
        return { success: false as const, details: { type: "Must be a supported product type." } };
    }

    const orderId = searchParams.get("orderId")?.trim() || undefined;
    const search = searchParams.get("search")?.trim() || undefined;
    const type = requestedType && isProductType(requestedType) ? requestedType : undefined;
    return { success: true as const, data: { orderId, type, search } };
};
