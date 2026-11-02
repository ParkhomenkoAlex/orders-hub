import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME } from "@/i18n/config";

const request = vi.hoisted(() => ({ cookies: vi.fn() }));

vi.mock("next/headers", () => ({ cookies: request.cookies }));

import RootLayout from "./layout";

const renderLayout = async (locale?: string) => {
    const get = vi.fn().mockReturnValue(locale ? { value: locale } : undefined);
    request.cookies.mockResolvedValue({ get });

    const layout = await RootLayout({ children: <main /> } as Parameters<typeof RootLayout>[0]);

    return { get, layout };
};

describe("RootLayout locale initialization", () => {
    beforeEach(() => {
        request.cookies.mockReset();
    });

    it("passes a valid cookie locale to the document and I18nProvider", async () => {
        const { layout } = await renderLayout("ru");
        const body = layout.props.children;
        const provider = body.props.children;

        expect(layout.props.lang).toBe("ru");
        expect(provider.props.initialLocale).toBe("ru");
    });

    it("falls back to the default locale for a missing cookie", async () => {
        const { layout } = await renderLayout();

        expect(layout.props.lang).toBe(DEFAULT_LOCALE);
    });

    it("reads the configured locale cookie", async () => {
        const { get } = await renderLayout("en");

        expect(request.cookies).toHaveBeenCalledOnce();
        expect(get).toHaveBeenCalledWith(LOCALE_COOKIE_NAME);
    });
});
