import { describe, expect, it } from "vitest";
import { getTestDatabaseUrl } from "./test-database";

describe("test database configuration", () => {
    it("accepts only the dedicated MySQL test database", () => {
        expect(
            getTestDatabaseUrl("mysql://test-user:test-password@127.0.0.1:3308/orders_hub_test"),
        ).toContain("/orders_hub_test");
    });

    it("rejects a missing URL and a non-test database", () => {
        expect(() => getTestDatabaseUrl(undefined)).toThrow("TEST_DATABASE_URL is not configured.");
        expect(() => getTestDatabaseUrl("mysql://user:password@127.0.0.1:3307/orders_hub")).toThrow(
            "TEST_DATABASE_URL must target the orders_hub_test database.",
        );
    });
});
