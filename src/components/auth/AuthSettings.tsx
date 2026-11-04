"use client";

import { useTranslation } from "@/i18n/I18nProvider";
import workspaceStyles from "@/components/ui/Workspace.module.scss";
import { ServiceLocations } from "./ServiceLocations";
import styles from "./Auth.module.scss";

interface AuthSettingsProps {
    username: string;
}

export function AuthSettings({ username }: AuthSettingsProps) {
    const { t } = useTranslation();

    return (
        <section className={workspaceStyles.pageWorkspace} aria-labelledby="auth-settings-title">
            <header className={workspaceStyles.pageWorkspace__header}>
                <h1 id="auth-settings-title">{t.auth.settingsTitle}</h1>
            </header>
            <div className={styles.authSettings__content}>
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
            <ServiceLocations />
        </section>
    );
}
