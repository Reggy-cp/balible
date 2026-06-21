import { getExperienceCards } from '@/lib/experiences'
import CategoryClient, { type CategoryExp } from './CategoryClient'

export const revalidate = 300

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
