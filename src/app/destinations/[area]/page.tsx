import { notFound } from 'next/navigation'
import { MapPin, Star, ArrowRight, Users, ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'
import { getExperienceCards } from '@/lib/experiences'
import DestinationExperiences from './DestinationExperiences'

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
  ubud: {
    slug: 'ubud', name: 'Ubud', tagline: 'Cultural Heart of Bali',
    description: 'Nestled among rice terraces and jungle, Ubud is Bali\'s artistic and spiritual centre. Expect world-class galleries, traditional dance performances, healing rituals, and wellness retreats tucked down lush laneways.',
    longDescription: 'Ubud has drawn artists, healers, and seekers for over a century — and for good reason. The town sits at the intersection of Bali\'s artistic and spiritual traditions, surrounded by terraced rice fields, sacred temples, and jungle-draped gorges. It is the home of traditional Balinese painting, wood carving, silver work, and dance forms that are performed nowhere else on earth with the same depth of tradition. Yet Ubud is not a museum. It is a living town where these crafts are still practised daily, still taught in family compounds, still offered to the gods at temple ceremonies that happen every few days somewhere in the surrounding villages.',
    highlights: ['Tegalalang Rice Terraces', 'Monkey Forest', 'Ubud Palace', 'Campuhan Ridge Walk', 'Art Market', 'Sacred Monkey Forest Sanctuary'],
    rating: 4.85,
    image: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&auto=format&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=1600&auto=format&fit=crop&q=80',
    color: '#4A7C59', bg: '#F0F7F2',
    mustSee: [
      { name: 'Tegalalang Rice Terraces', description: 'The iconic stepped paddies north of Ubud — best at golden hour, when the light catches the water in the flooded fields.' },
      { name: 'Campuhan Ridge Walk', description: 'A two-kilometre walk along a jungle ridge above the Campuhan river — peaceful, green, and free.' },
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
  canggu: {
    slug: 'canggu', name: 'Canggu', tagline: 'Surf, Soul & Slow Mornings',
    description: 'Once a sleepy rice paddy village, Canggu has evolved into Bali\'s most vibrant creative district. Black-sand beaches, world-class surf breaks, sunrise yoga on rooftops, and specialty coffee at every turn.',
    longDescription: 'Canggu sits on Bali\'s south-west coast, where the Indian Ocean rolls in from the south and the rice paddies begin immediately beyond the beach roads. A decade ago it was known only to surfers and long-stay expats. Today it is Bali\'s most international neighbourhood — a place where digital nomads work from beachside cafes, yoga teachers offer dawn classes on rooftop platforms, and a food scene that reinvents itself each season. The rice paddies are still there, though increasingly hemmed in by villas and warungs. The surf breaks — Batu Bolong, Echo Beach, Berawa — are still excellent. Canggu rewards early risers: the light before 8am, when the surfers are out and the cafes just opening, is the Canggu that people come back for.',
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
  uluwatu: {
    slug: 'uluwatu', name: 'Uluwatu', tagline: 'Clifftops, Kecak & Surf',
    description: 'Perched on dramatic limestone cliffs above the Indian Ocean, Uluwatu is where Bali reaches its most elemental — ancient temple, ocean thunder, and some of the world\'s most demanding surf.',
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
  seminyak: {
    slug: 'seminyak', name: 'Seminyak', tagline: 'Sunset Dining & Bali Chic',
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
  jimbaran: {
    slug: 'jimbaran', name: 'Jimbaran', tagline: 'Fresh Catch & Firelit Tables',
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
  sidemen: {
    slug: 'sidemen', name: 'Sidemen & East Bali', tagline: 'The Bali Fewer People Find',
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
  kuta: {
    slug: 'kuta', name: 'Kuta', tagline: 'Where Surf Culture Was Born',
    description: 'Kuta is where most visitors first land in Bali — and its long surf beach, energetic streets, and legendary sunsets make it impossible to overlook. The original surf town still has magic beneath the noise.',
    longDescription: 'Kuta\'s story is Bali\'s modern story: a quiet fishing village discovered by surfers in the 1960s, transformed into the island\'s first tourist hub, and now a dense, energetic strip of beach clubs, surf schools, and hawker streets running along a remarkable stretch of coastline. The beach itself — three kilometres of pale sand facing the full force of the Indian Ocean — is still one of the great beaches of Asia. The waves here are what built the town\'s reputation, and they remain consistent, powerful, and accessible enough to have taught a generation of beginners to stand up. Kuta is the most polarising part of Bali: loved for its energy and accessibility, avoided by those seeking quiet. Both responses are fair. The town works best understood on its own terms — as a place that does beach, surf, food, and nightlife with more commitment than anywhere else on the island.',
    highlights: ['Kuta Beach', 'Sunset at Poppies Lane', 'Beginner Surf Breaks', 'Kuta Art Market', 'Discovery Mall'],
    rating: 4.65,
    image: 'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=800&auto=format&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=1600&auto=format&fit=crop&q=80',
    color: '#1A6B8A', bg: '#EFF8FC',
    mustSee: [
      { name: 'Kuta Beach at Sunset', description: 'The three-kilometre beach faces due west — the sunsets here are the most accessible on the island, watched by hundreds of people each evening from the sand.' },
      { name: 'A First Surf Lesson', description: 'Kuta\'s waves are the ideal learning ground: consistent, forgiving at the shore break, and with dozens of patient instructors who have been teaching here for decades.' },
      { name: 'Poppies Lane', description: 'The two narrow laneways behind the beach are lined with family warungs, independent boutiques, and the kind of cheap, excellent food that made Kuta famous before the beach clubs arrived.' },
    ],
    practicalTips: [
      'The beach is patrolled by lifeguards — swim between the flags, especially in the wet season when currents are strong.',
      'Touts on the main street are persistent but harmless. A polite "no thank you" and steady walking pace is the right response.',
      'Kuta is the most affordable area in South Bali. Use it as a base for day trips to Uluwatu, Seminyak, and Nusa Dua.',
      'Traffic on Jalan Legian is genuinely gridlocked from 5pm to 8pm. Walk the beach road instead.',
    ],
    experienceAreas: ['Kuta'],
  },
  gianyar: {
    slug: 'gianyar', name: 'Gianyar', tagline: 'Sacred Water & Living Temples',
    description: 'Gianyar regency is the spiritual and artistic heartland of Bali — home to sacred water temples, master weavers, wood carvers, and the famous purification ritual at Pura Tirta Empul. The real Bali lives here.',
    longDescription: 'Gianyar is the regency that wraps around Ubud and contains some of the most significant sacred sites on the island. The water temple at Tirta Empul — where Balinese Hindus have bathed in spring-fed pools for spiritual purification for over a thousand years — is here. So are the workshops of Batuan village, where painters still work in the traditional Batuan style, filling every inch of canvas with mythological narratives. The Goa Gajah elephant cave, carved in the eleventh century, is a short walk from the main road. Celuk village is Bali\'s silversmith centre, where family workshops turn out intricate filigree and repousse work from studios that have operated for generations. Visiting Gianyar means moving between these layers — sacred and craft, ancient and living — in a way that is almost impossible to do in Ubud itself.',
    highlights: ['Pura Tirta Empul', 'Batuan Painting Village', 'Celuk Silver Workshops', 'Goa Gajah Elephant Cave', 'Blahbatuh Temple'],
    rating: 4.80,
    image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&auto=format&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1600&auto=format&fit=crop&q=80',
    color: '#4A7C59', bg: '#F0F7F2',
    mustSee: [
      { name: 'Pura Tirta Empul', description: 'A living purification temple fed by a natural spring. Balinese Hindus queue to move through a series of stone spouts in a mebok or spiritual bathing ritual. One of the most authentic sacred experiences available to visitors in Bali.' },
      { name: 'Goa Gajah', description: 'An eleventh-century rock-carved cave sanctuary whose entrance is shaped like a demonic face. The bathing pools outside are older than the cave and still used for ritual.' },
      { name: 'Celuk Silver Village', description: 'A village of family silversmith workshops on the road between Ubud and Denpasar. The best workshops will show you the process — from melting the alloy to finishing the piece.' },
    ],
    practicalTips: [
      'Dress modestly for temple visits — a sarong and sash are required and available at entrance gates.',
      'Visit Tirta Empul in the early morning (before 8am) to see the purification ritual with fewer tourists.',
      'Batuan village painters are happy to talk about their work. A purchase, however small, is the appropriate response to a studio visit.',
      'Gianyar\'s night market (pasar senggol) on the main square opens at 5pm — excellent babi guling and other Balinese staples.',
    ],
    experienceAreas: ['Gianyar'],
  },
  sanur: {
    slug: 'sanur', name: 'Sanur', tagline: 'Calm Shores & Sunrise Walks',
    description: 'Sanur is Bali\'s original resort town — calm, tree-lined, and facing east for spectacular sunrises over the water. Its protected reef keeps the sea flat for swimming, and its 5km beach walk is the finest in South Bali.',
    longDescription: 'Sanur is the oldest tourist destination in Bali, developed in the 1960s by the Belgian painter Le Mayeur and the international circle of artists and thinkers who followed. It was Bali\'s first resort town, and it has kept something of that earlier era: wide, tree-canopied streets, low-rise hotels set in garden compounds, a beach promenade that is genuinely pleasant to walk at any hour. The beach faces east — which means sunrises, not sunsets — and the offshore reef keeps the water calm year-round, making it the best swimming beach in South Bali. Sanur is the departure point for fast boats to Nusa Penida, Nusa Lembongan, and the Gilis. It is also the least-changed part of South Bali: unhurried, predominantly Indonesian in its residential areas, and considerably quieter than Seminyak or Canggu.',
    highlights: ['Sanur Beach Promenade', 'Sunrise on the Beach', 'Museum Le Mayeur', 'Bali Kite Festival', 'Fast Boat to Nusa Islands'],
    rating: 4.72,
    image: 'https://images.unsplash.com/photo-1544550285-f813152fb2fd?w=800&auto=format&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1544550285-f813152fb2fd?w=1600&auto=format&fit=crop&q=80',
    color: '#1A6B8A', bg: '#EFF8FC',
    mustSee: [
      { name: 'The Beach Promenade at Sunrise', description: 'A five-kilometre paved path runs the full length of Sanur\'s beach. At sunrise it is walked by local families, elderly Balinese doing their morning exercise, and fishermen heading to their boats.' },
      { name: 'Museum Le Mayeur', description: 'The home-studio of Belgian painter Adrien-Jean Le Mayeur, who lived in Sanur from 1932 until his death. The building is a masterwork of Balinese craft; the paintings document a Bali that no longer exists.' },
      { name: 'Nusa Penida Day Trip', description: 'Fast boats leave from Sanur\'s beach from 7am. The crossing takes forty minutes. Kelingking Beach — an improbable turquoise cove below a dinosaur-shaped headland — is one of the most photographed places in Indonesia.' },
    ],
    practicalTips: [
      'Book fast boats to the Nusa islands online in advance during peak season (July–August, December–January). Same-day walk-up tickets are often available but prices vary.',
      'The promenade is best walked or cycled — bicycles are available for hire from most hotels and along the beach road.',
      'Sanur\'s restaurant scene is concentrated around Jalan Danau Tamblingan. It is genuinely good and considerably cheaper than Seminyak.',
      'The kite festival in July/August is one of Bali\'s great annual spectacles — enormous traditional kites flown over the beach by village teams.',
    ],
    experienceAreas: ['Sanur'],
  },
  'nusa-dua': {
    slug: 'nusa-dua', name: 'Nusa Dua', tagline: 'Luxury Coast & Calm Waters',
    description: 'Nusa Dua is Bali\'s purpose-built luxury enclave — a gated peninsula of world-class resorts, white-sand beaches, and calm turquoise water protected by an offshore reef. Quiet, polished, and utterly relaxing.',
    longDescription: 'Nusa Dua was developed in the 1970s as a planned resort zone designed to contain international tourism in one area while protecting the rest of the island from its impacts. Whether that project succeeded is debatable, but what it created is a genuinely pleasant place: a quiet peninsula of spacious resort grounds, excellent beaches, and calm, swimmable water behind the barrier reef. The beaches at Nusa Dua are among the finest in Bali — white sand, gentle waves, and water so clear that the reef is visible from the shore. The BNDCC convention centre hosts international conferences, and several of the major resorts — the St. Regis, the Mulia, the Conrad — are among the best hotels in Asia. Nusa Dua is not the place for cultural immersion, but as a base for a relaxed, beach-focused holiday it is unmatched.',
    highlights: ['Nusa Dua Beach', 'Water Blow Blowhole', 'BNDCC Cultural Square', 'Snorkelling the Reef', 'Sunset at Tanjung Benoa'],
    rating: 4.68,
    image: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&auto=format&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1600&auto=format&fit=crop&q=80',
    color: '#1A6B8A', bg: '#EFF8FC',
    mustSee: [
      { name: 'The Beach at Nusa Dua', description: 'Two kilometres of white sand protected from ocean swell by a barrier reef — the calmest, clearest water in South Bali. The beach is maintained to a standard unusual in Indonesia.' },
      { name: 'Water Blow', description: 'A natural blowhole at the southern tip of the peninsula where ocean swells are compressed into a narrow rock channel and forced upward in a dramatic spray. Best visited at high tide.' },
      { name: 'Tanjung Benoa Reef', description: 'The peninsula north of Nusa Dua has calm, shallow water directly over a coral reef. Several operators offer glass-bottom boat tours and snorkelling trips from the beach.' },
    ],
    practicalTips: [
      'The resort zone is gated and spread over a large area — taxis and rideshares are the practical transport within it.',
      'Tanjung Benoa\'s watersports operators are competitive and numerous. Compare prices before booking; the standard activities are jet ski, parasailing, and banana boat.',
      'The beach is technically public access, but some stretches in front of major resorts are managed by those resorts. Walk north toward Tanjung Benoa for the least commercial stretch.',
      'Nusa Dua has the most reliable surf forecast in South Bali for beginners — the reef keeps conditions consistent when other beaches are blown out.',
    ],
    experienceAreas: ['Nusa Dua'],
  },
  amed: {
    slug: 'amed', name: 'Amed', tagline: 'Black Sand, Coral & Deep Quiet',
    description: 'Amed is a string of fishing villages on Bali\'s far east coast — volcanic black sand, excellent snorkelling directly off the beach, WWII shipwrecks for divers, and the kind of silence that only exists far from the tourist trail.',
    longDescription: 'Amed is the name loosely given to a fifteen-kilometre stretch of coast on Bali\'s northeastern shore, running from the village of Amed itself through Jemeluk, Bunutan, Lipah, Selang, and Aas. Each village has its own small beach, its own cluster of simple guesthouses and restaurants, and its own section of the coral reef that runs continuously along this coast. The snorkelling at Amed is among the best in Bali — in particular the Japanese shipwreck at Jemeluk Bay, sunk during the Second World War and now lying in shallow enough water to be reached by snorkel. Mount Agung is visible from almost every point on this coast, rising above the palm groves and fishing boats with the authority of the most sacred mountain in Bali. Amed is a long drive from the airport — two and a half to three hours — and that distance has kept it authentically itself in a way that most of Bali\'s coastal areas have not managed.',
    highlights: ['Jemeluk Bay Snorkelling', 'Japanese WWII Shipwreck', 'Mount Agung Views', 'Traditional Jukung Fishing Boats', 'Sunrise on Black Sand'],
    rating: 4.83,
    image: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=800&auto=format&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=1600&auto=format&fit=crop&q=80',
    color: '#B66A45', bg: '#FDF8F4',
    mustSee: [
      { name: 'Jemeluk Bay Reef', description: 'A coral garden in 3–8 metres of water, directly accessible from the black sand beach. The reef recovered strongly after the 2016 bleaching event and now has excellent fish diversity.' },
      { name: 'Japanese Shipwreck', description: 'A WWII-era patrol boat lying at 25–29 metres off Jemeluk. Accessible to recreational divers; the shallow sections can be reached by freediver. Coral-encrusted and spectacularly photogenic.' },
      { name: 'Dawn on the Beach', description: 'Amed\'s east-facing coast catches the first light in Bali. The fishing boats go out before 5am — walking the beach at sunrise, with Agung turning pink behind the palm trees, is the defining Amed experience.' },
    ],
    practicalTips: [
      'Stay at least two nights — the drive from South Bali is long and the coast rewards time spent slowly.',
      'The road along the Amed coast is narrow and winding — scooters are preferable to cars for moving between villages.',
      'Book dive trips directly with the small local operators in Jemeluk village; they are often cheaper and more personalised than operators based in South Bali.',
      'Bring cash. ATMs exist in Amed village but often run out of notes during peak season.',
    ],
    experienceAreas: ['Amed'],
  },
  medewi: {
    slug: 'medewi', name: 'Medewi', tagline: 'West Bali\'s Long Left Wave',
    description: 'Medewi is one of Bali\'s best-kept secrets — a quiet black-sand beach on the west coast known for its exceptionally long, slow left-hand surf break and the vast rice paddies that stretch back from the shore.',
    longDescription: 'Medewi sits on Bali\'s west coast, about ninety minutes from Seminyak on the road toward Java. The town is barely a town — a cluster of family warung, a few simple losmen, and a beach road that ends at the shore. What brings surfers here is the wave: a long, slow left-hander that peels along a rocky point for up to 200 metres on a good swell. It is one of the most forgiving long waves in Bali, and it breaks consistently through the wet and dry seasons. Behind the beach, the landscape opens into the wide rice paddies of west Bali — a flatter, quieter version of the terraces that draw visitors to Ubud. The Pura Rambut Siwi temple complex, set on a clifftop above the sea a few kilometres west of town, is one of the most atmospheric sea temples in Bali.',
    highlights: ['Medewi Point Surf Break', 'Pura Rambut Siwi', 'West Bali Rice Paddies', 'Quiet Black Sand Beach', 'Sunset from the Point'],
    rating: 4.70,
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&auto=format&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&auto=format&fit=crop&q=80',
    color: '#4A7C59', bg: '#F0F7F2',
    mustSee: [
      { name: 'The Medewi Wave', description: 'A long, peeling left-hander over a rock shelf — one of the longest rideable waves in Bali, best for intermediate surfers who want to work on their turns over a sustained ride.' },
      { name: 'Pura Rambut Siwi', description: 'A sea temple complex on a black-sand cliff, attributed to the Hindu priest Nirartha who is credited with bringing Hinduism to Bali. The site has three separate temple compounds and extraordinary ocean views.' },
      { name: 'West Bali Rice Paddies', description: 'The landscape around Medewi is flatter and less visited than Ubud\'s terraces — wide paddies, duck herders, and egrets. Explore by scooter or bicycle on the back roads.' },
    ],
    practicalTips: [
      'The wave at Medewi is best from April to September, when south swells hit the west coast. Check surf forecasts before making the trip.',
      'Accommodation is limited — book in advance during peak surf season. Most places are family-run and excellent value.',
      'The road west from Seminyak is long but scenic. Break the drive at Tanah Lot, which is roughly halfway.',
      'There is almost nothing to do in Medewi beyond surfing, eating warung food, and watching the sunset. That is the point.',
    ],
    experienceAreas: ['Medewi'],
  },
  kintamani: {
    slug: 'kintamani', name: 'Kintamani', tagline: 'Above the Clouds, Below the Volcano',
    description: 'Kintamani sits on the rim of an ancient volcanic caldera, with Lake Batur shimmering far below and the dark cone of Gunung Batur rising above the water. At 1,500 metres, the air is cool, the views are extraordinary, and the silence is complete.',
    longDescription: 'Kintamani is Bali\'s highland, a world away from the beach resorts of the south — cooler, quieter, and dominated by one of the most dramatic landscapes in Indonesia. The caldera rim road at Penelokan offers a view that stops conversation: Lake Batur, six kilometres wide, lying in the floor of an ancient collapsed volcano, with the active Gunung Batur cone rising from the lake\'s edge and the older, more massive Gunung Abang forming the opposite wall. The Batur volcano has erupted over twenty times in the past two hundred years — most recently in 2000 — and its presence is both beautiful and visceral. Villages on the caldera rim have a different culture from the south: the Bali Aga people, Bali\'s original inhabitants who predate the arrival of Majapahit Hinduism, have communities here that maintain ancient practices including the famous funeral rites at Trunyan village on the lake shore.',
    highlights: ['Gunung Batur Sunrise Trek', 'Lake Batur', 'Caldera Rim Viewpoint', 'Trunyan Bali Aga Village', 'Kintamani Coffee Plantations'],
    rating: 4.88,
    image: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=800&auto=format&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=1600&auto=format&fit=crop&q=80',
    color: '#6F675C', bg: '#F5F1EB',
    mustSee: [
      { name: 'Gunung Batur Sunrise Trek', description: 'A two-hour climb to the 1,717-metre summit, starting at 4am. The sunrise from the caldera rim — with the lake below, Agung behind, and Lombok visible on clear mornings — is one of the great dawn experiences in Southeast Asia.' },
      { name: 'Lake Batur by Boat', description: 'The caldera lake is best understood from its surface. Boat trips to the natural hot springs on the lake shore, and to Trunyan village where the Bali Aga practise open-air burial in a sacred banyan grove, take two to three hours.' },
      { name: 'Kintamani Coffee Plantations', description: 'Kintamani\'s volcanic soil produces Arabica coffee with a bright, citrusy profile. Several plantations on the road between Ubud and the caldera offer tours and tastings — including the famous luwak (civet) coffee.' },
    ],
    practicalTips: [
      'Book the Batur sunrise trek through a licensed guide via the local guide association. Solo trekking on the volcano is not recommended.',
      'Bring a jacket — temperatures at the summit can drop to 10°C before dawn even in the dry season.',
      'The caldera rim road is frequently foggy from midday to evening. Morning visits have the clearest views.',
      'Luwak coffee tastings are widely available but vary in authenticity. Ask whether the civets are wild or caged; the ethical difference is significant.',
    ],
    experienceAreas: ['Kintamani'],
  },
}

export const revalidate = 3600

export function generateStaticParams() {
  return [
    'ubud', 'canggu', 'uluwatu', 'seminyak', 'jimbaran',
    'sidemen', 'kuta', 'gianyar', 'sanur', 'nusa-dua',
    'amed', 'medewi', 'kintamani',
  ].map(area => ({ area }))
}

export async function generateMetadata({ params }: { params: { area: string } }) {
  const { area } = params
  const data = AREAS[area]
  if (!data) return {}
  return {
    title: `${data.name} — Balible Destinations`,
    description: data.description,
  }
}

export default async function DestinationAreaPage({ params }: { params: { area: string } }) {
  const { area } = params
  const data = AREAS[area]
  if (!data) notFound()

  const dbCards = await getExperienceCards()
  const experiences: Experience[] = dbCards
    .filter(c => data.experienceAreas.includes(c.area))
    .map(c => ({
      slug: c.slug, title: c.title, area: c.area, rating: c.rating,
      reviews: c.reviews, price: c.price, durationMins: c.durationMins,
      category: c.category, photo: c.photo,
    }))

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: 'white', minHeight: '100vh' }}>
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
        <DestinationExperiences
          experiences={experiences}
          areaName={data.name}
          areaSlug={data.slug}
          color={data.color}
          bg={data.bg}
        />

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
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 20% 50%, ${data.color} 0%, transparent 50%), radial-gradient(circle at 80% 50%, #C8A97E 0%, transparent 50%)`, pointerEvents: 'none' }} />
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

      <Footer />
      <MobileNav />
    </div>
  )
}
