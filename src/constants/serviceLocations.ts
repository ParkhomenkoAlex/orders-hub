export const SERVICE_LOCATION_IDS = ["kyiv", "cherkasy", "lviv"] as const;

export type ServiceLocationId = (typeof SERVICE_LOCATION_IDS)[number];

export interface ServiceLocation {
    id: ServiceLocationId;
    coordinates: [latitude: number, longitude: number];
}

export const SERVICE_LOCATIONS: readonly ServiceLocation[] = [
    { id: "kyiv", coordinates: [50.4501, 30.5234] },
    { id: "cherkasy", coordinates: [49.4444, 32.0598] },
    { id: "lviv", coordinates: [49.8397, 24.0297] },
];

export const getSelectedServiceLocation = (id: string): ServiceLocation =>
    SERVICE_LOCATIONS.find((location) => location.id === id) ?? SERVICE_LOCATIONS[0];
