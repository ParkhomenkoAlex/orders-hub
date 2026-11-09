import { expect, test, type APIRequestContext } from "@playwright/test";

const orderTitle = `browser-order-${crypto.randomUUID()}`;
const productTitle = `browser-monitor-${crypto.randomUUID()}`;

const deleteOrderByTitle = async (request: APIRequestContext, title: string) => {
    const ordersResponse = await request.get("/api/orders");
    if (!ordersResponse.ok()) {
        throw new Error("Unable to list Orders while cleaning up the browser test data.");
    }

    const body = (await ordersResponse.json()) as { data: Array<{ id: string; title: string }> };
    const order = body.data.find((item) => item.title === title);
    if (order) {
        const deleteResponse = await request.delete(`/api/orders/${order.id}`);
        if (!deleteResponse.ok()) {
            throw new Error("Unable to clean up the browser-created Order.");
        }
    }
};

test.afterEach(async ({ request }) => {
    await deleteOrderByTitle(request, orderTitle);
});

test("persists an order and product through the UI and cascades product cleanup", async ({
    page,
}) => {
    await page.goto("/orders");
    await page.getByRole("button", { name: "Add order" }).click();
    await page.getByLabel("Order title").fill(orderTitle);
    await page.getByRole("button", { name: "Create order" }).click();

    const orderButton = page.getByRole("button", { name: `View details for ${orderTitle}` });
    await expect(orderButton).toBeVisible();
    await orderButton.click();

    await page.getByRole("button", { name: "Add product", exact: true }).click();
    const addProductDialog = page.getByRole("dialog", { name: "Add product" });
    await addProductDialog.getByLabel("Product title").fill(productTitle);
    await addProductDialog.getByLabel("Serial number").fill(`BROWSER-${crypto.randomUUID()}`);
    await addProductDialog.getByLabel("Product type").selectOption("Monitors");
    await addProductDialog.getByLabel("Warranty start").fill("2026-01-01");
    await addProductDialog.getByLabel("Warranty end").fill("2027-01-01");
    await addProductDialog.getByLabel("Price, USD").fill("100");
    await addProductDialog.getByLabel("Price, UAH").fill("4100");
    await addProductDialog.getByRole("button", { name: "Add product", exact: true }).click();
    await expect(page.getByText(productTitle, { exact: true })).toBeVisible();

    await page.reload();
    const persistedOrderButton = page.getByRole("button", {
        name: `View details for ${orderTitle}`,
    });
    await expect(persistedOrderButton).toBeVisible();
    await persistedOrderButton.click();
    await expect(page.getByText(productTitle, { exact: true })).toBeVisible();

    const orderResponse = await page.request.get("/api/orders");
    const orders = (await orderResponse.json()) as { data: Array<{ id: string; title: string }> };
    const order = orders.data.find((item) => item.title === orderTitle);
    if (!order) {
        throw new Error("The browser-created order was not returned by the Orders API.");
    }

    await page
        .locator('[data-order-id][aria-expanded="true"]')
        .filter({ hasText: orderTitle })
        .click();
    await expect(
        page.getByRole("button", { name: `View details for ${orderTitle}` }),
    ).toBeVisible();
    await page.getByRole("button", { name: `Delete ${orderTitle}` }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page.getByRole("button", { name: `View details for ${orderTitle}` })).toHaveCount(
        0,
    );

    const productsResponse = await page.request.get(`/api/products?orderId=${order.id}`);
    expect(productsResponse.ok()).toBe(true);
    expect(await productsResponse.json()).toEqual({ data: [] });
});
