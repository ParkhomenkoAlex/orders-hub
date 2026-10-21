interface UnderConstructionProps {
    title: string;
}

export function UnderConstruction({ title }: UnderConstructionProps) {
    return (
        <section
            className="page-workspace under-construction"
            aria-labelledby="under-construction-title"
        >
            <header className="page-workspace__header">
                <h1 id="under-construction-title">{title}</h1>
            </header>
            <div className="under-construction__content">
                <h2>Page under construction</h2>
                <p>This dashboard section will be available in a future development phase.</p>
            </div>
        </section>
    );
}
