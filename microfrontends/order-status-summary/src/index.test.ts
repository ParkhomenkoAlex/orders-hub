import { describe, expect, it, vi } from "vitest";

describe("Order Status Summary microfrontend rendering", () => {
    it("renders the host-provided localized metrics and escapes text labels", async () => {
        vi.stubGlobal("HTMLElement", class {});
        vi.stubGlobal("customElements", undefined);
        const { createOrderStatusSummaryMarkup } = await import("./index");
        const markup = createOrderStatusSummaryMarkup({
            version: 1,
            locale: "ru",
            metrics: { totalOrders: 2, totalProducts: 3, availableProducts: 1 },
            labels: {
                totalOrders: "Всего приходов",
                totalProducts: "Всего <продуктов>",
                availableProducts: "Доступные продукты",
            },
        });

        expect(markup).toContain("Всего приходов");
        expect(markup).toContain("Всего &lt;продуктов&gt;");
        expect(markup).toContain(">3</strong>");
    });
});
