import { describe, expect, it } from "vitest";
import { messages } from "@/i18n/messages";
import { formatOrderProductCount } from "./OrderList";

describe("formatOrderProductCount", () => {
    it("uses the correct English and Russian product forms", () => {
        expect(formatOrderProductCount(1, "en", messages.en.orders)).toBe("Product");
        expect(formatOrderProductCount(2, "en", messages.en.orders)).toBe("Products");
        expect(formatOrderProductCount(1, "ru", messages.ru.orders)).toBe("продукт");
        expect(formatOrderProductCount(2, "ru", messages.ru.orders)).toBe("продукта");
        expect(formatOrderProductCount(5, "ru", messages.ru.orders)).toBe("продуктов");
        expect(formatOrderProductCount(11, "ru", messages.ru.orders)).toBe("продуктов");
        expect(formatOrderProductCount(21, "ru", messages.ru.orders)).toBe("продукт");
    });
});
