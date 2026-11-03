"use client";

import { useTranslation } from "@/i18n/I18nProvider";

interface AuthSettingsProps {
    username: string;
}

export function AuthSettings({ username }: AuthSettingsProps) {
    const { t } = useTranslation();

    return (
        <section className="page-workspace auth-settings" aria-labelledby="auth-settings-title">
            <header className="page-workspace__header">
                <h1 id="auth-settings-title">{t.auth.settingsTitle}</h1>
            </header>
            <div className="auth-settings__content">
                <p>{t.auth.settingsDescription}</p>
                <p>
                    {t.auth.signedInAs}: <strong>{username}</strong>
                </p>
                <form action="/api/auth/logout" method="post">
                    <button className="btn btn-outline-secondary" type="submit">
                        {t.auth.logout}
                    </button>
                </form>
            </div>
        </section>
    );
}
