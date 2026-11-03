import { NextResponse } from "next/server";
import { authCookieOptions, AUTH_COOKIE_NAME } from "@/auth/cookie";
import { AuthConfigurationError } from "@/auth/config";
import { verifyDemoCredentials } from "@/auth/credentials";
import { createAuthToken } from "@/auth/jwt";
import { hasSameOrigin } from "@/auth/origin";
import { failure } from "@/lib/api-response";

const invalidLoginRedirect = (request: Request) =>
    NextResponse.redirect(new URL("/login?error=invalid", request.url), 303);

export async function POST(request: Request) {
    if (!hasSameOrigin(request)) {
        return failure(403, "INVALID_ORIGIN", "Unable to submit login.");
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.startsWith("application/x-www-form-urlencoded")) {
        return failure(415, "UNSUPPORTED_MEDIA_TYPE", "Use a form-encoded login request.");
    }

    let formData: FormData;
    try {
        formData = await request.formData();
    } catch {
        return invalidLoginRedirect(request);
    }

    const username = formData.get("username");
    const password = formData.get("password");
    if (
        typeof username !== "string" ||
        typeof password !== "string" ||
        !username.trim() ||
        !password
    ) {
        return invalidLoginRedirect(request);
    }

    try {
        if (!verifyDemoCredentials(username.trim(), password)) {
            return invalidLoginRedirect(request);
        }

        const response = NextResponse.redirect(new URL("/settings", request.url), 303);
        response.cookies.set(
            AUTH_COOKIE_NAME,
            await createAuthToken(username.trim()),
            authCookieOptions(),
        );
        return response;
    } catch (error) {
        if (error instanceof AuthConfigurationError) {
            return failure(500, "AUTH_UNAVAILABLE", "Authentication is unavailable.");
        }

        return failure(500, "AUTH_UNAVAILABLE", "Authentication is unavailable.");
    }
}
