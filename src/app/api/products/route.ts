import { failure, success } from "@/lib/api-response";
import { validateCreateProduct, validateProductQuery } from "@/lib/api-validation";
import { createProduct, listProducts } from "@/server/inventory";

export async function GET(request: Request) {
    const validation = validateProductQuery(new URL(request.url).searchParams);
    if (!validation.success) {
        return failure(422, "VALIDATION_ERROR", "Request validation failed.", validation.details);
    }

    try {
        return success(await listProducts(validation.data));
    } catch {
        return failure(500, "INTERNAL_ERROR", "Unable to load products.");
    }
}

export async function POST(request: Request) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return failure(400, "INVALID_JSON", "Request body must be valid JSON.");
    }

    const validation = validateCreateProduct(body);
    if (!validation.success) {
        return failure(422, "VALIDATION_ERROR", "Request validation failed.", validation.details);
    }

    try {
        const product = await createProduct(validation.data);
        if (!product) {
            return failure(404, "ORDER_NOT_FOUND", "Parent order was not found.");
        }

        return success(product, 201);
    } catch {
        return failure(500, "INTERNAL_ERROR", "Unable to create the product.");
    }
}
