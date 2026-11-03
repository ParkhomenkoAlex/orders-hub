import "server-only";

import { jwtVerify, SignJWT } from "jose";
import {
    AUTH_JWT_ALGORITHM,
    AUTH_JWT_AUDIENCE,
    AUTH_JWT_ISSUER,
    AUTH_TOKEN_LIFETIME_SECONDS,
    type AuthSession,
} from "./constants";
import { AuthConfigurationError, getJwtSecret } from "./config";

const getSigningKey = () => new TextEncoder().encode(getJwtSecret());

export const createAuthToken = async (username: string) =>
    new SignJWT()
        .setProtectedHeader({ alg: AUTH_JWT_ALGORITHM, typ: "JWT" })
        .setSubject(username)
        .setIssuer(AUTH_JWT_ISSUER)
        .setAudience(AUTH_JWT_AUDIENCE)
        .setIssuedAt()
        .setExpirationTime(`${AUTH_TOKEN_LIFETIME_SECONDS}s`)
        .sign(getSigningKey());

export const verifyAuthToken = async (token: string | undefined): Promise<AuthSession | null> => {
    if (!token) {
        return null;
    }

    try {
        const { payload } = await jwtVerify(token, getSigningKey(), {
            algorithms: [AUTH_JWT_ALGORITHM],
            issuer: AUTH_JWT_ISSUER,
            audience: AUTH_JWT_AUDIENCE,
        });

        if (
            typeof payload.sub !== "string" ||
            !payload.sub ||
            typeof payload.iat !== "number" ||
            typeof payload.exp !== "number"
        ) {
            return null;
        }

        return { username: payload.sub };
    } catch (error) {
        if (error instanceof AuthConfigurationError) {
            throw error;
        }

        return null;
    }
};
