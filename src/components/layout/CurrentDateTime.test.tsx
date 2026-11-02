import { describe, expect, it } from "vitest";
import { formatCurrentDateTime } from "./CurrentDateTime";

describe("formatCurrentDateTime", () => {
    it("formats the same date with the active locale", () => {
        const date = new Date(2025, 0, 2, 13, 4, 5);
        const english = formatCurrentDateTime(date, "en");
        const russian = formatCurrentDateTime(date, "ru");

        expect(english.weekday).toBe(
            new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(date),
        );
        expect(english.date).toBe(
            new Intl.DateTimeFormat("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }).format(date),
        );
        expect(russian.weekday).toBe(
            new Intl.DateTimeFormat("ru-RU", { weekday: "long" }).format(date),
        );
        expect(russian.date).toBe(
            new Intl.DateTimeFormat("ru-RU", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }).format(date),
        );
        expect(english.time).toBe(
            new Intl.DateTimeFormat("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            }).format(date),
        );
        expect(russian.time).toBe(
            new Intl.DateTimeFormat("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            }).format(date),
        );
    });
});
