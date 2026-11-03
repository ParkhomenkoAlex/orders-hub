import "server-only";

export class AuthConfigurationError extends Error {
    constructor() {
        super("Authentication is not configured.");
        this.name = "AuthConfigurationError";
    }
}

const getRequiredValue = (
    name: "AUTH_DEMO_USERNAME" | "AUTH_DEMO_PASSWORD" | "AUTH_JWT_SECRET",
) => {
    const value = process.env[name];

    if (!value) {
        throw new AuthConfigurationError();
    }

    return value;
};

export const getDemoCredentials = () => ({
    username: getRequiredValue("AUTH_DEMO_USERNAME"),
    password: getRequiredValue("AUTH_DEMO_PASSWORD"),
});

export const getJwtSecret = () => {
    const secret = getRequiredValue("AUTH_JWT_SECRET");

    if (Buffer.byteLength(secret, "utf8") < 32) {
        throw new AuthConfigurationError();
    }

    return secret;
};
