import { defineConfig, devices } from "@playwright/test";
import { loadTestDatabaseUrl } from "./tests/test-database";

const testDatabaseUrl = loadTestDatabaseUrl();

export default defineConfig({
    testDir: "./tests/browser",
    timeout: 60_000,
    fullyParallel: false,
    reporter: "list",
    use: {
        baseURL: "http://127.0.0.1:3100",
        trace: "retain-on-failure",
    },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    webServer: {
        command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
        url: "http://127.0.0.1:3100/orders",
        reuseExistingServer: false,
        timeout: 120_000,
        env: {
            ...process.env,
            DATABASE_URL: testDatabaseUrl,
            NEXT_DIST_DIR: ".next-browser-tests",
            NEXT_PUBLIC_REALTIME_URL: "http://127.0.0.1:3101",
        },
    },
});
