import type { Product } from "@/types/domain";

const WASM_INVENTORY_VALUE_URL = "/wasm/inventory-value.wasm";

interface InventoryValueWasmExports {
    memory: WebAssembly.Memory;
    sum_cents: (valuesPointer: number, length: number) => bigint;
}

export interface InventoryValueCalculator {
    sumCents: (values: readonly number[]) => number;
}

export type InventoryValueSource = "wasm" | "fallback";

export interface InventoryValueResult {
    cents: number;
    source: InventoryValueSource;
}

export const toUsdCents = (value: number) => Math.round(value * 100);

export const getProductUsdCents = (products: readonly Pick<Product, "price">[]) =>
    products.map((product) => toUsdCents(product.price.usd));

export const sumUsdCentsInJavaScript = (values: readonly number[]) =>
    values.reduce((total, value) => total + value, 0);

export const createInventoryValueCalculator = (
    exports: InventoryValueWasmExports,
): InventoryValueCalculator => ({
    sumCents: (values) => {
        if (values.length * Int32Array.BYTES_PER_ELEMENT > exports.memory.buffer.byteLength) {
            throw new Error("Inventory value input exceeds WebAssembly memory.");
        }

        const cents = new Int32Array(exports.memory.buffer, 0, values.length);
        cents.set(values);
        const total = Number(exports.sum_cents(0, values.length));

        if (!Number.isSafeInteger(total)) {
            throw new Error("WebAssembly inventory value result exceeds safe integer range.");
        }

        return total;
    },
});

let calculatorPromise: Promise<InventoryValueCalculator> | undefined;

export const loadInventoryValueCalculator = async (
    url = WASM_INVENTORY_VALUE_URL,
): Promise<InventoryValueCalculator> => {
    if (!calculatorPromise || url !== WASM_INVENTORY_VALUE_URL) {
        const loading = fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Unable to load the inventory value WebAssembly module.");
                }

                return response.arrayBuffer();
            })
            .then((bytes) => WebAssembly.instantiate(bytes))
            .then(({ instance }) =>
                createInventoryValueCalculator(
                    instance.exports as unknown as InventoryValueWasmExports,
                ),
            );

        if (url === WASM_INVENTORY_VALUE_URL) {
            calculatorPromise = loading.catch((error) => {
                calculatorPromise = undefined;
                throw error;
            });

            return calculatorPromise;
        }

        return loading;
    }

    return calculatorPromise;
};

export const calculateInventoryValue = async (
    values: readonly number[],
): Promise<InventoryValueResult> => {
    try {
        const calculator = await loadInventoryValueCalculator();

        return { cents: calculator.sumCents(values), source: "wasm" };
    } catch {
        return { cents: sumUsdCentsInJavaScript(values), source: "fallback" };
    }
};
