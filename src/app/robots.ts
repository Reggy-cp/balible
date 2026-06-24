import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/dashboard',
          '/profile',
          '/checkout',
          '/onboarding',
          '/verify-email',
          '/reset-password',
          '/auth/',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://balible.com/sitemap.xml',
  }
}
