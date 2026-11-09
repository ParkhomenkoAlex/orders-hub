import { afterAll, afterEach, describe, expect, it } from "vitest";
import { GET as getProducts, POST as createProductRoute } from "@/app/api/products/route";
import { DELETE as deleteOrderRoute } from "@/app/api/orders/[orderId]/route";
import { POST as createOrderRoute } from "@/app/api/orders/route";
import { getDb } from "@/db";
import { deleteOrder } from "@/server/inventory";

const testTitle = `integration-order-${crypto.randomUUID()}`;
let orderId: string | undefined;

const readJson = async <Data>(response: Response) => response.json() as Promise<Data>;

describe.sequential("Orders and Products persistence", () => {
    afterEach(async () => {
        if (orderId) {
            await deleteOrder(orderId);
            orderId = undefined;
        }
    });

    afterAll(async () => {
        await getDb().$client.end();
    });

    it("creates a product for an order and removes it through the database cascade", async () => {
        const createOrderResponse = await createOrderRoute(
            new Request("http://localhost/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: testTitle }),
            }),
        );
        expect(createOrderResponse.status).toBe(201);
        const orderBody = await readJson<{ data: { id: string; title: string } }>(
            createOrderResponse,
        );
        orderId = orderBody.data.id;
        expect(orderBody.data.title).toBe(testTitle);

        const createProductResponse = await createProductRoute(
            new Request("http://localhost/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId,
                    title: "Integration monitor",
                    serialNumber: `INTEGRATION-${crypto.randomUUID()}`,
                    type: "Monitors",
                    status: "Available",
                    condition: "New",
                    specification: "Integration test",
                    groupName: "Integration",
                    warranty: { start: "2026-01-01", end: "2027-01-01" },
                    price: { usd: 100, uah: 4100 },
                }),
            }),
        );
        expect(createProductResponse.status).toBe(201);

        const productsBeforeDeletion = await getProducts(
            new Request(`http://localhost/api/products?orderId=${orderId}`),
        );
        expect(productsBeforeDeletion.status).toBe(200);
        expect(
            await readJson<{ data: Array<{ orderId: string }> }>(productsBeforeDeletion),
        ).toMatchObject({ data: [{ orderId }] });

        const deleteOrderResponse = await deleteOrderRoute(new Request("http://localhost"), {
            params: Promise.resolve({ orderId }),
        });
        expect(deleteOrderResponse.status).toBe(200);
        orderId = undefined;

        const productsAfterDeletion = await getProducts(
            new Request(`http://localhost/api/products?orderId=${orderBody.data.id}`),
        );
        expect(productsAfterDeletion.status).toBe(200);
        expect(await readJson<{ data: unknown[] }>(productsAfterDeletion)).toEqual({ data: [] });
    });
});
