import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // ── Sanur Operator ──────────────────────────────────────────────────────────
  const uKadekSanur = await prisma.user.create({ data: {
    email: 'kadek.artini@balible.com', name: 'Kadek Artini',
    role: 'OPERATOR', image: 'https://i.pravatar.cc/150?u=kadek.artini',
  }})

  const opKadekArtini = await prisma.operator.create({ data: {
    userId: uKadekSanur.id, businessName: 'Sanur Sunrise Experiences',
    description: 'Born and raised in Sanur, Kadek has spent 15 years guiding visitors through her beloved village — from dawn beach walks to traditional painting studios. She believes Sanur\'s unhurried pace is Bali\'s best-kept secret.',
    verified: true, rating: 4.8, totalReviews: 134,
  }})

  // ── Sanur Experiences ───────────────────────────────────────────────────────
  const eSanurSunrise = await prisma.experience.create({ data: {
    slug: 'sanur-sunrise-beach-walk',
    operatorId: opKadekArtini.id,
    title: 'Sanur Sunrise Beach Walk',
    category: 'NATURE_OUTDOORS',
    area: 'SANUR',
    price: 250000,
    duration: '2 hours',
    level: 'Easy',
    language: 'English',
    maxGuests: 8,
    rating: 4.9,
    totalReviews: 61,
    featured: true,
    instantConfirm: true,
    ecoLabel: true,
    status: 'ACTIVE',
    latitude: -8.7134,
    longitude: 115.2626,
    description: 'Join Kadek for a peaceful dawn walk along Sanur\'s 5-kilometre beach promenade — one of the finest in Bali. As the sun rises over the Lombok Strait, fishermen launch their painted jukung boats and the beach slowly awakens. Kadek shares the stories behind the outriggers, the sacred sea temples, and the colonial history of this gentle village that has changed remarkably little since the 1930s.',
    highlights: [
      'Watch the sunrise from Sanur\'s east-facing beach — one of the few in Bali where you can see it rise over the water',
      'Observe fishermen launching traditional jukung outrigger boats at dawn',
      'Visit Pura Segara Sanur, the revered sea temple at the water\'s edge',
      'Learn about Le Mayeur, the Belgian artist who made Sanur his home in 1932',
      'End with fresh jamu spiced herbal drink and coconut at a beachside warung',
    ],
    includes: [
      'Local guide Kadek for 2 hours',
      'Jamu and fresh coconut at the end',
      'Hotel pick-up within Sanur area',
    ],
    excludes: [
      'Transport outside Sanur',
      'Gratuities',
      'Personal travel insurance',
    ],
    meetingPoint: 'Inna Grand Bali Beach hotel entrance, Jl. Hang Tuah, Sanur (meet at 5:45am)',
    images: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&auto=format&fit=crop&q=80',
    ],
  }})

  const eSanurPainting = await prisma.experience.create({ data: {
    slug: 'balinese-painting-class-sanur',
    operatorId: opKadekArtini.id,
    title: 'Traditional Balinese Painting Class',
    category: 'ART_CRAFT',
    area: 'SANUR',
    price: 380000,
    duration: '3 hours',
    level: 'Beginner',
    language: 'English',
    maxGuests: 6,
    rating: 4.8,
    totalReviews: 47,
    featured: false,
    instantConfirm: true,
    ecoLabel: false,
    status: 'ACTIVE',
    latitude: -8.7151,
    longitude: 115.2614,
    description: 'In a sunlit studio two streets back from the beach, Kadek teaches the distinctive Sanur style of Balinese painting — characterised by bold outlines, natural pigments, and mythological scenes from the Ramayana. Unlike the more commercial Ubud style, Sanur painting retains a raw, almost folk-art quality rooted in the village\'s fishing community. You will sketch, ink, and add colour to your own composition — suitable for all ability levels — and leave with a finished work on hand-pressed paper.',
    highlights: [
      'Learn the distinctive Sanur painting style rarely taught to visitors',
      'Work with traditional natural pigments ground from stone and plant sources',
      'Complete a full A3 painting to take home',
      'Small class maximum 6 — personalised instruction throughout',
      'Studio is a restored 1960s Balinese family compound',
    ],
    includes: [
      'All materials: paper, brushes, inks, natural pigments',
      'Step-by-step instruction from Kadek',
      'Your finished painting, matted and wrapped to carry home',
      'Balinese tea and snacks',
    ],
    excludes: [
      'Transport to the studio',
      'Framing',
      'Gratuities',
    ],
    meetingPoint: 'Artini Studio, Jl. Danau Tamblingan 52, Sanur (look for the blue gate)',
    images: [
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&auto=format&fit=crop&q=80',
    ],
  }})

  const eSanurSnorkel = await prisma.experience.create({ data: {
    slug: 'sanur-glass-boat-snorkel',
    operatorId: opKadekArtini.id,
    title: 'Glass-Bottom Boat & Snorkel at Sanur Reef',
    category: 'WATER_ACTIVITIES',
    area: 'SANUR',
    price: 320000,
    duration: '2.5 hours',
    level: 'All levels',
    language: 'English',
    maxGuests: 10,
    rating: 4.7,
    totalReviews: 88,
    featured: false,
    instantConfirm: true,
    ecoLabel: true,
    status: 'ACTIVE',
    latitude: -8.7120,
    longitude: 115.2680,
    description: 'Sanur\'s sheltered lagoon sits behind a coral reef that protects the bay and creates some of the calmest snorkelling water in South Bali — ideal for children and anyone nervous around waves. From a traditional glass-bottom jukung, observe the reef garden below before slipping in to swim alongside parrotfish, angelfish, and occasional sea turtles. Guide Wayan has been working these waters since childhood and knows every coral head and cleaning station on the reef.',
    highlights: [
      'Calm, protected lagoon water — suitable for non-swimmers with a life vest',
      'Glass bottom of the boat lets you see the reef before you enter the water',
      'Healthy coral garden with parrotfish, angelfish, moorish idols and more',
      'High chance of sea turtle sightings at the eastern cleaning station',
      'Departs from Sanur Beach — no long boat ride needed',
    ],
    includes: [
      'Traditional jukung glass-bottom boat',
      'Full snorkel set (mask, fins, vest)',
      'Certified guide Wayan',
      'Underwater photos shared via WhatsApp',
      'Fresh coconut on return',
    ],
    excludes: [
      'Transport to Sanur Beach',
      'Wetsuit (available to borrow)',
      'Gratuities',
    ],
    meetingPoint: 'Sanur Beach boat launch, in front of Puri Santrian hotel, Jl. Cemara, Sanur (meet at 8:00am or 2:00pm)',
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=400&h=300&auto=format&fit=crop&q=80',
    ],
  }})

  // ── Sanur Event ─────────────────────────────────────────────────────────────
  await prisma.event.create({ data: {
    slug: 'sanur-village-festival-2026',
    operatorId: opKadekArtini.id,
    title: 'Sanur Village Festival 2026',
    description: 'The Sanur Village Festival is Bali\'s most beloved annual celebration of art, culture, and community — held each year along the Sanur beachfront promenade. Four evenings of traditional Kecak and Legong dance performances, open-air food stalls showcasing the best of Balinese and Indonesian cuisine, kite demonstrations over the beach, local artisan markets, and a finale Ogoh-Ogoh lantern procession at sunset. The festival brings together local artists, fishermen, and international visitors in the spirit that makes Sanur unique.',
    date: new Date('2026-08-13T17:00:00+08:00'),
    location: 'Sanur Beach Promenade, Jl. Hang Tuah, Sanur, Denpasar Selatan',
    price: 0,
    capacity: 2000,
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=85',
    status: 'PUBLISHED',
  }})

  console.log('✅ Sanur data seeded:')
  console.log('   • 1 operator (Kadek Artini / Sanur Sunrise Experiences)')
  console.log('   • 3 experiences (sunrise walk, painting class, snorkel)')
  console.log('   • 1 event (Sanur Village Festival 2026)')
  console.log('   Experiences:', eSanurSunrise.slug, '|', eSanurPainting.slug, '|', eSanurSnorkel.slug)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
