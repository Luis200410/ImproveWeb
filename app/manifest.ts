import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "IMPROVE — The School of Excellence",
        short_name: "IMPROVE",
        description:
            "The all-in-one self-improvement operating system. Master your body, wealth, work, productivity, relationships, mind, and legacy.",
        start_url: "/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#000000",
        orientation: "portrait",
        categories: ["productivity", "lifestyle", "health", "education"],
        icons: [
            {
                src: "/favicon.ico",
                sizes: "any",
                type: "image/x-icon",
            },
        ],
    };
}
