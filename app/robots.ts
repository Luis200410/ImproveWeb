import { MetadataRoute } from "next";

const siteUrl = "https://improveweb.app";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/about", "/sales", "/pricing", "/register", "/login"],
                disallow: [
                    "/dashboard/",
                    "/systems/",
                    "/api/",
                    "/profile/",
                    "/(billing)/",
                ],
            },
            {
                // Allow Googlebot full access to public pages
                userAgent: "Googlebot",
                allow: "/",
                disallow: ["/api/", "/dashboard/", "/systems/", "/profile/"],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
        host: siteUrl,
    };
}
