import type { Locale } from "./config";

export type CountForm = "one" | "few" | "many";

export const getCountForm = (count: number, locale: Locale): CountForm => {
    if (locale !== "ru") {
        return count === 1 ? "one" : "many";
    }

    const lastTwoDigits = Math.abs(count) % 100;
    const lastDigit = Math.abs(count) % 10;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return "many";
    }

    if (lastDigit === 1) {
        return "one";
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
        return "few";
    }

    return "many";
};
