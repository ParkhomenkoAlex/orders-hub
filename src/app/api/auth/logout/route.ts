import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, expiredAuthCookieOptions } from "@/auth/cookie";
import { hasSameOrigin } from "@/auth/origin";
import { failure } from "@/lib/api-response";

export async function POST(request: Request) {
    if (!hasSameOrigin(request)) {
        return failure(403, "INVALID_ORIGIN", "Unable to log out.");
    }

    const response = NextResponse.redirect(new URL("/login", request.url), 303);
    response.cookies.set(AUTH_COOKIE_NAME, "", expiredAuthCookieOptions());
    return response;
}
