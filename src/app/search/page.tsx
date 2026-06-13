import { getExperienceCards } from '@/lib/experiences'
import SearchClient, { type SearchResult } from './SearchClient'

// Static fallback — used for slugs not yet in the database
const STATIC_RESULTS: SearchResult[] = [
  { id: 1,  slug: 'pottery-making-class',       title: 'Pottery Making Class',         area: 'Ubud',     rating: 4.9, reviews: 128, price: 450000, durationMins: 150, category: 'Art & Craft',  photo: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&auto=format&fit=crop&q=80' },
  { id: 2,  slug: 'silver-jewelry-workshop',     title: 'Silver Jewelry Workshop',      area: 'Canggu',   rating: 4.8, reviews: 94,  price: 550000, durationMins: 180, category: 'Art & Craft',  photo: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=300&auto=format&fit=crop&q=80' },
  { id: 3,  slug: 'batik-painting-workshop',     title: 'Batik Painting Workshop',      area: 'Ubud',     rating: 4.7, reviews: 64,  price: 380000, durationMins: 180, category: 'Art & Craft',  photo: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&auto=format&fit=crop&q=80' },
  { id: 4,  slug: 'traditional-batik-workshop',  title: 'Traditional Batik Workshop',   area: 'Ubud',     rating: 4.7, reviews: 52,  price: 420000, durationMins: 210, category: 'Art & Craft',  photo: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&auto=format&fit=crop&q=80' },
  { id: 5,  slug: 'sound-healing-journey',       title: 'Sound Healing Journey',        area: 'Ubud',     rating: 4.8, reviews: 178, price: 350000, durationMins: 90,  category: 'Wellness & Healing',     photo: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&auto=format&fit=crop&q=80' },
  { id: 6,  slug: 'sunrise-yoga-class',          title: 'Sunrise Yoga & Meditation',    area: 'Canggu',   rating: 4.9, reviews: 203, price: 250000, durationMins: 75,  category: 'Wellness & Healing',     photo: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=300&auto=format&fit=crop&q=80' },
  { id: 7,  slug: 'water-temple-purification',   title: 'Water Temple Purification',    area: 'Gianyar',  rating: 4.8, reviews: 78,  price: 600000, durationMins: 240, category: 'Culture',      photo: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=300&auto=format&fit=crop&q=80' },
  { id: 8,  slug: 'uluwatu-kecak-sunset',        title: 'Uluwatu Sunset & Kecak Dance', area: 'Uluwatu',  rating: 4.9, reviews: 312, price: 450000, durationMins: 180, category: 'Culture',      photo: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300&auto=format&fit=crop&q=80' },
  { id: 9,  slug: 'balinese-cooking-class',      title: 'Balinese Cooking Class',       area: 'Seminyak', rating: 4.8, reviews: 156, price: 480000, durationMins: 210, category: 'Culinary',         photo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&auto=format&fit=crop&q=80' },
  { id: 10, slug: 'jimbaran-seafood-sunset',     title: 'Jimbaran Seafood & Sunset',    area: 'Jimbaran', rating: 4.6, reviews: 89,  price: 350000, durationMins: 120, category: 'Culinary',         photo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&auto=format&fit=crop&q=80' },
  { id: 11, slug: 'beginner-surf-lesson',        title: 'Beginner Surf Lesson',         area: 'Kuta',     rating: 4.7, reviews: 428, price: 320000, durationMins: 120, category: 'Water Activities', photo: 'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=300&auto=format&fit=crop&q=80' },
  { id: 12, slug: 'snorkeling-amed',             title: 'Snorkeling at Amed Reef',      area: 'Amed',     rating: 4.8, reviews: 67,  price: 420000, durationMins: 180, category: 'Water Activities', photo: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=300&auto=format&fit=crop&q=80' },
  { id: 13, slug: 'rice-terrace-walk',           title: 'Tegalalang Rice Terrace Walk', area: 'Ubud',     rating: 4.8, reviews: 192, price: 280000, durationMins: 150, category: 'Nature & Outdoors', photo: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=300&auto=format&fit=crop&q=80' },
  { id: 14, slug: 'natural-dye-workshop',        title: 'Natural Dye Workshop',         area: 'Sidemen',  rating: 4.7, reviews: 48,  price: 380000, durationMins: 180, category: 'Art & Craft',  photo: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300&auto=format&fit=crop&q=80' },
  { id: 15, slug: 'wood-carving-workshop',       title: 'Wood Carving Workshop',        area: 'Ubud',     rating: 4.8, reviews: 72,  price: 500000, durationMins: 240, category: 'Art & Craft',  photo: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&auto=format&fit=crop&q=80' },
  { id: 16, slug: 'rattan-weaving-class',        title: 'Rattan Weaving Class',         area: 'Sidemen',  rating: 4.7, reviews: 38,  price: 350000, durationMins: 180, category: 'Art & Craft',  photo: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=300&auto=format&fit=crop&q=80' },
]

export default async function SearchPage({ searchParams }: { searchParams: { q?: string; date?: string } }) {
  const dbCards = await getExperienceCards()
  const dbSlugs = new Set(dbCards.map(c => c.slug))

  const dbResults: SearchResult[] = dbCards.map((c, i) => ({
    id: `db-${i}`,
    slug: c.slug,
    title: c.title,
    area: c.area,
    rating: c.rating,
    reviews: c.reviews,
    price: c.price,
    durationMins: c.durationMins,
    category: c.category,
    photo: c.photo,
  }))

  // DB results first, then static entries not yet in the database
  const staticOnly = STATIC_RESULTS.filter(r => !dbSlugs.has(r.slug))
  const allResults = [...dbResults, ...staticOnly]

  return <SearchClient initialResults={allResults} initialQuery={searchParams.q ?? ''} initialDate={searchParams.date ?? ''} />
}
