import { failure, success } from "@/lib/api-response";
import { validateCreateOrder } from "@/lib/api-validation";
import { createOrder, listOrders } from "@/server/inventory";

export async function GET() {
    try {
        return success(await listOrders());
    } catch {
        return failure(500, "INTERNAL_ERROR", "Unable to load orders.");
    }
}

export async function POST(request: Request) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return failure(400, "INVALID_JSON", "Request body must be valid JSON.");
    }

    const validation = validateCreateOrder(body);
    if (!validation.success) {
        return failure(422, "VALIDATION_ERROR", "Request validation failed.", validation.details);
    }

    try {
        return success(await createOrder(validation.data), 201);
    } catch {
        return failure(500, "INTERNAL_ERROR", "Unable to create the order.");
    }
}
