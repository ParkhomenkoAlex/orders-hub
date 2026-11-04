import { describe, expect, it } from "vitest";
import {
    getSelectedServiceLocation,
    SERVICE_LOCATION_IDS,
    SERVICE_LOCATIONS,
} from "./serviceLocations";

describe("service locations", () => {
    it("defines unique demonstration locations at the expected Ukrainian city centres", () => {
        expect(SERVICE_LOCATIONS.map((location) => location.id)).toEqual(SERVICE_LOCATION_IDS);
        expect(new Set(SERVICE_LOCATION_IDS).size).toBe(SERVICE_LOCATION_IDS.length);
        expect(SERVICE_LOCATIONS).toEqual([
            { id: "kyiv", coordinates: [50.4501, 30.5234] },
            { id: "cherkasy", coordinates: [49.4444, 32.0598] },
            { id: "lviv", coordinates: [49.8397, 24.0297] },
        ]);
    });

    it("selects a known location and safely falls back to Kyiv for an unknown id", () => {
        expect(getSelectedServiceLocation("lviv").id).toBe("lviv");
        expect(getSelectedServiceLocation("unsupported").id).toBe("kyiv");
    });
});
