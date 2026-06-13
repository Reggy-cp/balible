import { getExperienceCards } from '@/lib/experiences'
import SearchClient, { type SearchResult } from './SearchClient'

// Static fallback — used for slugs not yet in the database
const STATIC_RESULTS: SearchResult[] = [
  // Art & Craft
  { id: 1,  slug: 'pottery-making-class',            title: 'Pottery Making Class',             area: 'Ubud',      rating: 4.9, reviews: 128, price: 450000,  durationMins: 150, category: 'Art & Craft',       photo: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&auto=format&fit=crop&q=80' },
  { id: 2,  slug: 'silver-jewelry-workshop',         title: 'Silver Jewelry Workshop',          area: 'Canggu',    rating: 4.8, reviews: 94,  price: 550000,  durationMins: 180, category: 'Art & Craft',       photo: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=300&auto=format&fit=crop&q=80' },
  { id: 3,  slug: 'batik-painting-workshop',         title: 'Batik Painting Workshop',          area: 'Ubud',      rating: 4.7, reviews: 64,  price: 380000,  durationMins: 180, category: 'Art & Craft',       photo: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&auto=format&fit=crop&q=80' },
  { id: 14, slug: 'natural-dye-workshop',            title: 'Natural Dye Workshop',             area: 'Sidemen',   rating: 4.7, reviews: 48,  price: 380000,  durationMins: 180, category: 'Art & Craft',       photo: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300&auto=format&fit=crop&q=80' },
  { id: 15, slug: 'wood-carving-workshop',           title: 'Wood Carving Workshop',            area: 'Ubud',      rating: 4.8, reviews: 72,  price: 500000,  durationMins: 240, category: 'Art & Craft',       photo: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&auto=format&fit=crop&q=80' },
  { id: 16, slug: 'rattan-weaving-class',            title: 'Rattan Weaving Class',             area: 'Sidemen',   rating: 4.7, reviews: 38,  price: 350000,  durationMins: 180, category: 'Art & Craft',       photo: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=300&auto=format&fit=crop&q=80' },
  // Wellness & Healing
  { id: 5,  slug: 'sound-healing-journey',           title: 'Sound Healing Journey',            area: 'Ubud',      rating: 4.8, reviews: 178, price: 350000,  durationMins: 90,  category: 'Wellness & Healing', photo: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&auto=format&fit=crop&q=80' },
  { id: 6,  slug: 'sunrise-yoga-class',              title: 'Sunrise Yoga & Meditation',        area: 'Canggu',    rating: 4.9, reviews: 203, price: 250000,  durationMins: 75,  category: 'Wellness & Healing', photo: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=300&auto=format&fit=crop&q=80' },
  { id: 17, slug: 'balinese-spa-ritual',             title: 'Balinese Spa & Flower Ritual',     area: 'Seminyak',  rating: 4.8, reviews: 141, price: 480000,  durationMins: 120, category: 'Wellness & Healing', photo: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300&auto=format&fit=crop&q=80' },
  { id: 18, slug: 'breathwork-retreat-ubud',         title: 'Breathwork & Ice Bath Session',    area: 'Ubud',      rating: 4.7, reviews: 56,  price: 420000,  durationMins: 90,  category: 'Wellness & Healing', photo: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&auto=format&fit=crop&q=80' },
  // Culture
  { id: 7,  slug: 'water-temple-purification',       title: 'Water Temple Purification',        area: 'Gianyar',   rating: 4.8, reviews: 78,  price: 600000,  durationMins: 240, category: 'Culture',            photo: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=300&auto=format&fit=crop&q=80' },
  { id: 8,  slug: 'uluwatu-kecak-sunset',            title: 'Uluwatu Sunset & Kecak Dance',     area: 'Uluwatu',   rating: 4.9, reviews: 312, price: 450000,  durationMins: 180, category: 'Culture',            photo: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300&auto=format&fit=crop&q=80' },
  { id: 19, slug: 'balinese-dance-workshop',         title: 'Balinese Dance Workshop',          area: 'Ubud',      rating: 4.7, reviews: 84,  price: 380000,  durationMins: 120, category: 'Culture',            photo: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=300&auto=format&fit=crop&q=80' },
  { id: 20, slug: 'bali-language-class',             title: 'Balinese Language & Culture Class',area: 'Ubud',      rating: 4.6, reviews: 32,  price: 280000,  durationMins: 120, category: 'Culture',            photo: 'https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?w=300&auto=format&fit=crop&q=80' },
  // Culinary
  { id: 9,  slug: 'balinese-cooking-class',          title: 'Balinese Cooking Class',           area: 'Seminyak',  rating: 4.8, reviews: 156, price: 480000,  durationMins: 210, category: 'Culinary',           photo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&auto=format&fit=crop&q=80' },
  { id: 10, slug: 'jimbaran-seafood-sunset',         title: 'Jimbaran Seafood & Sunset',        area: 'Jimbaran',  rating: 4.6, reviews: 89,  price: 350000,  durationMins: 120, category: 'Culinary',           photo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&auto=format&fit=crop&q=80' },
  { id: 21, slug: 'spice-garden-cooking',            title: 'Spice Garden & Farm-to-Table',     area: 'Ubud',      rating: 4.9, reviews: 112, price: 520000,  durationMins: 240, category: 'Culinary',           photo: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=300&auto=format&fit=crop&q=80' },
  { id: 22, slug: 'bali-coffee-tour',                title: 'Kintamani Coffee & Tea Tour',      area: 'Kintamani', rating: 4.7, reviews: 67,  price: 350000,  durationMins: 180, category: 'Culinary',           photo: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&auto=format&fit=crop&q=80' },
  // Spiritual
  { id: 23, slug: 'holy-water-ceremony',             title: 'Holy Water Purification Ceremony', area: 'Gianyar',   rating: 4.9, reviews: 148, price: 550000,  durationMins: 180, category: 'Spiritual',          photo: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=300&auto=format&fit=crop&q=80' },
  { id: 24, slug: 'manku-energy-healing',            title: 'Balinese Energy Healing with Manku',area: 'Ubud',     rating: 4.8, reviews: 86,  price: 750000,  durationMins: 90,  category: 'Spiritual',          photo: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&auto=format&fit=crop&q=80' },
  { id: 25, slug: 'temple-ceremony-blessing',        title: 'Temple Ceremony & Blessing',       area: 'Gianyar',   rating: 4.9, reviews: 122, price: 480000,  durationMins: 150, category: 'Spiritual',          photo: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300&auto=format&fit=crop&q=80' },
  { id: 26, slug: 'melukat-river-ritual',            title: 'Melukat River Cleansing Ritual',   area: 'Ubud',      rating: 4.8, reviews: 74,  price: 650000,  durationMins: 120, category: 'Spiritual',          photo: 'https://images.unsplash.com/photo-1520209759809-a9bcb6cb3241?w=300&auto=format&fit=crop&q=80' },
  // Nature & Outdoors
  { id: 13, slug: 'rice-terrace-walk',               title: 'Tegalalang Rice Terrace Walk',     area: 'Ubud',      rating: 4.8, reviews: 192, price: 280000,  durationMins: 150, category: 'Nature & Outdoors',  photo: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=300&auto=format&fit=crop&q=80' },
  { id: 27, slug: 'mount-batur-sunrise-trek',        title: 'Mount Batur Sunrise Trek',         area: 'Kintamani', rating: 4.9, reviews: 284, price: 750000,  durationMins: 420, category: 'Nature & Outdoors',  photo: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&auto=format&fit=crop&q=80' },
  { id: 28, slug: 'sekumpul-waterfall-hike',         title: 'Sekumpul Waterfall Hike',          area: 'Gianyar',   rating: 4.8, reviews: 98,  price: 480000,  durationMins: 300, category: 'Nature & Outdoors',  photo: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=300&auto=format&fit=crop&q=80' },
  // Water Activities
  { id: 11, slug: 'beginner-surf-lesson',            title: 'Beginner Surf Lesson',             area: 'Kuta',      rating: 4.7, reviews: 428, price: 320000,  durationMins: 120, category: 'Water Activities',   photo: 'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=300&auto=format&fit=crop&q=80' },
  { id: 12, slug: 'snorkeling-amed',                 title: 'Snorkeling at Amed Reef',          area: 'Amed',      rating: 4.8, reviews: 67,  price: 420000,  durationMins: 180, category: 'Water Activities',   photo: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=300&auto=format&fit=crop&q=80' },
  { id: 29, slug: 'freediving-nusa-penida',          title: 'Freediving at Nusa Penida',        area: 'Nusa Dua',  rating: 4.9, reviews: 55,  price: 1200000, durationMins: 360, category: 'Water Activities',   photo: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&auto=format&fit=crop&q=80' },
  { id: 30, slug: 'sup-sanur-sunrise',               title: 'Stand-Up Paddle at Sanur',        area: 'Sanur',     rating: 4.6, reviews: 43,  price: 280000,  durationMins: 90,  category: 'Water Activities',   photo: 'https://images.unsplash.com/photo-1565992441121-4367c2967103?w=300&auto=format&fit=crop&q=80' },
  // Local Experts
  { id: 31, slug: 'bali-photography-guide',          title: 'Bali Photography Guide',           area: 'Ubud',      rating: 4.9, reviews: 78,  price: 850000,  durationMins: 240, category: 'Local Experts',      photo: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300&auto=format&fit=crop&q=80' },
  { id: 32, slug: 'private-bali-guide',              title: 'Private Bali Island Guide',        area: 'Seminyak',  rating: 4.8, reviews: 112, price: 750000,  durationMins: 480, category: 'Local Experts',      photo: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=300&auto=format&fit=crop&q=80' },
  { id: 33, slug: 'family-childcare-bali',           title: 'Professional Childcare for Families', area: 'Canggu', rating: 4.9, reviews: 64,  price: 400000,  durationMins: 480, category: 'Local Experts',      photo: 'https://images.unsplash.com/photo-1540479859555-17af45c78602?w=300&auto=format&fit=crop&q=80' },
  { id: 34, slug: 'dog-walker-canggu',               title: 'Dog Walking & Pet Care',           area: 'Canggu',    rating: 4.8, reviews: 47,  price: 250000,  durationMins: 120, category: 'Local Experts',      photo: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=300&auto=format&fit=crop&q=80' },
  { id: 35, slug: 'personal-driver-bali',            title: 'Personal Driver — Full Day',       area: 'Ubud',      rating: 4.9, reviews: 189, price: 500000,  durationMins: 480, category: 'Local Experts',      photo: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=300&auto=format&fit=crop&q=80' },
  // Rentals
  { id: 36, slug: 'scooter-rental-canggu',           title: 'Scooter Rental — Daily',           area: 'Canggu',    rating: 4.7, reviews: 342, price: 80000,   durationMins: 1440, category: 'Rentals',           photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&auto=format&fit=crop&q=80' },
  { id: 37, slug: 'motorbike-rental-ubud',           title: 'Motorbike Rental — Semi-auto',     area: 'Ubud',      rating: 4.6, reviews: 218, price: 100000,  durationMins: 1440, category: 'Rentals',           photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&auto=format&fit=crop&q=80' },
  { id: 38, slug: 'villa-rental-seminyak',           title: 'Private Pool Villa — 3BR',         area: 'Seminyak',  rating: 4.9, reviews: 87,  price: 2200000, durationMins: 1440, category: 'Rentals',           photo: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300&auto=format&fit=crop&q=80' },
  { id: 39, slug: 'surfboard-rental-kuta',           title: 'Surfboard Rental',                 area: 'Kuta',      rating: 4.5, reviews: 156, price: 75000,   durationMins: 360,  category: 'Rentals',           photo: 'https://images.unsplash.com/photo-1509914398892-963f53e6e2f1?w=300&auto=format&fit=crop&q=80' },
  { id: 40, slug: 'ebike-rental-canggu',             title: 'E-Bike Rental — Full Day',         area: 'Canggu',    rating: 4.8, reviews: 93,  price: 150000,  durationMins: 1440, category: 'Rentals',           photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&auto=format&fit=crop&q=80' },
  { id: 41, slug: 'coworking-space-canggu',          title: 'Coworking Day Pass',               area: 'Canggu',    rating: 4.7, reviews: 74,  price: 120000,  durationMins: 480,  category: 'Rentals',           photo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&auto=format&fit=crop&q=80' },
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
