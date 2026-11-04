"use client";

import { divIcon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect, useMemo, useRef } from "react";
import {
    getSelectedServiceLocation,
    SERVICE_LOCATIONS,
    type ServiceLocationId,
} from "@/constants/serviceLocations";
import { useTranslation } from "@/i18n/I18nProvider";
import styles from "./ServiceLocations.module.scss";

interface ServiceLocationsMapProps {
    selectedLocationId: ServiceLocationId;
    focusRequest: number;
    onLocationSelect: (locationId: ServiceLocationId) => void;
}

interface MapFocusProps {
    selectedLocationId: ServiceLocationId;
    focusRequest: number;
}

function MapFocus({ selectedLocationId, focusRequest }: MapFocusProps) {
    const map = useMap();
    const hasMounted = useRef(false);

    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            return;
        }

        map.flyTo(getSelectedServiceLocation(selectedLocationId).coordinates, 9, {
            duration: 0.35,
        });
    }, [focusRequest, map, selectedLocationId]);

    return null;
}

export function ServiceLocationsMap({
    selectedLocationId,
    focusRequest,
    onLocationSelect,
}: ServiceLocationsMapProps) {
    const { t } = useTranslation();
    const markerIcon = useMemo(
        () =>
            divIcon({
                className: styles.serviceLocations__marker,
                html: `<span class="${styles.serviceLocations__markerDot}" aria-hidden="true"></span>`,
                iconSize: [30, 30],
                iconAnchor: [15, 30],
                popupAnchor: [0, -30],
            }),
        [],
    );

    return (
        <MapContainer
            className={styles.serviceLocations__map}
            center={[49.2, 30.7]}
            zoom={6}
            minZoom={5}
            maxZoom={15}
            scrollWheelZoom
            aria-label={t.serviceLocations.mapLabel}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapFocus selectedLocationId={selectedLocationId} focusRequest={focusRequest} />
            {SERVICE_LOCATIONS.map((location) => {
                const details = t.serviceLocations.locations[location.id];

                return (
                    <Marker
                        key={location.id}
                        position={location.coordinates}
                        icon={markerIcon}
                        title={details.name}
                        alt={details.name}
                        eventHandlers={{ click: () => onLocationSelect(location.id) }}
                    >
                        <Popup>
                            <div className={styles.serviceLocations__popup}>
                                <strong>{details.name}</strong>
                                <span>{details.city}</span>
                                <p>{details.description}</p>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
