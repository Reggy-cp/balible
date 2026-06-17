import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Reuse existing Sanur operator
  const op = await prisma.operator.findFirst({
    where: { user: { email: 'kadek.artini@balible.com' } },
  })
  if (!op) throw new Error('Sanur operator not found — run seed-sanur.ts first')

  // ── WELLNESS_HEALING: Beach yoga ────────────────────────────────────────────────────
  await prisma.experience.create({ data: {
    slug: 'sanur-beach-yoga',
    operatorId: op.id,
    title: 'Sunrise Beach Yoga in Sanur',
    category: 'WELLNESS_HEALING',
    area: 'SANUR',
    price: 200000,
    duration: '1.5 hours',
    level: 'All levels',
    language: 'English',
    maxGuests: 10,
    rating: 4.9,
    totalReviews: 72,
    featured: true,
    instantConfirm: true,
    ecoLabel: true,
    status: 'ACTIVE',
    latitude: -8.7108,
    longitude: 115.2612,
    description: 'Begin your day with an open-air yoga session on the quietest stretch of Sanur Beach, just as the sun rises over the Lombok Strait. Kadek — a certified Hatha and Yin yoga teacher — leads a gentle 90-minute flow combining breathwork, sun salutations and a long restorative finish. Sanur\'s east-facing shore means you catch the full spectacle of the sunrise from your mat, with only the sound of the tide and birdsong around you.',
    highlights: [
      'Practise on the beach at sunrise — east-facing Sanur is one of the few Bali beaches where you see the sun rise over the water',
      'Suitable for all levels — modifications offered throughout',
      'Small group maximum 10 for a calm, unhurried session',
      'Closes with a 20-minute guided savasana and breathwork',
      'Fresh coconut and jamu served at the end on the beach',
    ],
    includes: [
      'Yoga mat and props',
      'Certified instructor Kadek',
      'Fresh coconut and jamu herbal drink',
      'Towel',
    ],
    excludes: [
      'Transport to Sanur Beach',
      'Gratuities',
    ],
    meetingPoint: 'Sanur Beach, in front of Puri Kelapa Garden Cottages, Jl. Segara Ayu (meet at 6:00am)',
    images: [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=400&h=300&auto=format&fit=crop&q=80',
    ],
  }})

  // ── CULINARY: Morning market & warung tour ────────────────────────────────
  await prisma.experience.create({ data: {
    slug: 'sanur-morning-market-food-tour',
    operatorId: op.id,
    title: 'Sanur Morning Market & Warung Food Tour',
    category: 'CULINARY',
    area: 'SANUR',
    price: 350000,
    duration: '3 hours',
    level: 'Easy',
    language: 'English',
    maxGuests: 8,
    rating: 4.8,
    totalReviews: 39,
    featured: false,
    instantConfirm: true,
    ecoLabel: false,
    status: 'ACTIVE',
    latitude: -8.7165,
    longitude: 115.2598,
    description: 'Follow Kadek through the pre-dawn chaos of Pasar Sindhu — Sanur\'s beloved neighbourhood wet market — before the tour groups arrive and the real Bali disappears. You\'ll shop for sate lilit, lawar, and a rainbow of tropical fruit alongside local mothers and temple cooks, then hop between three of Kadek\'s favourite hole-in-the-wall warungs for a breakfast that spans nasi campur, bubur injin black rice pudding, and freshly ground Bali coffee. This is the Sanur that exists before the beach umbrellas go up.',
    highlights: [
      'Pre-dawn visit to Pasar Sindhu before the tourist crowds arrive',
      'Taste at least 8 authentic Balinese dishes across three warungs',
      'Learn to identify key spices, leaves, and produce used in Balinese cooking',
      'Meet the market vendors and hear the stories behind their stalls',
      'Finish with Bali\'s best bubur injin (black rice pudding with palm sugar)',
    ],
    includes: [
      'All food and drink tastings',
      'Guide Kadek throughout',
      'Balinese coffee or tea',
      'Small bag of spices to take home',
    ],
    excludes: [
      'Transport to Pasar Sindhu market',
      'Gratuities',
    ],
    meetingPoint: 'Pasar Sindhu main entrance, Jl. Danau Tamblingan, Sanur (meet at 6:30am)',
    images: [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&auto=format&fit=crop&q=80',
    ],
  }})

  // ── CULTURE: Le Mayeur Museum + heritage walk ───────────────────────────────
  await prisma.experience.create({ data: {
    slug: 'sanur-heritage-walk-le-mayeur',
    operatorId: op.id,
    title: 'Sanur Heritage Walk & Le Mayeur Museum',
    category: 'CULTURE_SPIRITUAL',
    area: 'SANUR',
    price: 280000,
    duration: '2.5 hours',
    level: 'Easy',
    language: 'English',
    maxGuests: 8,
    rating: 4.7,
    totalReviews: 31,
    featured: false,
    instantConfirm: true,
    ecoLabel: false,
    status: 'ACTIVE',
    latitude: -8.7090,
    longitude: 115.2610,
    description: 'Sanur has a richer history than most visitors realise — it was the site of the Dutch colonial landing in 1906, the home of Belgium\'s most celebrated Impressionist painter, and a centre of Balinese scholarship that attracted anthropologists, artists, and writers throughout the 20th century. With Kadek as your guide, walk the heritage lane behind the promenade, visit the Le Mayeur Museum (the artist\'s home-studio, preserved exactly as he left it), see the historic inscribed pillar that predates the Dutch arrival by a thousand years, and hear the stories of the Balinese community that shaped this remarkable village.',
    highlights: [
      'Private guided tour of the Le Mayeur Museum — home of Belgian Impressionist painter Adrien-Jean Le Mayeur',
      'See the Blanjong Pillar: a 10th-century stone inscription, the oldest written record in Bali',
      'Walk the quiet heritage lanes away from the main beach strip',
      'Hear the story of the 1906 Dutch colonial landing and Sanur\'s resistance',
      'Visit a family-run shrine compound rarely seen by visitors',
    ],
    includes: [
      'Guided tour with Kadek',
      'Le Mayeur Museum entrance fee',
      'Iced coconut water mid-walk',
    ],
    excludes: [
      'Transport to Sanur',
      'Gratuities',
      'Personal travel insurance',
    ],
    meetingPoint: 'Le Mayeur Museum entrance, Jl. Hang Tuah, Sanur Beach (meet at 8:00am or 4:00pm)',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80',
    ],
  }})

  console.log('✅ 3 more Sanur experiences added:')
  console.log('   • sanur-beach-yoga (WELLNESS_HEALING)')
  console.log('   • sanur-morning-market-food-tour (CULINARY)')
  console.log('   • sanur-heritage-walk-le-mayeur (CULTURE)')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
