import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
    it("renders accessible localized credentials fields and generic feedback", () => {
        const markup = renderToStaticMarkup(
            <I18nProvider initialLocale="ru">
                <LoginForm hasError />
            </I18nProvider>,
        );

        expect(markup).toContain('action="/api/auth/login"');
        expect(markup).toContain('autoComplete="username"');
        expect(markup).toContain('autoComplete="current-password"');
        expect(markup).toContain("Неверное имя пользователя или пароль.");
        // Native form submission serializes enabled controls only.
        expect(markup).not.toMatch(/id="login-username"[^>]*disabled/);
        expect(markup).not.toMatch(/id="login-password"[^>]*disabled/);
    });
});
