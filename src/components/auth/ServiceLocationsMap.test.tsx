import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { ServiceLocationsMap } from "./ServiceLocationsMap";

vi.mock("leaflet", () => ({ divIcon: () => ({}) }));

vi.mock("react-leaflet", () => ({
    MapContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Marker: ({ children, title }: { children: React.ReactNode; title: string }) => (
        <div title={title}>{children}</div>
    ),
    Popup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TileLayer: () => null,
    useMap: () => ({ flyTo: vi.fn() }),
}));

describe("ServiceLocationsMap", () => {
    it("renders localized marker popup content through the mocked Leaflet boundary", () => {
        const markup = renderToStaticMarkup(
            <I18nProvider initialLocale="ru">
                <ServiceLocationsMap
                    selectedLocationId="kyiv"
                    focusRequest={0}
                    onLocationSelect={() => undefined}
                />
            </I18nProvider>,
        );

        expect(markup).toContain("Сервисный центр в Киеве");
        expect(markup).toContain("Сервисный центр в Черкассах");
        expect(markup).toContain("Сервисный центр во Львове");
        expect(markup).toContain("Киев");
    });
});
