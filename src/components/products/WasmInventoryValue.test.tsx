import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { WasmInventoryValueContent } from "./WasmInventoryValue";

describe("WasmInventoryValueContent", () => {
    it("renders localized WebAssembly and fallback calculation states", () => {
        const wasm = renderToStaticMarkup(
            <I18nProvider initialLocale="en">
                <WasmInventoryValueContent
                    state={{ status: "ready", cents: 1234, source: "wasm" }}
                />
            </I18nProvider>,
        );
        const fallback = renderToStaticMarkup(
            <I18nProvider initialLocale="ru">
                <WasmInventoryValueContent
                    state={{ status: "ready", cents: 1234, source: "fallback" }}
                />
            </I18nProvider>,
        );

        expect(wasm).toContain("Calculated with WebAssembly");
        expect(wasm).toContain("US$12.34");
        expect(fallback).toContain("Рассчитано резервным JavaScript-вычислением");
        expect(fallback).toContain("12,34 $");
    });

    it("renders localized loading, empty, and upstream error states", () => {
        const loading = renderToStaticMarkup(
            <I18nProvider initialLocale="en">
                <WasmInventoryValueContent state={{ status: "loading" }} />
            </I18nProvider>,
        );
        const empty = renderToStaticMarkup(
            <I18nProvider initialLocale="ru">
                <WasmInventoryValueContent state={{ status: "empty" }} />
            </I18nProvider>,
        );
        const error = renderToStaticMarkup(
            <I18nProvider initialLocale="en">
                <WasmInventoryValueContent state={{ status: "error" }} />
            </I18nProvider>,
        );

        expect(loading).toContain("Loading inventory value");
        expect(empty).toContain("Нет продуктов для расчёта стоимости.");
        expect(error).toContain("Inventory value is unavailable.");
    });
});
