import { config } from "dotenv";

export const TEST_DATABASE_NAME = "orders_hub_test";

export const getTestDatabaseUrl = (value: string | undefined) => {
    if (!value) {
        throw new Error("TEST_DATABASE_URL is not configured.");
    }

    let url: URL;
    try {
        url = new URL(value);
    } catch {
        throw new Error("TEST_DATABASE_URL must be a valid MySQL connection URL.");
    }

    if (url.protocol !== "mysql:") {
        throw new Error("TEST_DATABASE_URL must use the mysql: protocol.");
    }

    if (decodeURIComponent(url.pathname).replace(/^\//, "") !== TEST_DATABASE_NAME) {
        throw new Error(`TEST_DATABASE_URL must target the ${TEST_DATABASE_NAME} database.`);
    }

    return url.toString();
};

export const loadTestDatabaseUrl = () => {
    config({ path: ".env.test" });
    return getTestDatabaseUrl(process.env.TEST_DATABASE_URL);
};
