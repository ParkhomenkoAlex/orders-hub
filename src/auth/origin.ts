import "server-only";

export const hasSameOrigin = (request: Request) => {
    const origin = request.headers.get("origin");

    if (!origin) {
        return false;
    }

    try {
        const originUrl = new URL(origin);
        const requestUrl = new URL(request.url);
        const requestHost = request.headers.get("host") ?? requestUrl.host;

        return (
            origin === originUrl.origin &&
            originUrl.protocol === requestUrl.protocol &&
            originUrl.host === requestHost
        );
    } catch {
        return false;
    }
};
