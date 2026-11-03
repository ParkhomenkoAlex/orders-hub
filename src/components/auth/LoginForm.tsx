"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n/I18nProvider";

interface LoginFormProps {
    hasError: boolean;
}

export function LoginForm({ hasError }: LoginFormProps) {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <main className="auth-page">
            <section className="auth-card" aria-labelledby="login-title">
                <h1 id="login-title">{t.auth.title}</h1>
                <p>{t.auth.description}</p>
                {hasError && (
                    <p className="data-warning" role="alert">
                        {t.auth.invalidCredentials}
                    </p>
                )}
                <form
                    action="/api/auth/login"
                    method="post"
                    onSubmit={() => setIsSubmitting(true)}
                    aria-busy={isSubmitting}
                >
                    <label className="form-label" htmlFor="login-username">
                        {t.auth.username}
                    </label>
                    <input
                        id="login-username"
                        className="form-control"
                        name="username"
                        type="text"
                        autoComplete="username"
                        required
                    />
                    <label className="form-label" htmlFor="login-password">
                        {t.auth.password}
                    </label>
                    <input
                        id="login-password"
                        className="form-control"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                    />
                    <button className="btn btn-success" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? t.auth.signingIn : t.auth.signIn}
                    </button>
                </form>
            </section>
        </main>
    );
}
