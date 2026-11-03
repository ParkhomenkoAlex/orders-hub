import "server-only";

import { AUTH_COOKIE_NAME, AUTH_TOKEN_LIFETIME_SECONDS } from "./constants";

const isSecure = () => process.env.NODE_ENV === "production";

export const authCookieOptions = () => ({
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isSecure(),
    path: "/",
    maxAge: AUTH_TOKEN_LIFETIME_SECONDS,
});

export const expiredAuthCookieOptions = () => ({
    ...authCookieOptions(),
    maxAge: 0,
});

export { AUTH_COOKIE_NAME };
