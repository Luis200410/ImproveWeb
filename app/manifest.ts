import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "IMPROVE",
        short_name: "IMPROVE",
        description:
            "An intentional digital companion for your habits, work, health, and mind. Define the goal, block the noise, execute the habit.",
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
