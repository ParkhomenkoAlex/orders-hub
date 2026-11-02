import type { Metadata } from "next";
import { cookies } from "next/headers";
import { I18nProvider } from "@/i18n/I18nProvider";
import { LOCALE_COOKIE_NAME, resolveLocale } from "@/i18n/config";
import "./globals.scss";

export const metadata: Metadata = {
    title: "Orders Hub",
    description: "Orders and products dashboard",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
    const cookieStore = await cookies();
    const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);

    return (
        <html lang={locale}>
            <body>
                <I18nProvider initialLocale={locale}>{children}</I18nProvider>
            </body>
        </html>
    );
}
