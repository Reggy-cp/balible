import type { Metadata } from 'next'
import { getExperienceCards } from '@/lib/experiences'
import CategoryClient, { type CategoryExp } from './CategoryClient'

export const revalidate = 300

const CATEGORY_META: Record<string, { title: string; description: string }> = {
  'art-craft':          { title: 'Bali Art & Craft Classes', description: 'Learn pottery, silver jewellery, batik, wood carving, and weaving from Bali\'s finest local artisans. Book hands-on art classes across Ubud, Canggu and beyond.' },
  'wellness-healing':   { title: 'Bali Wellness & Healing Experiences', description: 'Book yoga retreats, sound healing, meditation, traditional Balinese healing, and spa treatments in Ubud, Canggu, and Seminyak.' },
  'culture-spiritual':  { title: 'Bali Culture & Spiritual Experiences', description: 'Explore Balinese culture with temple visits, traditional dance performances, offering-making classes, and spiritual ceremonies led by local guides.' },
  'culinary':           { title: 'Bali Cooking Classes & Food Tours', description: 'Master Balinese cuisine with hands-on cooking classes, market tours, and food tastings hosted by local chefs across Bali.' },
  'nature-outdoors':    { title: 'Bali Nature & Outdoor Activities', description: 'Trek through rice terraces, cycle through villages, and explore Bali\'s stunning landscapes with guided nature experiences.' },
  'water-activities':   { title: 'Bali Water Activities & Surf Lessons', description: 'Learn to surf, go snorkelling, paddleboarding, white-water rafting, and more with expert local instructors in Bali\'s best waters.' },
  'local-experts':      { title: 'Bali Local Expert Tours & Guides', description: 'Explore Bali like a local with expert-led village walks, photography tours, hidden gems and insider cultural experiences.' },
  'rentals':            { title: 'Bali Vehicle & Equipment Rentals', description: 'Rent scooters, cars, surfboards, and more from trusted local providers across Ubud, Canggu, Seminyak and beyond.' },
  'services':           { title: 'Bali Services & Private Sessions', description: 'Book private sessions including personal training, photography, language lessons, and bespoke local services across Bali.' },
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const meta = CATEGORY_META[params.category]
  if (!meta) return {}
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `https://balible.com/categories/${params.category}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://balible.com/categories/${params.category}`,
    },
    twitter: { card: 'summary_large_image' },
  }
}

export function generateStaticParams() {
  return [
    'art-craft', 'wellness-healing', 'culture-spiritual', 'culinary',
    'nature-outdoors', 'water-activities', 'local-experts', 'rentals', 'services',
  ].map(category => ({ category }))
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const { category } = params
  const isWater = category === 'water-activities'

  const dbCards = await getExperienceCards()

  const experiences: CategoryExp[] = dbCards
    .filter(c => isWater ? c.categorySlug === 'water-activities' : c.categorySlug === category)
    .map(c => ({
      slug: c.slug,
      title: c.title,
      area: c.area,
      price: c.price,
      rating: c.rating,
      reviews: c.reviews,
      duration: c.duration,
      maxGuests: c.maxGuests,
      image: c.photo,
      badge: c.badge,
      category: isWater ? 'water-activities' : c.categorySlug,
      subcategory: c.subcategory,
    }))

  return <CategoryClient categorySlug={category} initialExperiences={experiences} />
}
