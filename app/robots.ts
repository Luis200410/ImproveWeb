import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/dashboard/',   // Private athlete progress
                '/profile/',     // Identity data
                '/api/',         // Internal backend calls
                '/settings/',    // Account security
                '/admin/',       // Management dashboard
                '/logs/',        // Private macro logs
                '/systems/',     // Internal systems
                '/(billing)/',  // Private billing data
            ],
        },
        sitemap: 'https://improveweb.app/sitemap.xml',
    }
}
