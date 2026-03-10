import { MetadataRoute } from "next";

const siteUrl = "https://improve-club.com";

/**
 * Ensures lastmod is consistent within the current week to show "active" content.
 */
function getCurrentWeekStart() {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const startOfWeek = new Date(d.getFullYear(), d.getMonth(), diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
}

export default function sitemap(): MetadataRoute.Sitemap {
    const weeklyFreshness = getCurrentWeekStart();

    return [
        {
            url: siteUrl,
            lastModified: weeklyFreshness,
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${siteUrl}/sales`,
            lastModified: weeklyFreshness,
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${siteUrl}/pricing`,
            lastModified: weeklyFreshness,
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${siteUrl}/about`,
            lastModified: weeklyFreshness,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${siteUrl}/register`,
            lastModified: weeklyFreshness,
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${siteUrl}/login`,
            lastModified: weeklyFreshness,
            changeFrequency: "yearly",
            priority: 0.4,
        },
    ];
}
