"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { LOCALE_COOKIE_NAME, type Locale } from "./config";
import { messages, type Messages } from "./messages";

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

interface I18nContextValue {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: Messages;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const createLocaleCookie = (locale: Locale, secure: boolean) =>
    [
        `${LOCALE_COOKIE_NAME}=${locale}`,
        "Path=/",
        "SameSite=Lax",
        `Max-Age=${LOCALE_COOKIE_MAX_AGE}`,
        ...(secure ? ["Secure"] : []),
    ].join("; ");

interface I18nProviderProps {
    initialLocale: Locale;
    children: ReactNode;
}

export function I18nProvider({ initialLocale, children }: I18nProviderProps) {
    const [locale, setCurrentLocale] = useState(initialLocale);
    const setLocale = useCallback((nextLocale: Locale) => {
        setCurrentLocale(nextLocale);
        document.documentElement.lang = nextLocale;
        document.cookie = createLocaleCookie(nextLocale, window.location.protocol === "https:");
    }, []);
    const value = useMemo(() => ({ locale, setLocale, t: messages[locale] }), [locale, setLocale]);

    return <I18nContext value={value}>{children}</I18nContext>;
}

export function useTranslation() {
    const context = useContext(I18nContext);

    if (!context) {
        throw new Error("useTranslation must be used within an I18nProvider.");
    }

    return context;
}
