import { getExperienceCards } from '@/lib/experiences'
import SearchClient, { type SearchResult } from './SearchClient'

const SLUG_TO_LOCATION: Record<string, string> = {
  ubud: 'Ubud', canggu: 'Canggu', uluwatu: 'Uluwatu', seminyak: 'Seminyak',
  jimbaran: 'Jimbaran', sidemen: 'Sidemen', kuta: 'Kuta', gianyar: 'Gianyar',
  sanur: 'Sanur', 'nusa-dua': 'Nusa Dua', amed: 'Amed', medewi: 'Medewi', kintamani: 'Kintamani',
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string; date?: string; location?: string } }) {
  const dbCards = await getExperienceCards()

  const results: SearchResult[] = dbCards.map((c, i) => ({
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

  const initialLocation = searchParams.location ? (SLUG_TO_LOCATION[searchParams.location.toLowerCase()] ?? 'All Locations') : 'All Locations'

  return <SearchClient initialResults={results} initialQuery={searchParams.q ?? ''} initialDate={searchParams.date ?? ''} initialLocation={initialLocation} />
}
