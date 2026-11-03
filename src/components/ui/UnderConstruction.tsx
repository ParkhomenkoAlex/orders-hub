import workspaceStyles from "./Workspace.module.scss";
import styles from "./UnderConstruction.module.scss";

interface UnderConstructionProps {
    title: string;
}

export function UnderConstruction({ title }: UnderConstructionProps) {
    return (
        <section
            className={workspaceStyles.pageWorkspace}
            aria-labelledby="under-construction-title"
        >
            <header className={workspaceStyles.pageWorkspace__header}>
                <h1 id="under-construction-title">{title}</h1>
            </header>
            <div className={styles.underConstruction__content}>
                <h2>Page under construction</h2>
                <p>This dashboard section will be available in a future development phase.</p>
            </div>
        </section>
    );
}
