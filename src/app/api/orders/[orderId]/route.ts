import { failure, success } from "@/lib/api-response";
import { deleteOrder } from "@/server/inventory";

interface RouteContext {
    params: Promise<{ orderId: string }>;
}

export async function DELETE(_: Request, { params }: RouteContext) {
    try {
        const { orderId } = await params;
        if (!(await deleteOrder(orderId))) {
            return failure(404, "ORDER_NOT_FOUND", "Order was not found.");
        }

        return success({ id: orderId });
    } catch {
        return failure(500, "INTERNAL_ERROR", "Unable to delete the order.");
    }
}
