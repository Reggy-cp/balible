import HomeClient from '@/components/HomeClient'
import { getFeaturedExperiences } from '@/lib/experiences'
import type { FeaturedExp } from '@/lib/experiences'

// Static fallback for the featured carousel
const STATIC_FEATURED: FeaturedExp[] = [
  { id: 1, slug: 'pottery-making-class',     title: 'Pottery Making Class',     area: 'Ubud',    meta: '2.5 hours · All levels', rating: 4.9, reviews: 128, price: 450000, photo: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=480&auto=format&fit=crop&q=80' },
  { id: 2, slug: 'silver-jewelry-workshop',  title: 'Silver Jewelry Workshop',  area: 'Canggu',  meta: '3 hours · All levels',   rating: 4.8, reviews: 94,  price: 550000, photo: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=480&auto=format&fit=crop&q=80' },
  { id: 3, slug: 'sound-healing-journey',    title: 'Sound Healing Journey',    area: 'Ubud',    meta: '90 minutes',             rating: 4.8, reviews: 178, price: 350000, photo: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=480&auto=format&fit=crop&q=80' },
  { id: 4, slug: 'water-temple-purification',title: 'Water Temple Purification',area: 'Gianyar', meta: '4 hours',                rating: 4.8, reviews: 78,  price: 600000, photo: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=480&auto=format&fit=crop&q=80' },
]

export default async function HomePage() {
  const dbFeatured = await getFeaturedExperiences()
  const featuredExperiences = dbFeatured.length > 0 ? dbFeatured : STATIC_FEATURED
  return <HomeClient featuredExperiences={featuredExperiences} />
}
