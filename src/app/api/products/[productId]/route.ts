import { failure, success } from "@/lib/api-response";
import { deleteProduct } from "@/server/inventory";

interface RouteContext {
    params: Promise<{ productId: string }>;
}

export async function DELETE(_: Request, { params }: RouteContext) {
    try {
        const { productId } = await params;
        if (!(await deleteProduct(productId))) {
            return failure(404, "PRODUCT_NOT_FOUND", "Product was not found.");
        }

        return success({ id: productId });
    } catch {
        return failure(500, "INTERNAL_ERROR", "Unable to delete the product.");
    }
}
