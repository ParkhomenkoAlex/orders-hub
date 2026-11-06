import { describe, expect, it, vi } from "vitest";
import {
    canRegisterServiceWorker,
    registerPwaServiceWorker,
    SERVICE_WORKER_PATH,
} from "./PwaRegistration";

describe("PWA service worker registration", () => {
    it("registers the module service worker at the application scope", async () => {
        const register = vi.fn().mockResolvedValue({});
        const serviceWorker = { register } as unknown as ServiceWorkerContainer;

        await registerPwaServiceWorker(serviceWorker);

        expect(register).toHaveBeenCalledWith(SERVICE_WORKER_PATH, { scope: "/", type: "module" });
    });

    it("only permits registration for production browsers with service worker support", () => {
        const serviceWorker = {} as ServiceWorkerContainer;

        expect(canRegisterServiceWorker(serviceWorker, true)).toBe(true);
        expect(canRegisterServiceWorker(serviceWorker, false)).toBe(false);
        expect(canRegisterServiceWorker(undefined, true)).toBe(false);
    });
});
