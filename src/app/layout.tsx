import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import ChatWidget from '@/components/ChatWidget'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Balible — Curated Experiences in Bali',
  description: 'Discover authentic, meaningful, and beautiful experiences across the island of Bali.',
  keywords: 'Bali, experiences, activities, tours, culture, wellness, Ubud, Canggu',
  metadataBase: new URL('https://balible.vercel.app'),
  openGraph: {
    type: 'website',
    siteName: 'Balible',
    title: 'Balible — Curated Experiences in Bali',
    description: 'Discover authentic, meaningful, and beautiful experiences across the island of Bali.',
    url: 'https://balible.vercel.app',
    images: [{
      url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&h=630&auto=format&fit=crop&q=80',
      width: 1200,
      height: 630,
      alt: 'Balible — Curated Experiences in Bali',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Balible — Curated Experiences in Bali',
    description: 'Discover authentic, meaningful, and beautiful experiences across the island of Bali.',
    images: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&h=630&auto=format&fit=crop&q=80'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
        <body>
          {children}
          <ChatWidget />
        </body>
      </html>
    </ClerkProvider>
  )
}
