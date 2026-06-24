import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE = 'https://balible.com'

const STATIC_ROUTES = [
  '/', '/search', '/destinations', '/categories', '/blog',
  '/events', '/for-hosts', '/about', '/how-it-works', '/hosts',
]

const DESTINATION_SLUGS = [
  'ubud', 'canggu', 'uluwatu', 'seminyak', 'jimbaran',
  'sidemen', 'kuta', 'gianyar', 'sanur', 'nusa-dua',
  'amed', 'medewi', 'kintamani',
]

const CATEGORY_SLUGS = [
  'art-craft', 'wellness-healing', 'culture-spiritual', 'culinary',
  'nature-outdoors', 'water-activities', 'local-experts', 'rentals', 'services',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [experiences, events] = await Promise.all([
    prisma.experience.findMany({
      where: { status: 'ACTIVE', NOT: { category: 'RENTALS' } },
      select: { slug: true },
    }).catch(() => []),
    prisma.event.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true },
    }).catch(() => []),
  ])

  return [
    ...STATIC_ROUTES.map(path => ({ url: `${BASE}${path}`, changeFrequency: 'weekly' as const, priority: path === '/' ? 1 : 0.8 })),
    ...DESTINATION_SLUGS.map(slug => ({ url: `${BASE}/destinations/${slug}`, changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...CATEGORY_SLUGS.map(slug => ({ url: `${BASE}/categories/${slug}`, changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...experiences.map(e => ({ url: `${BASE}/experiences/${e.slug}`, changeFrequency: 'daily' as const, priority: 0.9 })),
    ...events.map(e => ({ url: `${BASE}/events/${e.slug}`, changeFrequency: 'daily' as const, priority: 0.9 })),
  ]
}
