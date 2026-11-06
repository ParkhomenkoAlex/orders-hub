import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Orders Hub",
        short_name: "Orders Hub",
        description: "Orders and products inventory dashboard",
        start_url: "/",
        display: "standalone",
        background_color: "#f1f5f6",
        theme_color: "#88c33e",
        icons: [
            {
                src: "/icons/orders-hub-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/orders-hub-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/orders-hub-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
