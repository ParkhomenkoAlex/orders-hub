import { connection } from "next/server";
import { OrdersWorkspace } from "@/components/orders/OrdersWorkspace";
import { listOrders, listProducts } from "@/server/inventory";

const getInitialInventory = async () => {
    try {
        const [initialOrders, initialProducts] = await Promise.all([listOrders(), listProducts()]);

        return { initialOrders, initialProducts };
    } catch {
        return undefined;
    }
};

export default async function OrdersPage() {
    await connection();
    const initialInventory = await getInitialInventory();

    return <OrdersWorkspace {...initialInventory} />;
}
