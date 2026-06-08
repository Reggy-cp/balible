import { notFound } from 'next/navigation'
import { MapPin, Star, Clock, ArrowRight, Users, ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'

type Experience = {
  slug: string; title: string; area: string; rating: number; reviews: number
  price: number; durationMins: number; category: string; photo: string
}

type AreaData = {
  slug: string; name: string; tagline: string; description: string
  longDescription: string; highlights: string[]; rating: number
  image: string; heroImage: string; color: string; bg: string
  mustSee: { name: string; description: string }[]
  practicalTips: string[]
  experienceAreas: string[]
}

const AREAS: Record<string, AreaData> = {
  Ubud: {
    slug: 'Ubud', name: 'Ubud', tagline: 'Cultural Heart of Bali',
    description: 'Nestled among rice terraces and jungle, Ubud is Bali\'s artistic and spiritual centre. Expect world-class galleries, traditional dance performances, healing rituals, and wellness retreats tucked down lush laneways.',
    longDescription: 'Ubud has drawn artists, healers, and seekers for over a century — and for good reason. The town sits at the intersection of Bali\'s artistic and spiritual traditions, surrounded by terraced rice fields, sacred temples, and jungle-draped gorges. It is the home of traditional Balinese painting, wood carving, silver work, and dance forms that are performed nowhere else on earth with the same depth of tradition. Yet Ubud is not a museum. It is a living town where these crafts are still practised daily, still taught in family compounds, still offered to the gods at temple ceremonies that happen every few days somewhere in the surrounding villages.',
    highlights: ['Tegalalang Rice Terraces', 'Monkey Forest', 'Ubud Palace', 'Campuhan Ridge Walk', 'Art Market', 'Sacred Monkey Forest Sanctuary'],
    rating: 4.85,
    image: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&auto=format&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=1600&auto=format&fit=crop&q=80',
    color: '#4A7C59', bg: '#F0F7F2',
    mustSee: [
      { name: 'Tegalalang Rice Terraces', description: 'The iconic stepped paddies north of Ubud — best at golden hour, when the light catches the water in the flooded fields.' },
      { name: 'Campuhan Ridge Walk', description: 'A two-kilometre walk along a jungle ridge above the Campuhan river — peaceful, green, and free of charge.' },
      { name: 'Pura Tirta Empul', description: 'A water purification temple where Balinese Hindus bathe in spring-fed pools as a ritual act of spiritual cleansing. One of Bali\'s most sacred sites.' },
    ],
    practicalTips: [
      'The central market operates at its best between 5am and 7am — this is when locals shop, before the tourist goods arrive.',
      'Most temples require a sarong, which can be borrowed at the entrance. Bring your own to avoid queues.',
      'Ubud\'s narrow main road becomes gridlocked from midday to 2pm. Walk, cycle, or ask your driver to take back roads.',
      'Afternoon rain is common from November to March. Most workshops and experiences are indoors.',
    ],
    experienceAreas: ['Ubud', 'Gianyar'],
  },
  Canggu: {
    slug: 'Canggu', name: 'Canggu', tagline: 'Surf, Soul & Slow Mornings',
    description: 'Once a sleepy rice paddy village, Canggu has evolved into Bali\'s most vibrant creative district. Black-sand beaches, world-class surf breaks, sunrise yoga on rooftops, and specialty coffee at every turn.',
    longDescription: 'Canggu sits on Bali\'s south-west coast, where the Indian Ocean rolls in from the south and the rice paddies begin immediately beyond the beach roads. A decade ago it was known only to surfers and long-stay expats. Today it is Bali\'s most international neighbourhood — a place where digital nomads work from beachside cafes, yoga teachers offer dawn classes on rooftop platforms, and the food scene moves faster than anywhere else on the island. The rice paddies are still there, though increasingly hemmed in by villas and warungs. The surf breaks — Batu Bolong, Echo Beach, Berawa — are still excellent. Canggu rewards early risers: the light before 8am, when the surfers are out and the cafes just opening, is the Canggu that people come back for.',
    highlights: ['Echo Beach', 'Batu Bolong Temple', 'Berawa Beach', 'Pererenan Rice Fields', 'Sunrise Yoga'],
    rating: 4.82,
    image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&auto=format&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=1600&auto=format&fit=crop&q=80',
    color: '#B66A45', bg: '#FDF8F4',
    mustSee: [
      { name: 'Batu Bolong Beach', description: 'The social centre of Canggu — a black-sand beach with a Hindu temple at one end, surf schools in the middle, and some of the island\'s best cafes on the road above.' },
      { name: 'Echo Beach', description: 'Canggu\'s largest and most powerful break, with a lively strip of beach clubs behind it. Great for watching surfing even if you\'re not getting in the water.' },
      { name: 'Pererenan Rice Fields', description: 'The rice paddies north of Pererenan village are the most intact in the Canggu area — best seen by bicycle at dawn or dusk.' },
    ],
    practicalTips: [
      'Scooters or bicycles are the right transport here. The roads are too narrow and indirect for cars to be practical.',
      'The surf at Echo Beach and Batu Bolong is powerful — beginners should take a lesson before entering the water.',
      'Canggu is quieter and more local north of Pererenan. The area around Batu Bolong and Berawa is busier but more convenient.',
      'The best coffee in Canggu is at small, unmarked shops — look for lines of locals, not Instagram signs.',
    ],
    experienceAreas: ['Canggu'],
  },
  Uluwatu: {
    slug: 'Uluwatu', name: 'Uluwatu', tagline: 'Clifftops, Kecak & Surf',
    description: 'Perched on dramatic limestone cliffs above the Indian Ocean, Uluwatu is one of Bali\'s most awe-inspiring locations. Famous for the sacred temple, the mesmerising Kecak fire dance at sunset, and serious surf breaks below.',
    longDescription: 'The Bukit Peninsula is a raised limestone plateau at Bali\'s southern tip, cut by cliff faces that drop seventy metres straight into the Indian Ocean. Uluwatu sits at the western point of this plateau, where the ancient sea temple Pura Luhur Uluwatu clings to the clifftop above the waves. The surf at Uluwatu is among the best in the world — hollow, fast, and demanding — and it draws a global community of serious surfers to the cluster of simple cliff-top warungs and guesthouses that have grown above the break. Each evening, a hundred men perform the Kecak fire dance in the temple complex as the sun sets behind them into the ocean. It is one of the great spectacles available to a traveller in Southeast Asia.',
    highlights: ['Uluwatu Temple', 'Kecak Sunset Dance', 'Padang Padang Beach', 'Bingin Beach', 'Blue Point Bay'],
    rating: 4.92,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&auto=format&fit=crop&q=80',
    color: '#6F675C', bg: '#F5F1EB',
    mustSee: [
      { name: 'Pura Luhur Uluwatu', description: 'A sixth-century sea temple on a seventy-metre cliff. One of Bali\'s nine directional temples, believed to protect the island from evil spirits rising from the sea.' },
      { name: 'The Kecak Dance', description: 'Performed nightly at sunset in the temple complex. A hundred men create an extraordinary choral soundscape while enacting the Ramayana. Arrive by 5:15pm for a good seat.' },
      { name: 'Padang Padang Beach', description: 'A small cave-access beach that gained fame in "Eat, Pray, Love" — emerald water, white sand, and an end-of-world feeling on quiet mornings.' },
    ],
    practicalTips: [
      'Arrange transport in advance — Uluwatu is far from most accommodation and Grab coverage is unreliable.',
      'Bring a sarong for the temple (one is lent at the entrance, but having your own skips the queue).',
      'Watch your belongings at the temple — the resident monkeys are skilled and opportunistic thieves.',
      'The beach at Padang Padang requires a climb down steps through a narrow rock passage. Wear shoes you can take off easily.',
    ],
    experienceAreas: ['Uluwatu'],
  },
  Seminyak: {
    slug: 'Seminyak', name: 'Seminyak', tagline: 'Sunset Dining & Bali Chic',
    description: 'Seminyak is Bali\'s most sophisticated beach destination — a refined strip of boutique hotels, acclaimed restaurants, rooftop bars, and beautiful shops. The sunsets here are legendary, best watched from a bean bag on the sand.',
    longDescription: 'Seminyak occupies a few kilometres of Bali\'s south-west coast, north of Kuta and south of Canggu. It is the most polished and self-consciously designed part of the island — a place where the accommodation is genuinely beautiful, the food is internationally excellent, and the beach clubs have invested seriously in both aesthetics and experience. The shopping is the best in Bali: independent boutiques selling locally made clothing, jewellery, ceramics, and home goods that you won\'t find anywhere else. Seminyak is not the place for cultural immersion or nature experiences, but as a base for exploring the island it is unmatched, and its own pleasures — a long sunset walk on the beach, dinner at a table in a garden restaurant — are real and considerable.',
    highlights: ['Seminyak Beach', 'Petitenget Temple', 'Eat Street', 'Boutique Shopping', 'Sunset Cocktails'],
    rating: 4.78,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&auto=format&fit=crop&q=80',
    color: '#C8A97E', bg: '#FFFDF9',
    mustSee: [
      { name: 'Seminyak Beach at Sunset', description: 'The westward-facing beach turns gold then pink in the last hour of daylight. Rent a bean bag from a beach club or bring a mat — locals do both.' },
      { name: 'Petitenget Temple', description: 'An important sea temple at the northern end of Seminyak beach, often overlooked by visitors staying nearby. Ceremonies are held regularly.' },
      { name: 'Jl. Kayu Aya (Eat Street)', description: 'The main restaurant strip, lined with quality kitchens ranging from Balinese warung food to internationally awarded fine dining.' },
    ],
    practicalTips: [
      'Seminyak is walkable along the beach — walking north to Canggu takes forty-five minutes and is far more pleasant than driving.',
      'The main road (Jl. Raya Seminyak) is permanently congested. Use the beach road or back lanes for most journeys.',
      'Book dinner reservations in peak season (July–August, December–January). The best restaurants fill by 7pm.',
      'The rainy season (November–March) brings swell to the beach — beautiful but not safe for swimming.',
    ],
    experienceAreas: ['Seminyak'],
  },
  Jimbaran: {
    slug: 'Jimbaran', name: 'Jimbaran', tagline: 'Fresh Catch & Firelit Tables',
    description: 'A traditional fishing village turned seafood paradise, Jimbaran Bay is famed for its candlelit beach warungs serving the day\'s catch grilled over coconut husks. Watch the sun melt into the ocean while fishermen bring in their boats.',
    longDescription: 'Jimbaran sits on the western shore of the Bukit Peninsula, where a sheltered bay curves between Kuta to the north and the Bukit cliffs to the south. It has two identities that coexist comfortably. The first is the fishing village: the Kedonganan market at the north end of the bay is one of Bali\'s largest fish markets, active from 5am when the outrigger canoes return with their catch. The second is the resort area: the southern section of the bay hosts several of Bali\'s finest hotels, their grounds sweeping down to a calm, swimmable beach. Between these two poles is the evening ritual that makes Jimbaran famous — the seafood warungs that set tables on the sand at sunset, the grills lit over coconut charcoal, the day\'s catch laid out on ice for you to choose.',
    highlights: ['Jimbaran Fish Market', 'Seafood Beach Warungs', 'Jimbaran Bay Sunset', 'Four Seasons Beach', 'Kedonganan Market'],
    rating: 4.62,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&auto=format&fit=crop&q=80',
    color: '#4A7C59', bg: '#F0F7F2',
    mustSee: [
      { name: 'Kedonganan Fish Market', description: 'Active from 5am to 7am — the outrigger canoes arrive, the catch is sorted and sold. A vivid insight into the village life that underpins the tourist-facing seafood restaurants.' },
      { name: 'Seafood Beach Warungs', description: 'The row of candlelit tables on the sand at sunset is the definitive Jimbaran experience. The best warungs are at the northern end near the fish market.' },
      { name: 'Jimbaran Bay at Sunset', description: 'The west-facing bay catches the full sunset. Watch the fishing boats silhouetted against the orange sky from a table on the sand.' },
    ],
    practicalTips: [
      'Negotiate fish prices at the ice display before it goes to the kitchen. Confirm the per-kilogram price.',
      'Arrive at the warungs between 5:30pm and 6pm for the best table and the full sunset — later arrivals miss the light.',
      'The fish market visit requires an early alarm: 5am–6:30am is when the boats come in and the activity is at its peak.',
      'The calm bay is excellent for swimming, especially in the dry season. The northern end near the market is the most local.',
    ],
    experienceAreas: ['Jimbaran'],
  },
  Sidemen: {
    slug: 'Sidemen', name: 'Sidemen & East Bali', tagline: 'The Bali Fewer People Find',
    description: 'Away from the tourist trail, East Bali is where the island breathes slowly. Sidemen valley, with Mount Agung as its backdrop, is a patchwork of emerald terraces, weaving villages, and morning mist.',
    longDescription: 'East Bali is a different island from the one most visitors experience. There are no beach clubs, no traffic jams on narrow villa streets, no menus in twelve languages. What there is: one of the most beautiful river valleys in Asia, a weaving tradition so labour-intensive that a single cloth takes five years to make, a fishing coast where the volcanic black sand beaches are empty on weekday mornings, and Mount Agung — Bali\'s most sacred and highest volcano — as a constant presence on the horizon. Sidemen valley is the heart of this region: a patchwork of rice terraces, traditional villages, and small family guesthouses that offer genuine peace. Amed, an hour further east on the coast, has some of Bali\'s best snorkelling and diving over a coral garden that has largely recovered from the bleaching events of recent years.',
    highlights: ['Sidemen Valley', 'Mount Agung Views', 'Ikat Weaving Villages', 'Amed Reef Snorkelling', 'Tirta Gangga Water Palace'],
    rating: 4.75,
    image: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=800&auto=format&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=1600&auto=format&fit=crop&q=80',
    color: '#B66A45', bg: '#FDF8F4',
    mustSee: [
      { name: 'Tirta Gangga Water Palace', description: 'An ornamental water palace built in 1948 by the last king of Karangasem — stepping stones across lily ponds, tiered fountains, and Agung in the background on clear mornings.' },
      { name: 'Sidemen Valley Ridge Walk', description: 'A forty-minute walk from the village centre to a viewpoint above the valley. Go at sunrise when the mist hangs in the terraces and Agung is clear.' },
      { name: 'Amed Reef', description: 'A shallow coral garden directly off the black sand beach at Amed — accessible by snorkel, with excellent visibility in the dry season and a Japanese WW2 shipwreck nearby for divers.' },
    ],
    practicalTips: [
      'Hire a driver from Ubud for the day or stay at least one night — the round trip takes four hours and the experience rewards time.',
      'Scooters are practical on the main Sidemen road, but some of the valley paths are steep and unpaved.',
      'The double ikat geringsing textiles sold in Sidemen village are the genuine article. Prices are higher than market reproductions because the work is real.',
      'Bring cash — ATMs are scarce east of Karangasem town.',
    ],
    experienceAreas: ['Sidemen', 'Amed'],
  },
}

const ALL_EXPERIENCES: Experience[] = [
  { slug: 'pottery-making-class', title: 'Pottery Making Class', area: 'Ubud', rating: 4.9, reviews: 128, price: 450000, durationMins: 150, category: 'Art & Craft', photo: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&auto=format&fit=crop&q=80' },
  { slug: 'silver-jewelry-workshop', title: 'Silver Jewelry Workshop', area: 'Canggu', rating: 4.8, reviews: 94, price: 550000, durationMins: 180, category: 'Art & Craft', photo: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&auto=format&fit=crop&q=80' },
  { slug: 'batik-painting-workshop', title: 'Batik Painting Workshop', area: 'Ubud', rating: 4.7, reviews: 64, price: 380000, durationMins: 180, category: 'Art & Craft', photo: 'https://images.unsplash.com/photo-1616627428492-37e14fac6e14?w=400&auto=format&fit=crop&q=80' },
  { slug: 'traditional-batik-workshop', title: 'Traditional Batik Workshop', area: 'Ubud', rating: 4.7, reviews: 52, price: 420000, durationMins: 210, category: 'Art & Craft', photo: 'https://images.unsplash.com/photo-1616627428492-37e14fac6e14?w=400&auto=format&fit=crop&q=80' },
  { slug: 'sound-healing-journey', title: 'Sound Healing Journey', area: 'Ubud', rating: 4.8, reviews: 178, price: 350000, durationMins: 90, category: 'Wellness', photo: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop&q=80' },
  { slug: 'sunrise-yoga-class', title: 'Sunrise Yoga & Meditation', area: 'Canggu', rating: 4.9, reviews: 203, price: 250000, durationMins: 75, category: 'Wellness', photo: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&auto=format&fit=crop&q=80' },
  { slug: 'water-temple-purification', title: 'Water Temple Purification', area: 'Gianyar', rating: 4.8, reviews: 78, price: 600000, durationMins: 240, category: 'Culture', photo: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&auto=format&fit=crop&q=80' },
  { slug: 'uluwatu-kecak-sunset', title: 'Uluwatu Sunset & Kecak Dance', area: 'Uluwatu', rating: 4.9, reviews: 312, price: 450000, durationMins: 180, category: 'Culture', photo: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&auto=format&fit=crop&q=80' },
  { slug: 'balinese-cooking-class', title: 'Balinese Cooking Class', area: 'Seminyak', rating: 4.8, reviews: 156, price: 480000, durationMins: 210, category: 'Food & Drink', photo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=80' },
  { slug: 'jimbaran-seafood-sunset', title: 'Jimbaran Seafood & Sunset', area: 'Jimbaran', rating: 4.6, reviews: 89, price: 350000, durationMins: 120, category: 'Food & Drink', photo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&auto=format&fit=crop&q=80' },
  { slug: 'beginner-surf-lesson', title: 'Beginner Surf Lesson', area: 'Kuta', rating: 4.7, reviews: 428, price: 320000, durationMins: 120, category: 'Surf & Water', photo: 'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=400&auto=format&fit=crop&q=80' },
  { slug: 'snorkeling-amed', title: 'Snorkeling at Amed Reef', area: 'Amed', rating: 4.8, reviews: 67, price: 420000, durationMins: 180, category: 'Surf & Water', photo: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=400&auto=format&fit=crop&q=80' },
  { slug: 'rice-terrace-walk', title: 'Tegalalang Rice Terrace Walk', area: 'Ubud', rating: 4.8, reviews: 192, price: 280000, durationMins: 150, category: 'Nature', photo: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&auto=format&fit=crop&q=80' },
  { slug: 'natural-dye-workshop', title: 'Natural Dye Workshop', area: 'Sidemen', rating: 4.7, reviews: 48, price: 380000, durationMins: 180, category: 'Art & Craft', photo: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&auto=format&fit=crop&q=80' },
  { slug: 'wood-carving-workshop', title: 'Wood Carving Workshop', area: 'Ubud', rating: 4.8, reviews: 72, price: 500000, durationMins: 240, category: 'Art & Craft', photo: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&auto=format&fit=crop&q=80' },
  { slug: 'rattan-weaving-class', title: 'Rattan Weaving Class', area: 'Sidemen', rating: 4.7, reviews: 38, price: 350000, durationMins: 180, category: 'Art & Craft', photo: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=400&auto=format&fit=crop&q=80' },
]

export function generateStaticParams() {
  return Object.keys(AREAS).map(area => ({ area }))
}

export async function generateMetadata({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params
  const data = AREAS[area]
  if (!data) return {}
  return {
    title: `${data.name} — Balible Destinations`,
    description: data.description,
  }
}

export default async function DestinationAreaPage({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params
  const data = AREAS[area]
  if (!data) notFound()

  const experiences = ALL_EXPERIENCES.filter(e => data.experienceAreas.includes(e.area))

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins} min`
    const h = Math.floor(mins / 60), m = mins % 60
    return m ? `${h}h ${m}m` : `${h} hours`
  }

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh' }}>
      <Navbar />

      {/* HERO */}
      <div className="relative w-full" style={{ height: 'clamp(320px, 50vw, 560px)' }}>
        <img src={data.heroImage} alt={data.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.6) 100%)' }} />
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-12 max-w-[1100px] mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={14} style={{ color: '#C8A97E' }} />
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#C8A97E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Bali
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(30px, 5vw, 58px)', fontWeight: 700, color: 'white', lineHeight: 1.1, marginBottom: 10, textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
            {data.name}
          </h1>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 'clamp(14px, 1.8vw, 18px)', color: 'rgba(255,255,255,0.85)', maxWidth: 560, lineHeight: 1.6 }}>
            {data.tagline}
          </p>
          <div className="flex items-center gap-3 mt-4">
            <Star size={14} fill="#C8A97E" color="#C8A97E" />
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 700, color: 'white' }}>{data.rating}</span>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>avg experience rating</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-5 lg:px-8">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 pt-8 pb-2">
          <a href="/destinations" style={{ fontSize: 13, color: '#6F675C', textDecoration: 'none' }} className="hover:text-[#111111] transition-colors">Destinations</a>
          <ChevronRight size={13} style={{ color: '#6F675C' }} />
          <span style={{ fontSize: 13, color: '#111111', fontWeight: 500 }}>{data.name}</span>
        </div>

        {/* OVERVIEW */}
        <div className="grid lg:grid-cols-3 gap-10 py-12" style={{ borderBottom: '1px solid #E8E4DE' }}>
          <div className="lg:col-span-2">
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, letterSpacing: '0.15em', color: data.color, textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>About {data.name}</p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 'clamp(15px, 1.6vw, 17px)', color: '#3A3530', lineHeight: 1.85 }}>
              {data.longDescription}
            </p>
          </div>
          <div>
            <div className="rounded-2xl p-5" style={{ backgroundColor: data.bg, border: `1px solid ${data.color}22` }}>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 700, color: data.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Highlights</p>
              <ul className="space-y-2">
                {data.highlights.map(h => (
                  <li key={h} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: data.color }} />
                    <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#3A3530' }}>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* EXPERIENCES */}
        <div className="py-14" style={{ borderBottom: experiences.length ? '1px solid #E8E4DE' : 'none' }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, letterSpacing: '0.15em', color: data.color, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Experiences</p>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(22px, 2.5vw, 30px)', fontWeight: 700, color: '#111111' }}>
                {experiences.length > 0 ? `${experiences.length} Experience${experiences.length !== 1 ? 's' : ''} in ${data.name.split(' ')[0]}` : `Explore ${data.name.split(' ')[0]}`}
              </h2>
            </div>
            <a
              href={`/search?location=${data.slug}`}
              className="hidden sm:flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              style={{ fontSize: 13, color: data.color, fontWeight: 600, textDecoration: 'none' }}
            >
              View all <ArrowRight size={13} />
            </a>
          </div>

          {experiences.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {experiences.map(exp => (
                <a
                  key={exp.slug}
                  href={`/experiences/${exp.slug}`}
                  className="bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                  style={{ border: '1px solid #E8E4DE', textDecoration: 'none' }}
                >
                  <div className="relative" style={{ height: 200, overflow: 'hidden' }}>
                    <img src={exp.photo} alt={exp.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(17,17,17,0.7)', color: 'white', fontSize: 10, fontWeight: 600 }}>
                      {exp.category}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: '#111111', lineHeight: 1.3, marginBottom: 8 }}>
                      {exp.title}
                    </h3>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1">
                        <Star size={11} fill="#C8A97E" color="#C8A97E" />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#111111' }}>{exp.rating}</span>
                        <span style={{ fontSize: 12, color: '#6F675C' }}>({exp.reviews})</span>
                      </div>
                      <div style={{ width: 1, height: 12, backgroundColor: '#E8E4DE' }} />
                      <div className="flex items-center gap-1">
                        <Clock size={10} style={{ color: '#6F675C' }} />
                        <span style={{ fontSize: 12, color: '#6F675C' }}>{formatDuration(exp.durationMins)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #E8E4DE' }}>
                      <div>
                        <span style={{ fontSize: 11, color: '#6F675C' }}>From </span>
                        <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 700, color: '#111111' }}>
                          IDR {exp.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, color: data.color, fontWeight: 600 }}>Book →</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 rounded-2xl" style={{ backgroundColor: 'white', border: '1px solid #E8E4DE' }}>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#6F675C', marginBottom: 12 }}>Browse all experiences in {data.name}</p>
              <a href={`/search?location=${data.slug}`} className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity" style={{ height: 42, padding: '0 20px', backgroundColor: '#111111', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-inter)' }}>
                Search experiences <ArrowRight size={13} />
              </a>
            </div>
          )}
        </div>

        {/* MUST SEE */}
        <div className="py-14" style={{ borderBottom: '1px solid #E8E4DE' }}>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, letterSpacing: '0.15em', color: data.color, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Don&apos;t Miss</p>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(22px, 2.5vw, 28px)', fontWeight: 700, color: '#111111', marginBottom: 24 }}>
            Essential {data.name.split(' ')[0]}
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {data.mustSee.map((item, i) => (
              <div key={i} className="rounded-2xl p-5" style={{ backgroundColor: 'white', border: '1px solid #E8E4DE' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center mb-4 text-sm font-bold" style={{ backgroundColor: data.bg, color: data.color }}>
                  {i + 1}
                </div>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: '#111111', marginBottom: 8 }}>{item.name}</h3>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C', lineHeight: 1.7 }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PRACTICAL TIPS */}
        <div className="py-14">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, letterSpacing: '0.15em', color: data.color, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Practical Tips</p>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(22px, 2.5vw, 28px)', fontWeight: 700, color: '#111111', marginBottom: 20 }}>
            Before You Go
          </h2>
          <div className="space-y-3">
            {data.practicalTips.map((tip, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl" style={{ backgroundColor: 'white', border: '1px solid #E8E4DE' }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: data.bg, color: data.color }}>
                  <Users size={10} />
                </div>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#3A3530', lineHeight: 1.65 }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CTA BANNER */}
      <div className="mx-5 lg:mx-8 mb-16 rounded-2xl overflow-hidden max-w-[1100px] lg:mx-auto" style={{ maxWidth: 1100, margin: '0 auto 64px' }}>
        <div className="relative px-8 py-14 text-center" style={{ backgroundColor: '#111111' }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 20% 50%, ${data.color} 0%, transparent 50%), radial-gradient(circle at 80% 50%, #C8A97E 0%, transparent 50%)` }} />
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, letterSpacing: '0.2em', color: '#C8A97E', textTransform: 'uppercase', marginBottom: 10 }}>
            Ready to explore?
          </p>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, color: 'white', marginBottom: 12 }}>
            Book an Experience in {data.name.split(' ')[0]}
          </h2>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: 'rgba(255,255,255,0.65)', marginBottom: 28, maxWidth: 440, margin: '0 auto 28px' }}>
            Handpicked by people who know the island. Every experience is led by a local.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={`/search?location=${data.slug}`} className="inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" style={{ height: 48, padding: '0 32px', backgroundColor: '#C8A97E', color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-inter)' }}>
              Browse experiences <ArrowRight size={14} />
            </a>
            <a href="/destinations" className="inline-flex items-center justify-center hover:bg-white/10 transition-colors" style={{ height: 48, padding: '0 32px', border: '1px solid rgba(255,255,255,0.25)', color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none', fontFamily: 'var(--font-inter)' }}>
              Other destinations
            </a>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#111111', padding: '48px 24px 32px' }}>
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <a href="/" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: 'white', textDecoration: 'none' }}>BALIBLE</a>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>© 2024 Balible. All rights reserved.</p>
          <div className="flex gap-6">
            {[{ label: 'Destinations', href: '/destinations' }, { label: 'Experiences', href: '/search' }, { label: 'Map', href: '/map' }].map(({ label, href }) => (
              <a key={label} href={href} style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }} className="hover:text-white transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
