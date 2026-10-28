import { describe, expect, it } from "vitest";
import { getAivenMigrationConnectionOptions, getMySqlConnectionOptions } from "./connection";

const localUrl = "mysql://orders_hub_app:password@127.0.0.1:3307/orders_hub";
const aivenUrl =
    "mysql://avnadmin:password@mysql.example.aivencloud.com:12345/orders_hub?ssl-mode=REQUIRED";
const certificate = "-----BEGIN CERTIFICATE-----\\ncertificate-data\\n-----END CERTIFICATE-----";

describe("MySQL connection options", () => {
    it("keeps local Docker URLs unencrypted", () => {
        expect(getMySqlConnectionOptions(localUrl)).toEqual({
            database: "orders_hub",
            poolOptions: { uri: localUrl },
            drizzleCredentials: { url: localUrl },
            usesTls: false,
        });
    });

    it("converts an Aiven TLS URL into verified mysql2 options", () => {
        const connection = getMySqlConnectionOptions(aivenUrl, certificate);

        expect(connection).toMatchObject({
            database: "orders_hub",
            poolOptions: {
                uri: "mysql://avnadmin:password@mysql.example.aivencloud.com:12345/orders_hub",
                ssl: {
                    ca: "-----BEGIN CERTIFICATE-----\ncertificate-data\n-----END CERTIFICATE-----",
                    rejectUnauthorized: true,
                },
            },
            usesTls: true,
        });
        expect(connection.drizzleCredentials).toMatchObject({
            host: "mysql.example.aivencloud.com",
            port: 12345,
            database: "orders_hub",
            ssl: { rejectUnauthorized: true },
        });
    });

    it("rejects Aiven TLS URLs without a CA certificate", () => {
        expect(() => getMySqlConnectionOptions(aivenUrl)).toThrow(
            "DATABASE_SSL_CA is required when ssl-mode=REQUIRED.",
        );
    });

    it("rejects Aiven URLs that omit the required TLS mode", () => {
        expect(() =>
            getMySqlConnectionOptions(aivenUrl.replace("?ssl-mode=REQUIRED", ""), certificate),
        ).toThrow("Aiven DATABASE_URL must use ssl-mode=REQUIRED.");
    });

    it("rejects unsupported TLS modes", () => {
        expect(() =>
            getMySqlConnectionOptions(aivenUrl.replace("REQUIRED", "VERIFY_CA"), certificate),
        ).toThrow("Unsupported MySQL ssl-mode: VERIFY_CA.");
    });

    it("requires explicit Aiven credentials for the orders_hub migration target", () => {
        expect(getAivenMigrationConnectionOptions(aivenUrl, certificate).database).toBe(
            "orders_hub",
        );
        expect(() =>
            getAivenMigrationConnectionOptions(
                aivenUrl.replace("/orders_hub", "/defaultdb"),
                certificate,
            ),
        ).toThrow("AIVEN_DATABASE_URL must target the orders_hub database.");
    });
});
