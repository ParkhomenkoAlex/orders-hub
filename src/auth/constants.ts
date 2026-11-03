export const AUTH_COOKIE_NAME = "orders-hub.auth";
export const AUTH_JWT_ISSUER = "orders-hub";
export const AUTH_JWT_AUDIENCE = "orders-hub-dashboard";
export const AUTH_JWT_ALGORITHM = "HS256";
export const AUTH_TOKEN_LIFETIME_SECONDS = 60 * 60 * 8;

export interface AuthSession {
    username: string;
}
