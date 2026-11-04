"use client";

import dynamic from "next/dynamic";
import { Component, useState, type ReactNode } from "react";
import {
    getSelectedServiceLocation,
    SERVICE_LOCATIONS,
    type ServiceLocationId,
} from "@/constants/serviceLocations";
import { useTranslation } from "@/i18n/I18nProvider";
import styles from "./ServiceLocations.module.scss";

const ServiceLocationsMap = dynamic(
    () => import("./ServiceLocationsMap").then((module) => module.ServiceLocationsMap),
    {
        ssr: false,
        loading: () => <ServiceLocationsMapFallback />,
    },
);

interface ServiceLocationsMapFallbackProps {
    hasError?: boolean;
}

export function ServiceLocationsMapFallback({
    hasError = false,
}: ServiceLocationsMapFallbackProps) {
    const { t } = useTranslation();

    return (
        <div
            className={styles.serviceLocations__mapFallback}
            role={hasError ? "alert" : "status"}
            aria-live="polite"
        >
            {hasError ? t.serviceLocations.mapUnavailable : t.serviceLocations.mapLoading}
        </div>
    );
}

interface ServiceLocationsListProps {
    selectedLocationId: ServiceLocationId;
    onLocationSelect: (locationId: ServiceLocationId) => void;
}

export function ServiceLocationsList({
    selectedLocationId,
    onLocationSelect,
}: ServiceLocationsListProps) {
    const { t } = useTranslation();
    const selectedLocation = getSelectedServiceLocation(selectedLocationId);
    const selectedName = t.serviceLocations.locations[selectedLocation.id].name;

    return (
        <div className={styles.serviceLocations__listContainer}>
            <h3>{t.serviceLocations.listTitle}</h3>
            <p className="visually-hidden" role="status">
                {t.serviceLocations.selectedLocation.replace("{name}", selectedName)}
            </p>
            <ul className={styles.serviceLocations__list}>
                {SERVICE_LOCATIONS.map((location) => {
                    const details = t.serviceLocations.locations[location.id];
                    const isSelected = location.id === selectedLocationId;

                    return (
                        <li key={location.id}>
                            <button
                                type="button"
                                className={`${styles.serviceLocations__item} ${
                                    isSelected ? styles["serviceLocations__item--selected"] : ""
                                }`}
                                aria-pressed={isSelected}
                                aria-label={t.serviceLocations.selectLocation.replace(
                                    "{name}",
                                    details.name,
                                )}
                                onClick={() => onLocationSelect(location.id)}
                            >
                                <strong>{details.name}</strong>
                                <span>{details.city}</span>
                                <small>{details.description}</small>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

interface ServiceLocationsMapBoundaryProps {
    children: ReactNode;
}

interface ServiceLocationsMapBoundaryState {
    hasError: boolean;
}

class ServiceLocationsMapBoundary extends Component<
    ServiceLocationsMapBoundaryProps,
    ServiceLocationsMapBoundaryState
> {
    public state: ServiceLocationsMapBoundaryState = { hasError: false };

    public static getDerivedStateFromError(): ServiceLocationsMapBoundaryState {
        return { hasError: true };
    }

    public render() {
        return this.state.hasError ? <ServiceLocationsMapFallback hasError /> : this.props.children;
    }
}

export function ServiceLocations() {
    const { t } = useTranslation();
    const [selectedLocationId, setSelectedLocationId] = useState<ServiceLocationId>("kyiv");
    const [focusRequest, setFocusRequest] = useState(0);

    const handleLocationSelect = (locationId: ServiceLocationId) => {
        setSelectedLocationId(locationId);
        setFocusRequest((currentRequest) => currentRequest + 1);
    };

    return (
        <section className={styles.serviceLocations} aria-labelledby="service-locations-title">
            <header className={styles.serviceLocations__header}>
                <h2 id="service-locations-title">{t.serviceLocations.title}</h2>
            </header>
            <div className={styles.serviceLocations__content}>
                <ServiceLocationsMapBoundary>
                    <ServiceLocationsMap
                        selectedLocationId={selectedLocationId}
                        focusRequest={focusRequest}
                        onLocationSelect={handleLocationSelect}
                    />
                </ServiceLocationsMapBoundary>
                <ServiceLocationsList
                    selectedLocationId={selectedLocationId}
                    onLocationSelect={handleLocationSelect}
                />
            </div>
        </section>
    );
}
