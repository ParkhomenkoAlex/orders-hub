import { afterEach, describe, expect, it, vi } from "vitest";

const originalDatabaseUrl = process.env.DATABASE_URL;

afterEach(() => {
    if (originalDatabaseUrl === undefined) {
        delete process.env.DATABASE_URL;
    } else {
        process.env.DATABASE_URL = originalDatabaseUrl;
    }
    vi.resetModules();
});

describe("database initialization", () => {
    it("defers DATABASE_URL validation until the database is requested", async () => {
        delete process.env.DATABASE_URL;
        vi.resetModules();

        const { getDb } = await import("./index");

        expect(() => getDb()).toThrow("DATABASE_URL is not configured.");
    });
});
