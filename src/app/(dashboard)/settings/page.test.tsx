import { describe, expect, it, vi } from "vitest";

const authentication = vi.hoisted(() => ({ verifyAuthToken: vi.fn() }));
const request = vi.hoisted(() => ({ cookies: vi.fn(), redirect: vi.fn() }));

vi.mock("next/headers", () => ({ cookies: request.cookies }));
vi.mock("next/navigation", () => ({ redirect: request.redirect }));
vi.mock("@/auth/jwt", () => ({ verifyAuthToken: authentication.verifyAuthToken }));
vi.mock("@/components/auth/AuthSettings", () => ({ AuthSettings: () => null }));

import SettingsPage from "./page";

describe("SettingsPage", () => {
    it("redirects anonymous visitors before rendering protected content", async () => {
        request.cookies.mockResolvedValue({ get: vi.fn().mockReturnValue(undefined) });
        authentication.verifyAuthToken.mockResolvedValue(null);
        request.redirect.mockImplementation(() => {
            throw new Error("redirected");
        });

        await expect(SettingsPage()).rejects.toThrow("redirected");
        expect(request.redirect).toHaveBeenCalledWith("/login");
    });

    it("renders protected settings only after a valid session verifies", async () => {
        request.cookies.mockResolvedValue({
            get: vi.fn().mockReturnValue({ value: "valid-token" }),
        });
        authentication.verifyAuthToken.mockResolvedValue({ username: "demo-user" });

        const page = await SettingsPage();

        expect(authentication.verifyAuthToken).toHaveBeenCalledWith("valid-token");
        expect(page.props).toEqual({ username: "demo-user" });
    });
});
