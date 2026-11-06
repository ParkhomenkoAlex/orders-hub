export const PWA_CACHE_NAME = "orders-hub-static-v1";
export const OFFLINE_PATH = "/offline";

const EXCLUDED_PATH_PREFIXES = ["/api/", "/socket.io/"];
const STATIC_DESTINATIONS = new Set(["font", "image", "script", "style"]);

export const isExcludedPath = (pathname) =>
    EXCLUDED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export const shouldHandleNavigation = (request, origin) => {
    const url = new URL(request.url);

    return (
        request.method === "GET" &&
        request.mode === "navigate" &&
        url.origin === origin &&
        !isExcludedPath(url.pathname)
    );
};

export const shouldCacheStaticRequest = (request, origin) => {
    const url = new URL(request.url);

    return (
        request.method === "GET" &&
        url.origin === origin &&
        !isExcludedPath(url.pathname) &&
        STATIC_DESTINATIONS.has(request.destination)
    );
};

if (typeof self !== "undefined" && "addEventListener" in self) {
    const workerScope = self;
    const origin = workerScope.location.origin;

    workerScope.addEventListener("install", (event) => {
        event.waitUntil(
            caches
                .open(PWA_CACHE_NAME)
                .then((cache) => cache.add(OFFLINE_PATH))
                .then(() => workerScope.skipWaiting()),
        );
    });

    workerScope.addEventListener("activate", (event) => {
        event.waitUntil(
            caches
                .keys()
                .then((keys) =>
                    Promise.all(
                        keys
                            .filter(
                                (key) => key.startsWith("orders-hub-") && key !== PWA_CACHE_NAME,
                            )
                            .map((key) => caches.delete(key)),
                    ),
                )
                .then(() => workerScope.clients.claim()),
        );
    });

    workerScope.addEventListener("fetch", (event) => {
        const { request } = event;

        if (shouldHandleNavigation(request, origin)) {
            event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_PATH)));
            return;
        }

        if (!shouldCacheStaticRequest(request, origin)) {
            return;
        }

        event.respondWith(
            caches.match(request).then(async (cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                const response = await fetch(request);

                if (response.ok && response.type === "basic") {
                    const cache = await caches.open(PWA_CACHE_NAME);
                    await cache.put(request, response.clone());
                }

                return response;
            }),
        );
    });
}
