import { SignJWT, decodeJwt } from "jose";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
    AUTH_JWT_ALGORITHM,
    AUTH_JWT_AUDIENCE,
    AUTH_JWT_ISSUER,
    AUTH_TOKEN_LIFETIME_SECONDS,
} from "./constants";
import { AuthConfigurationError } from "./config";
import { verifyDemoCredentials } from "./credentials";
import { createAuthToken, verifyAuthToken } from "./jwt";

const testSecret = "0123456789abcdef0123456789abcdef";
const originalEnvironment = {
    username: process.env.AUTH_DEMO_USERNAME,
    password: process.env.AUTH_DEMO_PASSWORD,
    secret: process.env.AUTH_JWT_SECRET,
};

const setAuthenticationEnvironment = () => {
    process.env.AUTH_DEMO_USERNAME = "demo-user";
    process.env.AUTH_DEMO_PASSWORD = "demo-password";
    process.env.AUTH_JWT_SECRET = testSecret;
};

const restoreEnvironmentValue = (name: keyof typeof originalEnvironment) => {
    const environmentName =
        name === "username"
            ? "AUTH_DEMO_USERNAME"
            : name === "password"
              ? "AUTH_DEMO_PASSWORD"
              : "AUTH_JWT_SECRET";
    const value = originalEnvironment[name];

    if (value === undefined) {
        delete process.env[environmentName];
    } else {
        process.env[environmentName] = value;
    }
};

beforeEach(setAuthenticationEnvironment);
afterEach(() => {
    restoreEnvironmentValue("username");
    restoreEnvironmentValue("password");
    restoreEnvironmentValue("secret");
});

describe("JWT authentication", () => {
    it("signs an expiring token with the required claims and verifies it", async () => {
        const token = await createAuthToken("demo-user");
        const payload = decodeJwt(token);

        expect(payload).toMatchObject({
            sub: "demo-user",
            iss: AUTH_JWT_ISSUER,
            aud: AUTH_JWT_AUDIENCE,
        });
        expect(payload.iat).toEqual(expect.any(Number));
        expect(payload.exp).toBeGreaterThanOrEqual(
            (payload.iat ?? 0) + AUTH_TOKEN_LIFETIME_SECONDS - 1,
        );
        await expect(verifyAuthToken(token)).resolves.toEqual({ username: "demo-user" });
    });

    it("rejects malformed, tampered, expired, and incorrectly scoped tokens", async () => {
        const key = new TextEncoder().encode(testSecret);
        const baseToken = () =>
            new SignJWT()
                .setProtectedHeader({ alg: AUTH_JWT_ALGORITHM })
                .setSubject("demo-user")
                .setIssuer(AUTH_JWT_ISSUER)
                .setAudience(AUTH_JWT_AUDIENCE)
                .setIssuedAt();
        const expired = await baseToken()
            .setExpirationTime(Math.floor(Date.now() / 1000) - 1)
            .sign(key);
        const wrongIssuer = await baseToken()
            .setIssuer("other-issuer")
            .setExpirationTime("1h")
            .sign(key);
        const wrongAudience = await baseToken()
            .setAudience("other-audience")
            .setExpirationTime("1h")
            .sign(key);
        const token = await createAuthToken("demo-user");
        const tampered = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;

        await expect(verifyAuthToken(undefined)).resolves.toBeNull();
        await expect(verifyAuthToken("not-a-token")).resolves.toBeNull();
        await expect(verifyAuthToken(tampered)).resolves.toBeNull();
        await expect(verifyAuthToken(expired)).resolves.toBeNull();
        await expect(verifyAuthToken(wrongIssuer)).resolves.toBeNull();
        await expect(verifyAuthToken(wrongAudience)).resolves.toBeNull();
    });

    it("requires a strong signing secret only when JWT functionality is invoked", async () => {
        process.env.AUTH_JWT_SECRET = "too-short";

        await expect(createAuthToken("demo-user")).rejects.toBeInstanceOf(AuthConfigurationError);
        await expect(verifyAuthToken("not-a-token")).rejects.toBeInstanceOf(AuthConfigurationError);
    });

    it("verifies configured demo credentials without accepting either incorrect value", () => {
        expect(verifyDemoCredentials("demo-user", "demo-password")).toBe(true);
        expect(verifyDemoCredentials("other-user", "demo-password")).toBe(false);
        expect(verifyDemoCredentials("demo-user", "other-password")).toBe(false);
    });

    it("fails closed when the configured credentials are missing", () => {
        delete process.env.AUTH_DEMO_PASSWORD;

        expect(() => verifyDemoCredentials("demo-user", "demo-password")).toThrow(
            AuthConfigurationError,
        );
    });
});
