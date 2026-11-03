import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { getDemoCredentials } from "./config";

const digest = (value: string) => createHash("sha256").update(value).digest();

const matches = (actual: string, expected: string) =>
    timingSafeEqual(digest(actual), digest(expected));

export const verifyDemoCredentials = (username: string, password: string) => {
    const configured = getDemoCredentials();

    return matches(username, configured.username) && matches(password, configured.password);
};
