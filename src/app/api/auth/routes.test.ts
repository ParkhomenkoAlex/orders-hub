import { beforeEach, describe, expect, it, vi } from "vitest";

const authentication = vi.hoisted(() => ({
    createAuthToken: vi.fn(),
    verifyDemoCredentials: vi.fn(),
}));

vi.mock("@/auth/credentials", () => ({
    verifyDemoCredentials: authentication.verifyDemoCredentials,
}));
vi.mock("@/auth/jwt", () => ({
    createAuthToken: authentication.createAuthToken,
}));

import { POST as login } from "./login/route";
import { POST as logout } from "./logout/route";

const loginRequest = (
    body = new URLSearchParams({ username: "demo-user", password: "demo-password" }),
    headers: HeadersInit = { origin: "http://localhost" },
) =>
    new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers,
        body,
    });

describe("authentication API routes", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        authentication.verifyDemoCredentials.mockReturnValue(true);
        authentication.createAuthToken.mockResolvedValue("signed-token");
    });

    it("sets an HTTP-only same-site JWT cookie and redirects after a valid login", async () => {
        const response = await login(loginRequest());
        const cookie = response.headers.get("set-cookie");

        expect(response.status).toBe(303);
        expect(response.headers.get("location")).toBe("http://localhost/settings");
        expect(cookie).toContain("orders-hub.auth=signed-token");
        expect(cookie).toContain("Path=/");
        expect(cookie).toContain("Max-Age=28800");
        expect(cookie).toContain("HttpOnly");
        expect(cookie).toMatch(/SameSite=Lax/i);
        expect(authentication.verifyDemoCredentials).toHaveBeenCalledWith(
            "demo-user",
            "demo-password",
        );
    });

    it("returns the same generic redirect for incorrect usernames and passwords", async () => {
        authentication.verifyDemoCredentials.mockReturnValue(false);

        const wrongUsername = await login(
            loginRequest(new URLSearchParams({ username: "other", password: "demo-password" })),
        );
        const wrongPassword = await login(
            loginRequest(new URLSearchParams({ username: "demo-user", password: "other" })),
        );

        expect(wrongUsername.status).toBe(303);
        expect(wrongPassword.status).toBe(303);
        expect(wrongUsername.headers.get("location")).toBe("http://localhost/login?error=invalid");
        expect(wrongPassword.headers.get("location")).toBe("http://localhost/login?error=invalid");
    });

    it("rejects invalid login payloads, origins, and content types", async () => {
        const missingPassword = await login(
            loginRequest(new URLSearchParams({ username: "demo-user" })),
        );
        const invalidOrigin = await login(
            loginRequest(undefined, { origin: "https://attacker.test" }),
        );
        const invalidContentType = await login(
            new Request("http://localhost/api/auth/login", {
                method: "POST",
                headers: { origin: "http://localhost", "content-type": "application/json" },
                body: JSON.stringify({ username: "demo-user", password: "demo-password" }),
            }),
        );

        expect(missingPassword.headers.get("location")).toBe(
            "http://localhost/login?error=invalid",
        );
        expect(invalidOrigin.status).toBe(403);
        expect(invalidContentType.status).toBe(415);
        await expect(invalidOrigin.json()).resolves.toMatchObject({
            error: { code: "INVALID_ORIGIN" },
        });
        await expect(invalidContentType.json()).resolves.toMatchObject({
            error: { code: "UNSUPPORTED_MEDIA_TYPE" },
        });
    });

    it("returns a generic unavailable response when authentication configuration fails", async () => {
        authentication.verifyDemoCredentials.mockImplementation(() => {
            throw new Error("missing credentials");
        });

        const response = await login(loginRequest());

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({
            error: { code: "AUTH_UNAVAILABLE", message: "Authentication is unavailable." },
        });
    });

    it("clears the matching cookie and redirects on same-origin logout", async () => {
        const response = await logout(
            new Request("http://localhost/api/auth/logout", {
                method: "POST",
                headers: { origin: "http://localhost" },
            }),
        );

        expect(response.status).toBe(303);
        expect(response.headers.get("location")).toBe("http://localhost/login");
        expect(response.headers.get("set-cookie")).toMatch(
            /orders-hub\.auth=; Path=\/; Max-Age=0; HttpOnly; SameSite=Lax/i,
        );
    });

    it("rejects cross-origin logout", async () => {
        const response = await logout(
            new Request("http://localhost/api/auth/logout", {
                method: "POST",
                headers: { origin: "https://attacker.test" },
            }),
        );

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toMatchObject({ error: { code: "INVALID_ORIGIN" } });
    });
});
