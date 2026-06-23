/** @type {import('next').NextConfig} */

// Midtrans Snap loads from one of these origins depending on sandbox vs production
const MIDTRANS_ORIGINS = 'https://app.sandbox.midtrans.com https://app.midtrans.com'

// Content-Security-Policy
// - unsafe-inline / unsafe-eval required for Next.js hydration + Tailwind inline styles
// - Midtrans Snap injects its own script tag and opens an iframe overlay
// - Vercel Blob public URLs are *.public.blob.vercel-storage.com
// - Google profile images come from lh3.googleusercontent.com
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${MIDTRANS_ORIGINS}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https: `,
  "font-src 'self' https://fonts.gstatic.com",
  `connect-src 'self' ${MIDTRANS_ORIGINS}`,
  `frame-src ${MIDTRANS_ORIGINS}`,
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const securityHeaders = [
  // Force HTTPS for 2 years, including subdomains, and allow preload listing
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Prevent the site being framed by other origins (clickjacking)
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Stop MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Send only the origin on cross-origin requests
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable powerful browser features the app doesn't use
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Content-Security-Policy', value: CSP },
]

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
    ]
  },
  async redirects() {
    return [
      { source: '/experiences', destination: '/search', permanent: true },
    ]
  },
}

module.exports = nextConfig
