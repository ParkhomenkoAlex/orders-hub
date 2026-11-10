import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
    calculateInventoryValue,
    createInventoryValueCalculator,
    getProductUsdCents,
    loadInventoryValueCalculator,
    sumUsdCentsInJavaScript,
    toUsdCents,
} from "./wasm-inventory-value";
import type { Product } from "@/types/domain";

const product = (usd: number): Pick<Product, "price"> => ({ price: { usd, uah: 0 } });

const loadCompiledCalculator = async () => {
    const bytes = await readFile(resolve(process.cwd(), "public/wasm/inventory-value.wasm"));
    const { instance } = await WebAssembly.instantiate(bytes);

    return createInventoryValueCalculator(
        instance.exports as unknown as Parameters<typeof createInventoryValueCalculator>[0],
    );
};

describe("inventory value WebAssembly calculation", () => {
    it("converts real product prices to deterministic fixed-point cents", () => {
        expect(getProductUsdCents([product(12.34), product(0.1), product(5)])).toEqual([
            1234, 10, 500,
        ]);
        expect(toUsdCents(19.995)).toBe(2000);
    });

    it("matches the JavaScript fallback for representative and empty inputs", async () => {
        const calculator = await loadCompiledCalculator();

        for (const values of [[1234, 10, 500], [], [0, 99, 1, 2500]]) {
            expect(calculator.sumCents(values)).toBe(sumUsdCentsInJavaScript(values));
        }
    });

    it("uses the JavaScript fallback when loading the module fails", async () => {
        const fetchMock = vi.fn().mockRejectedValue(new Error("Network unavailable"));
        vi.stubGlobal("fetch", fetchMock);

        await expect(loadInventoryValueCalculator("/missing.wasm")).rejects.toThrow(
            "Network unavailable",
        );
        await expect(calculateInventoryValue([250, 125])).resolves.toEqual({
            cents: 375,
            source: "fallback",
        });
    });
});
