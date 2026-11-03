import { describe, expect, it } from "vitest";
import { formatCurrency } from "./formatters";

describe("formatCurrency", () => {
    it("renders exact deterministic UAH values for English and Russian", () => {
        expect(formatCurrency(231, "UAH", "en")).toBe("UAH 231.00");
        expect(formatCurrency(231, "UAH", "ru")).toBe("231,00 грн.");
    });

    it("uses explicit locale separators and currency placement without runtime ICU data", () => {
        expect(formatCurrency(1_234.5, "USD", "en")).toBe("US$1,234.50");
        expect(formatCurrency(1_234.5, "USD", "ru")).toBe("1 234,50 $");
    });
});
