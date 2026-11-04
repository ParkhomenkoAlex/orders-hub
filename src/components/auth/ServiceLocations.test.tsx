import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import {
    ServiceLocations,
    ServiceLocationsList,
    ServiceLocationsMapFallback,
} from "./ServiceLocations";

vi.mock("next/dynamic", () => ({
    default: (
        _loader: unknown,
        options: { loading?: () => React.ReactNode },
    ): (() => React.ReactNode) =>
        function DynamicServiceLocationsMap() {
            return options.loading?.() ?? null;
        },
}));

describe("ServiceLocations", () => {
    it("renders an accessible selected location and a map fallback", () => {
        const markup = renderToStaticMarkup(
            <I18nProvider initialLocale="en">
                <ServiceLocations />
            </I18nProvider>,
        );

        expect(markup).toContain("Service locations");
        expect(markup).not.toContain("Example equipment service centres in Ukraine.");
        expect(markup).toContain("Kyiv service centre");
        expect(markup).toContain('aria-pressed="true"');
        expect(markup).toContain('aria-label="Show Kyiv service centre on the map"');
        expect(markup).toContain("Loading service locations map");
    });

    it("renders the selected Russian location and its localized list text", () => {
        const markup = renderToStaticMarkup(
            <I18nProvider initialLocale="ru">
                <ServiceLocationsList
                    selectedLocationId="lviv"
                    onLocationSelect={() => undefined}
                />
            </I18nProvider>,
        );

        expect(markup).toContain("Примеры сервисных точек");
        expect(markup).toContain("Сервисный центр во Львове");
        expect(markup).toContain("Выбранная локация: Сервисный центр во Львове");
        expect(markup).toContain('aria-pressed="true"');
    });

    it("provides a localized text alternative if the map cannot load", () => {
        const markup = renderToStaticMarkup(
            <I18nProvider initialLocale="ru">
                <ServiceLocationsMapFallback hasError />
            </I18nProvider>,
        );

        expect(markup).toContain('role="alert"');
        expect(markup).toContain("Карта недоступна. Используйте список локаций ниже.");
    });
});
