import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SEEDED_OP_EMAILS = [
  'made.sari@balible.com', 'ketut.suardana@balible.com', 'wayan.gede@balible.com',
  'nina.putri@balible.com', 'komang.dewi@balible.com', 'ni.wayan.artini@balible.com',
  'putu.sari@balible.com', 'komang.surya@balible.com', 'gede.arnawa@balible.com',
  'i.nyoman.arta@balible.com', 'i.nyoman.karsa@balible.com', 'ni.made.suari@balible.com',
  'ni.komang.ayu@balible.com', 'made.widia@balible.com', 'ketut.wirawan@balible.com',
]
const SEEDED_TOURIST_EMAILS = [
  'sarah.k@example.com', 'thomas.r@example.com', 'priya.m@example.com',
  'lucas.b@example.com', 'yuki.t@example.com', 'anna.g@example.com',
  'felix.w@example.com', 'rachel.t@example.com', 'giulia.r@example.com',
  'ben.r@example.com',
]

async function main() {
  console.log('🌱 Seeding Balible database...')

  // ── Safe clean-up: never deletes real Clerk users ─────────────────────────
  const seededOpUsers = await prisma.user.findMany({
    where: { email: { in: SEEDED_OP_EMAILS } }, select: { id: true },
  })
  if (seededOpUsers.length > 0) {
    const opUserIds = seededOpUsers.map(u => u.id)
    const ops = await prisma.operator.findMany({ where: { userId: { in: opUserIds } }, select: { id: true } })
    if (ops.length > 0) {
      const opIds = ops.map(o => o.id)
      const exps = await prisma.experience.findMany({ where: { operatorId: { in: opIds } }, select: { id: true } })
      if (exps.length > 0) {
        const expIds = exps.map(e => e.id)
        await prisma.review.deleteMany({ where: { experienceId: { in: expIds } } })
        await prisma.booking.deleteMany({ where: { experienceId: { in: expIds } } })
        await prisma.wishlistItem.deleteMany({ where: { experienceId: { in: expIds } } })
        await prisma.experience.deleteMany({ where: { id: { in: expIds } } })
      }
      await prisma.operator.deleteMany({ where: { id: { in: opIds } } })
    }
  }
  await prisma.user.deleteMany({ where: { email: { in: [...SEEDED_OP_EMAILS, ...SEEDED_TOURIST_EMAILS] } } })

  // ── Operator users ─────────────────────────────────────────────────────────
  const uMadeSari      = await prisma.user.create({ data: { name: 'Made Sari',       email: 'made.sari@balible.com',       role: 'OPERATOR', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80' } })
  const uKetutSuardana = await prisma.user.create({ data: { name: 'Ketut Suardana',  email: 'ketut.suardana@balible.com',  role: 'OPERATOR', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&auto=format&fit=crop&q=80' } })
  const uWayanGede     = await prisma.user.create({ data: { name: 'Wayan Gede',      email: 'wayan.gede@balible.com',      role: 'OPERATOR', image: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=200&auto=format&fit=crop&q=80' } })
  const uNinaPutri     = await prisma.user.create({ data: { name: 'Nina Putri',      email: 'nina.putri@balible.com',      role: 'OPERATOR', image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=200&auto=format&fit=crop&q=80' } })
  const uKomangDewi    = await prisma.user.create({ data: { name: 'Komang Dewi',     email: 'komang.dewi@balible.com',     role: 'OPERATOR', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80' } })
  const uNiWayanArtini = await prisma.user.create({ data: { name: 'Ni Wayan Artini', email: 'ni.wayan.artini@balible.com', role: 'OPERATOR', image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=200&auto=format&fit=crop&q=80' } })
  const uPutuSari      = await prisma.user.create({ data: { name: 'Putu Sari',       email: 'putu.sari@balible.com',       role: 'OPERATOR', image: null } })
  const uKomangSurya   = await prisma.user.create({ data: { name: 'Komang Surya',    email: 'komang.surya@balible.com',    role: 'OPERATOR', image: null } })
  const uGedeArnawa    = await prisma.user.create({ data: { name: 'Gede Arnawa',     email: 'gede.arnawa@balible.com',     role: 'OPERATOR', image: null } })
  const uINyomanArta   = await prisma.user.create({ data: { name: 'I Nyoman Arta',   email: 'i.nyoman.arta@balible.com',   role: 'OPERATOR', image: null } })
  const uINyomanKarsa  = await prisma.user.create({ data: { name: 'I Nyoman Karsa',  email: 'i.nyoman.karsa@balible.com',  role: 'OPERATOR', image: null } })
  const uNiMadeSuari   = await prisma.user.create({ data: { name: 'Ni Made Suari',   email: 'ni.made.suari@balible.com',   role: 'OPERATOR', image: null } })
  const uNiKomangAyu   = await prisma.user.create({ data: { name: 'Ni Komang Ayu',   email: 'ni.komang.ayu@balible.com',   role: 'OPERATOR', image: null } })
  const uMadeWidia     = await prisma.user.create({ data: { name: 'Made Widia',      email: 'made.widia@balible.com',      role: 'OPERATOR', image: null } })
  const uKetutWirawan  = await prisma.user.create({ data: { name: 'Ketut Wirawan',   email: 'ketut.wirawan@balible.com',   role: 'OPERATOR', image: null } })

  // ── Operators ──────────────────────────────────────────────────────────────
  const opMadeSari      = await prisma.operator.create({ data: { userId: uMadeSari.id,      businessName: 'Made Sari Pottery Studio',  description: 'Third-generation Balinese potter offering authentic clay experiences in the heart of Ubud.',                                                                             avatar: uMadeSari.image,      verified: true, rating: 4.9, totalReviews: 128 } })
  const opKetutSuardana = await prisma.operator.create({ data: { userId: uKetutSuardana.id, businessName: 'Ketut Silver Artistry',      description: 'Second-generation Balinese silversmith blending traditional craftsmanship with contemporary design in his Canggu studio.',                                          avatar: uKetutSuardana.image, verified: true, rating: 4.8, totalReviews: 94  } })
  const opWayanGede     = await prisma.operator.create({ data: { userId: uWayanGede.id,     businessName: 'Sacred Bali Ceremonies',     description: 'Led by Wayan Gede, a third-generation temple guide and priest offering authentic spiritual experiences at Bali\'s most sacred sites.',                            avatar: uWayanGede.image,     verified: true, rating: 4.8, totalReviews: 250 } })
  const opNinaPutri     = await prisma.operator.create({ data: { userId: uNinaPutri.id,     businessName: 'Sukha Healing Space',        description: 'A sanctuary of stillness in the heart of Ubud offering sound healing, breathwork and somatic therapies with Bali\'s most experienced practitioners.',           avatar: uNinaPutri.image,     verified: true, rating: 4.9, totalReviews: 463 } })
  const opKomangDewi    = await prisma.operator.create({ data: { userId: uKomangDewi.id,    businessName: 'Jiwa Yoga',                  description: 'Beloved yoga studios in Canggu and Ubud offering sunrise classes, breathwork sessions and sound healing for the wandering soul.',                              avatar: uKomangDewi.image,    verified: true, rating: 4.9, totalReviews: 359 } })
  const opNiWayanArtini = await prisma.operator.create({ data: { userId: uNiWayanArtini.id, businessName: 'Ubud Batik Studio',          description: 'A family-run batik studio in Ubud sharing the art of traditional Indonesian textile art with visitors from around the world.',                                   avatar: uNiWayanArtini.image, verified: true, rating: 4.7, totalReviews: 148 } })
  const opPutuSari      = await prisma.operator.create({ data: { userId: uPutuSari.id,      businessName: 'Warung Dapur Bali',          description: 'Family-run Balinese cooking school in Seminyak teaching the art of traditional island cuisine to food-loving travellers.',                                       avatar: null,                 verified: true, rating: 4.8, totalReviews: 253 } })
  const opKomangSurya   = await prisma.operator.create({ data: { userId: uKomangSurya.id,   businessName: 'Bali Surf & Water',          description: 'Certified surf and water sports instructors on Kuta, Canggu and Seminyak beaches — the most-reviewed beginner surf school in Bali.',                         avatar: null,                 verified: true, rating: 4.7, totalReviews: 656 } })
  const opGedeArnawa    = await prisma.operator.create({ data: { userId: uGedeArnawa.id,    businessName: 'Bali Adventure Guides',      description: 'Local guides and farmer-hosts covering Bali\'s mountains, rice terraces, reefs and waterfalls — from Mount Batur treks to Amed snorkelling.',                 avatar: null,                 verified: true, rating: 4.8, totalReviews: 572 } })
  const opINyomanArta   = await prisma.operator.create({ data: { userId: uINyomanArta.id,   businessName: 'Bali Culture Tours',         description: 'Specialist cultural experiences across Bali — temple tours, dance performances, and ceremony visits led by local guides with deep knowledge of Balinese tradition.', avatar: null,                 verified: true, rating: 4.8, totalReviews: 733 } })
  const opINyomanKarsa  = await prisma.operator.create({ data: { userId: uINyomanKarsa.id,  businessName: 'Karsa Wood Studio',          description: 'Third-generation wood carving family in Mas Village, Ubud, teaching traditional Balinese carving to visitors in their family studio.',                            avatar: null,                 verified: true, rating: 4.6, totalReviews: 47  } })
  const opNiMadeSuari   = await prisma.operator.create({ data: { userId: uNiMadeSuari.id,   businessName: 'Sidemen Weave & Dye',        description: 'A family compound in Sidemen preserving the ancient art of natural dyeing and traditional weaving, welcoming visitors to learn and participate.',                avatar: null,                 verified: true, rating: 4.7, totalReviews: 31  } })
  const opNiKomangAyu   = await prisma.operator.create({ data: { userId: uNiKomangAyu.id,   businessName: 'Sidemen Village Crafts',     description: "A women's weaving collective in Sidemen, East Bali, preserving traditional rattan craft and welcoming visitors to learn and support their community.",        avatar: null,                 verified: true, rating: 4.8, totalReviews: 29  } })
  const opMadeWidia     = await prisma.operator.create({ data: { userId: uMadeWidia.id,     businessName: 'Jimbaran Bay Seafood',       description: 'Beachfront dining on Jimbaran Bay, bringing the freshest local catch to your table as the sun sets over the Indian Ocean.',                                      avatar: null,                 verified: true, rating: 4.6, totalReviews: 89  } })
  const opKetutWirawan  = await prisma.operator.create({ data: { userId: uKetutWirawan.id,  businessName: 'Batur Arabica Estate',       description: "A family-run plantation on Mount Batur's volcanic slopes, producing specialty Arabica coffee at 1,200m altitude.",                                              avatar: null,                 verified: true, rating: 4.8, totalReviews: 143 } })

  // ── Tourist users ──────────────────────────────────────────────────────────
  const tSarah  = await prisma.user.create({ data: { name: 'Sarah K.',  email: 'sarah.k@example.com'  } })
  const tThomas = await prisma.user.create({ data: { name: 'Thomas R.', email: 'thomas.r@example.com' } })
  const tPriya  = await prisma.user.create({ data: { name: 'Priya M.',  email: 'priya.m@example.com'  } })
  const tLucas  = await prisma.user.create({ data: { name: 'Lucas B.',  email: 'lucas.b@example.com'  } })
  const tYuki   = await prisma.user.create({ data: { name: 'Yuki T.',   email: 'yuki.t@example.com'   } })
  const tAnna   = await prisma.user.create({ data: { name: 'Anna G.',   email: 'anna.g@example.com'   } })
  const tFelix  = await prisma.user.create({ data: { name: 'Felix W.',  email: 'felix.w@example.com'  } })
  const tRachel = await prisma.user.create({ data: { name: 'Rachel T.', email: 'rachel.t@example.com' } })
  const tGiulia = await prisma.user.create({ data: { name: 'Giulia R.', email: 'giulia.r@example.com' } })
  const tBen    = await prisma.user.create({ data: { name: 'Ben R.',    email: 'ben.r@example.com'    } })

  // ── Experiences ────────────────────────────────────────────────────────────

  const ePottery = await prisma.experience.create({ data: {
    slug: 'pottery-making-class', operatorId: opMadeSari.id,
    title: 'Pottery Making Class', category: 'ART_CRAFT', area: 'UBUD',
    price: 450000, duration: '2.5 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.9, totalReviews: 128, featured: true, instantConfirm: true, ecoLabel: true, status: 'ACTIVE',
    latitude: -8.4095, longitude: 115.2819,
    description: "Step into a world of clay and creativity in the heart of Ubud. Guided by Made Sari — a third-generation Balinese potter — you'll learn the ancient art of hand-building and wheel throwing in a lush rice terrace compound.",
    highlights: ['Hand-build with third-generation Balinese potter Made Sari', 'Learn traditional and modern wheel-throwing techniques', 'Create your own vessel to take home', 'Set in a lush rice terrace compound in the heart of Ubud', 'All materials and tools provided — no experience needed'],
    includes: ['All clay and materials', "Use of potter's wheel and tools", 'Glazing materials', 'Finished piece to take home', 'Welcome drink'],
    excludes: ['Transport to studio', 'Gratuities', 'Additional clay purchases'],
    meetingPoint: 'Made Sari Pottery Studio, Jl. Raya Tegallalang, Ubud',
    images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eSilver = await prisma.experience.create({ data: {
    slug: 'silver-jewelry-workshop', operatorId: opKetutSuardana.id,
    title: 'Silver Jewelry Workshop', category: 'ART_CRAFT', area: 'CANGGU',
    price: 550000, duration: '3 hours', level: 'All levels', language: 'English', maxGuests: 6,
    rating: 4.8, totalReviews: 94, featured: true, instantConfirm: false, ecoLabel: false, status: 'ACTIVE',
    latitude: -8.6479, longitude: 115.1311,
    description: "Discover the ancient art of Balinese silversmithing with master craftsman Ketut Suardana in his charming studio nestled in a Canggu coconut grove. From shaping molten silver to stamping traditional motifs, you will craft a wearable piece of Balinese heritage.",
    highlights: ['Create your own silver ring, pendant or bracelet', 'Learn traditional Balinese silversmithing techniques', 'Work with master craftsman Ketut Suardana', 'Studio set in a lush Canggu coconut grove', 'Take home your polished silver creation'],
    includes: ['All silver materials (up to 5g)', 'Use of professional tools', 'Polishing and finishing', 'Finished piece to take home', 'Welcome drink'],
    excludes: ['Additional silver weight beyond 5g', 'Transport to studio', 'Gratuities'],
    meetingPoint: 'Ketut Silver Studio, Jl. Batu Mejan, Canggu',
    images: ['https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eBatikPainting = await prisma.experience.create({ data: {
    slug: 'batik-painting-workshop', operatorId: opNiWayanArtini.id,
    title: 'Batik Painting Workshop', category: 'ART_CRAFT', area: 'UBUD',
    price: 380000, duration: '3 hours', level: 'All levels', language: 'English', maxGuests: 10,
    rating: 4.7, totalReviews: 64, featured: false, instantConfirm: true, ecoLabel: false, status: 'ACTIVE',
    latitude: -8.5068, longitude: 115.2598,
    description: "Immerse yourself in the meditative art of batik — one of UNESCO's Intangible Cultural Heritage of Humanity. Using hot wax and natural dyes, you'll paint intricate patterns on cotton fabric to create a one-of-a-kind Balinese textile to take home.",
    highlights: ['Learn the traditional wax-resist batik technique', 'Paint your own unique patterns using traditional motifs', 'Use natural plant-based dyes', 'Create a framed wall piece or scarf to take home', 'Set in a serene open-air studio in Ubud'],
    includes: ['All materials (fabric, wax, dyes)', 'Apron and protective gloves', 'Finished batik piece', 'Framing or hemming of your creation', 'Cold drink and snack'],
    excludes: ['Transport to studio', 'Additional fabric', 'Gratuities'],
    meetingPoint: 'Ubud Batik Studio, Jl. Hanoman, Ubud',
    images: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eTraditionalBatik = await prisma.experience.create({ data: {
    slug: 'traditional-batik-workshop', operatorId: opNiWayanArtini.id,
    title: 'Batik Painting Class', category: 'ART_CRAFT', area: 'UBUD',
    price: 420000, duration: '2 hours', level: 'All levels', language: 'English', maxGuests: 10,
    rating: 4.7, totalReviews: 84, featured: false, instantConfirm: true, ecoLabel: false, status: 'ACTIVE',
    latitude: -8.5094, longitude: 115.2651,
    description: "Discover the ancient art of batik in a hands-on class in the heart of Ubud. Using the traditional tjanting tool and hot wax, you'll create intricate resist patterns on fabric before dyeing your cloth in rich natural colours.",
    highlights: ['Use the traditional tjanting wax tool', 'Choose from a range of traditional Balinese motifs', 'Natural dyes from local plants and minerals', 'Take home your finished batik cloth', 'Small group class (max 10 people)'],
    includes: ['All materials and tools', 'Apron', 'Finished batik piece', 'Welcome drink'],
    excludes: ['Transport', 'Gratuities'],
    meetingPoint: 'Jl. Monkey Forest, Ubud',
    images: ['https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eSoundHealingJourney = await prisma.experience.create({ data: {
    slug: 'sound-healing-journey', operatorId: opNinaPutri.id,
    title: 'Sound Healing Journey', category: 'WELLNESS_HEALING', area: 'UBUD',
    price: 350000, duration: '90 minutes', level: 'All levels', language: 'English', maxGuests: 12,
    rating: 4.8, totalReviews: 178, featured: true, instantConfirm: true, ecoLabel: true, status: 'ACTIVE',
    latitude: -8.5074, longitude: 115.2544,
    description: "Surrender to the ancient healing power of Tibetan singing bowls, gongs, and crystal resonators in a sacred ceremony led by master healer Nina Putri. Held in a bamboo pavilion surrounded by jungle, this transformative session quiets the mind and restores the soul.",
    highlights: ['Guided by certified sound healer Nina Putri', 'Experience Tibetan bowls, gongs, and crystal resonators', 'Set in a sacred bamboo pavilion in the Ubud jungle', 'Includes guided breathwork and meditation', 'Leave feeling deeply rested and realigned'],
    includes: ['Welcome herbal tea', 'Yoga mat and bolster', 'Eye pillow and blanket', 'Post-session guided integration', 'Digital sound healing resources'],
    excludes: ['Transport to venue', 'Gratuities', 'Private session upgrade'],
    meetingPoint: 'Sukha Healing Space, Jl. Raya Penestanan, Ubud',
    images: ['https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eSunriseYogaClass = await prisma.experience.create({ data: {
    slug: 'sunrise-yoga-class', operatorId: opKomangDewi.id,
    title: 'Sunrise Yoga & Meditation', category: 'WELLNESS_HEALING', area: 'CANGGU',
    price: 250000, duration: '75 minutes', level: 'All levels', language: 'English', maxGuests: 15,
    rating: 4.9, totalReviews: 203, featured: true, instantConfirm: true, ecoLabel: true, status: 'ACTIVE',
    latitude: -8.6479, longitude: 115.1361,
    description: "Greet the Balinese dawn with a flowing Hatha yoga practice followed by silent meditation, held on an open-air rooftop overlooking Canggu's famous rice fields. A perfect way to begin your day with intention, breath and stillness.",
    highlights: ["Sunrise practice on an open-air rooftop", "Views across Canggu's iconic rice fields", 'Mixed-level Hatha yoga suitable for all', 'Closing 15-minute guided meditation', 'Followed by fresh coconut and fruit'],
    includes: ['Yoga mat and props', 'Fresh coconut and seasonal fruit', 'Filtered water', 'Post-class herbal tea'],
    excludes: ['Transport', 'Gratuities', 'Private instruction'],
    meetingPoint: 'Jiwa Yoga Rooftop, Jl. Batu Mejan, Canggu (look for the blue gate)',
    images: ['https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eWaterTemple = await prisma.experience.create({ data: {
    slug: 'water-temple-purification', operatorId: opWayanGede.id,
    title: 'Water Temple Purification', category: 'CULTURE_SPIRITUAL', area: 'GIANYAR',
    price: 600000, duration: '4 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.8, totalReviews: 78, featured: true, instantConfirm: false, ecoLabel: true, status: 'ACTIVE',
    latitude: -8.4153, longitude: 115.3151,
    description: "Embark on a deeply spiritual journey to Tirta Empul — Bali's most sacred water temple — guided by temple priest Wayan Gede. This intimate ceremony includes a traditional purification ritual in the holy spring, a blessing from a local priest, and a guided meditation in the temple grounds.",
    highlights: ['Private purification ceremony at Tirta Empul', 'Guided by local priest Wayan Gede', 'Traditional blessing and Balinese prayer offering', 'Visit to the inner temple sanctum (restricted access)', 'Peaceful meditation in the sacred gardens'],
    includes: ['Temple entrance fee', 'Traditional sarong and sash', 'Ceremonial flower offerings', 'Bottled water and light snack', 'English-speaking temple guide'],
    excludes: ['Transport to temple', 'Photography services', 'Gratuities'],
    meetingPoint: 'Tirta Empul Temple Gate, Tampaksiring, Gianyar',
    images: ['https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eUluwatuKecak = await prisma.experience.create({ data: {
    slug: 'uluwatu-kecak-sunset', operatorId: opINyomanArta.id,
    title: 'Uluwatu Sunset & Kecak Dance', category: 'CULTURE_SPIRITUAL', area: 'ULUWATU',
    price: 450000, duration: '3 hours', level: 'All levels', language: 'English', maxGuests: 20,
    rating: 4.9, totalReviews: 312, featured: true, instantConfirm: false, ecoLabel: false, status: 'ACTIVE',
    latitude: -8.8291, longitude: 115.0849,
    description: "Watch the sun melt into the Indian Ocean from the dramatic cliff-top Uluwatu Temple, then witness the ancient Kecak fire dance performed against the blazing sky. A bucket-list Bali experience that combines natural beauty, Hindu mythology and traditional performance art.",
    highlights: ["Sunset viewing from Uluwatu's 70-metre sea cliffs", 'Front-row seats to the legendary Kecak fire dance', 'Story of the Ramayana performed by 100 chanting dancers', 'Temple visit with traditional Balinese guide', 'Small group of max 20 for an intimate experience'],
    includes: ['Temple entrance fee', 'Kecak dance performance ticket', 'Traditional sarong for temple entry', 'Bottled water', 'English-speaking guide'],
    excludes: ['Transport to Uluwatu', 'Dinner', 'Photography services', 'Gratuities'],
    meetingPoint: 'Uluwatu Temple Car Park, Pecatu, Badung',
    images: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eCooking = await prisma.experience.create({ data: {
    slug: 'balinese-cooking-class', operatorId: opPutuSari.id,
    title: 'Balinese Cooking Class', category: 'CULINARY', area: 'SEMINYAK',
    price: 480000, duration: '3.5 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.8, totalReviews: 156, featured: false, instantConfirm: true, ecoLabel: false, status: 'ACTIVE',
    latitude: -8.6900, longitude: 115.1630,
    description: "Journey to a Seminyak market at dawn, hand-pick fresh spices and vegetables with your host, then return to a beautiful open kitchen to cook a full Balinese feast from scratch. Learn the secrets of bumbu (spice paste), satay, lawar and black rice pudding.",
    highlights: ["Morning market visit to Seminyak's local pasar", 'Pound your own spice paste using a traditional stone mortar', 'Cook 5–6 authentic Balinese dishes from scratch', "Sit down and enjoy the full feast you've prepared", 'Recipes and spice pack to take home'],
    includes: ['Market visit', 'All ingredients', 'Full 5–6 dish Balinese meal', 'Welcome coffee or tea', 'Printed recipe booklet', 'Spice blend to take home'],
    excludes: ['Transport to cooking school', 'Alcoholic beverages', 'Gratuities'],
    meetingPoint: 'Warung Dapur Bali, Jl. Kayu Aya, Seminyak',
    images: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eJimbaran = await prisma.experience.create({ data: {
    slug: 'jimbaran-seafood-sunset', operatorId: opMadeWidia.id,
    title: 'Jimbaran Seafood & Sunset', category: 'CULINARY', area: 'JIMBARAN',
    price: 350000, duration: '2 hours', level: 'All levels', language: 'English', maxGuests: 10,
    rating: 4.6, totalReviews: 89, featured: false, instantConfirm: true, ecoLabel: false, status: 'ACTIVE',
    latitude: -8.7847, longitude: 115.1661,
    description: "Dine barefoot on the famous white sands of Jimbaran Bay as the sun sinks below the horizon. Choose your seafood fresh from the ice display — grilled prawns, lobster, fish and clams — and enjoy with cold Bintang and stunning sunset views.",
    highlights: ["Barefoot dining on Jimbaran's famous white sand beach", 'Select your seafood fresh from the ice display', 'Grilled over coconut husk for authentic smoky flavour', 'Front-row sunset views over the Indian Ocean', 'Live traditional Balinese music during dinner'],
    includes: ['Reserved beach table', 'Mixed seafood platter for two (prawns, fish, clams)', 'Steamed rice and vegetable sides', 'Cold soft drinks (2 per person)', 'Candles and flower decoration'],
    excludes: ['Transport to Jimbaran', 'Lobster (available at additional cost)', 'Alcoholic beverages', 'Gratuities'],
    meetingPoint: 'Jimbaran Fish Market Beach, Jl. Bukit Permai, Jimbaran',
    images: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eSurfKuta = await prisma.experience.create({ data: {
    slug: 'beginner-surf-lesson', operatorId: opKomangSurya.id,
    title: 'Beginner Surf Lesson', category: 'WATER_ACTIVITIES', area: 'KUTA',
    price: 320000, duration: '2 hours', level: 'Beginner', language: 'English', maxGuests: 6,
    rating: 4.7, totalReviews: 428, featured: true, instantConfirm: true, ecoLabel: false, status: 'ACTIVE',
    latitude: -8.7184, longitude: 115.1686,
    description: "Catch your first wave on the legendary breaks of Kuta Beach with a certified ISA surf instructor. Starting on the sand with theory and pop-up technique, you'll be riding whitewater waves within the first hour.",
    highlights: ["Learn to surf on Bali's most beginner-friendly beach", 'Certified ISA surf instructor with 1:2 student ratio', 'Sand lesson covering theory, pop-up and ocean safety', 'Ride your first whitewater waves within 60 minutes', 'Board and rash vest included — all ages and fitness levels welcome'],
    includes: ['Softboard surfboard rental', 'Rash vest and leg rope', 'Certified instructor (1:2 ratio)', 'Pre-surf theory and beach instruction', 'Post-surf fresh water rinse'],
    excludes: ['Transport to Kuta Beach', 'Wetsuit (available to hire)', 'Photos/video (available at extra cost)', 'Gratuities'],
    meetingPoint: 'Kuta Surf School Hut, in front of Hard Rock Hotel, Kuta Beach',
    images: ['https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eSnorkeling = await prisma.experience.create({ data: {
    slug: 'snorkeling-amed', operatorId: opGedeArnawa.id,
    title: 'Snorkeling at Amed Reef', category: 'WATER_ACTIVITIES', area: 'AMED',
    price: 420000, duration: '3 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.8, totalReviews: 67, featured: false, instantConfirm: true, ecoLabel: true, status: 'ACTIVE',
    latitude: -8.3449, longitude: 115.6578,
    description: "Explore the vibrant coral gardens and USAT Liberty shipwreck off the black-sand beaches of Amed, East Bali. Your guide Putu will take you to three snorkelling sites teeming with reef fish, sea turtles and (if you're lucky) mola-mola.",
    highlights: ['Three snorkelling sites including the USAT Liberty shipwreck', 'Chance to snorkel with sea turtles in their natural habitat', 'Vibrant coral gardens with hundreds of reef fish species', 'Remote East Bali setting far from the tourist crowds', 'Full equipment provided — no experience needed'],
    includes: ['Snorkel mask, fins and life vest', 'Boat transport to snorkel sites', 'Certified guide in the water with you', 'Fresh fruit and water on the boat', 'Snorkel briefing and safety talk'],
    excludes: ['Transport to Amed', 'Wetsuit (available to hire)', 'Underwater camera rental', 'Gratuities'],
    meetingPoint: 'Amed Dive Center pier, Jl. Raya Amed, Abang',
    images: ['https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eRiceWalk = await prisma.experience.create({ data: {
    slug: 'rice-terrace-walk', operatorId: opGedeArnawa.id,
    title: 'Tegalalang Rice Terrace Walk', category: 'NATURE_OUTDOORS', area: 'UBUD',
    price: 280000, duration: '2.5 hours', level: 'Easy', language: 'English', maxGuests: 8,
    rating: 4.8, totalReviews: 192, featured: true, instantConfirm: true, ecoLabel: true, status: 'ACTIVE',
    latitude: -8.4279, longitude: 115.2790,
    description: "Walk through the legendary UNESCO-listed Tegalalang rice terraces with a local farmer guide, learning about the ancient Balinese subak irrigation system. Wind through emerald-green paddies, cross bamboo bridges, and pause at a hillside warung for fresh coconut.",
    highlights: ['Guided walk through UNESCO-listed Tegalalang terraces', 'Learn the ancient subak irrigation system from a local farmer', 'Cross hand-crafted bamboo bridges over the valley', 'Pause at a traditional hillside warung for fresh coconut', 'Golden hour light on the rice paddies (afternoon tours)'],
    includes: ['English-speaking farmer guide', 'Fresh coconut at midpoint warung', 'Bottled water', 'Entrance to private terrace sections'],
    excludes: ['Transport to Tegalalang', 'Lunch', 'Gratuities', 'Photography props'],
    meetingPoint: 'Tegalalang Rice Terrace main car park, Jl. Raya Tegalalang, Ubud',
    images: ['https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eNaturalDye = await prisma.experience.create({ data: {
    slug: 'natural-dye-workshop', operatorId: opNiMadeSuari.id,
    title: 'Natural Dye Workshop', category: 'ART_CRAFT', area: 'GIANYAR',
    price: 380000, duration: '3 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.7, totalReviews: 31, featured: false, instantConfirm: true, ecoLabel: true, status: 'ACTIVE',
    latitude: -8.5278, longitude: 115.4569,
    description: 'Journey to the village of Sidemen in East Bali for an immersive natural dye workshop in a traditional weaving compound. Learn to extract colour from roots, bark and flowers, then dye a piece of silk or cotton using ancient techniques passed down through generations.',
    highlights: ['Forage for natural dye plants in the surrounding gardens', 'Extract vivid colours from turmeric, indigo, teak and morinda', 'Dye your own silk scarf using traditional bundle-tying techniques', 'Set in a working weaving compound in the village of Sidemen', 'Far from tourist crowds — a deeply authentic experience'],
    includes: ['All dye materials and fabric', 'Foraging walk with guide', 'Finished dyed silk scarf', 'Traditional Balinese snack and drink'],
    excludes: ['Transport to Sidemen (approx. 1.5 hrs from Ubud)', 'Gratuities', 'Additional fabric'],
    meetingPoint: 'Sidemen Weaving Village, Jl. Raya Sidemen, Karangasem',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eWoodCarving = await prisma.experience.create({ data: {
    slug: 'wood-carving-workshop', operatorId: opINyomanKarsa.id,
    title: 'Wood Carving Workshop', category: 'ART_CRAFT', area: 'UBUD',
    price: 500000, duration: '4 hours', level: 'Beginner-friendly', language: 'English', maxGuests: 6,
    rating: 4.6, totalReviews: 47, featured: false, instantConfirm: true, ecoLabel: false, status: 'ACTIVE',
    latitude: -8.5611, longitude: 115.2753,
    description: "Learn the sacred art of Balinese wood carving in Mas — the most famous woodcarving village in Bali. Under the patient guidance of master carver I Nyoman Karsa, you'll chisel your own small deity or decorative panel from fragrant suar wood.",
    highlights: ['Learn Balinese carving from master carver I Nyoman Karsa', 'Chisel your own small decorative panel from suar wood', "Set in the heart of Mas, Bali's most famous carving village", 'Visit the village workshop and see master carvers at work', 'Take home your finished carving — a true Bali heirloom'],
    includes: ['All carving tools and suar wood', 'Protective equipment', 'Finished carved piece', 'Welcome drink and snack'],
    excludes: ['Transport to Mas', 'Finishing oils and stains (available to purchase)', 'Gratuities'],
    meetingPoint: 'Karsa Wood Studio, Jl. Raya Mas, Mas Village, Ubud',
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eRattan = await prisma.experience.create({ data: {
    slug: 'rattan-weaving-class', operatorId: opNiKomangAyu.id,
    title: 'Rattan Weaving Class', category: 'ART_CRAFT', area: 'GIANYAR',
    price: 350000, duration: '2.5 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.8, totalReviews: 29, featured: false, instantConfirm: true, ecoLabel: true, status: 'ACTIVE',
    latitude: -8.5278, longitude: 115.4569,
    description: 'Sit with the women of Sidemen and learn the meditative art of rattan weaving. Guided by village artisan Ni Komang Ayu, you\'ll weave a small basket or decorative tray using dried rattan strips — a skill unchanged for centuries in this East Bali village.',
    highlights: ['Learn rattan weaving from village artisan Ni Komang Ayu', 'Weave a small basket or tray from natural rattan strips', 'Set in a traditional village compound in Sidemen, East Bali', 'Small group (max 8) for a truly personal experience', 'Surrounded by rice terraces and Mount Agung views'],
    includes: ['All rattan materials and tools', 'Finished woven piece to take home', 'Traditional Balinese snack and tea'],
    excludes: ['Transport to Sidemen', 'Gratuities', 'Additional materials'],
    meetingPoint: 'Ayu Weaving Village, Jl. Raya Sidemen, Karangasem (coordinates shared on booking)',
    images: ['https://images.unsplash.com/photo-1605522469906-3fe226b356bc?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eSoundSession = await prisma.experience.create({ data: {
    slug: 'sound-healing-session', operatorId: opNinaPutri.id,
    title: 'Sound Healing Journey', category: 'WELLNESS_HEALING', area: 'UBUD',
    price: 350000, duration: '90 minutes', level: 'All levels', language: 'English', maxGuests: 12,
    rating: 4.9, totalReviews: 212, featured: false, instantConfirm: true, ecoLabel: true, status: 'ACTIVE',
    latitude: -8.5074, longitude: 115.2544,
    description: "Surrender to the ancient healing power of Tibetan singing bowls, gongs, and crystal resonators in a sacred group ceremony held in a bamboo pavilion deep in the Ubud jungle. Master healer Nina Putri guides you through breathwork and into a state of profound stillness.",
    highlights: ['Guided by certified sound healer Nina Putri', 'Tibetan bowls, crystal resonators, and gong bath', 'Sacred bamboo pavilion set in the Ubud jungle', 'Guided breathwork opening and integration closing', 'Leave feeling deeply restored and realigned'],
    includes: ['Welcome herbal tea', 'Yoga mat, bolster and blanket', 'Eye pillow', 'Post-session integration guide', 'Digital audio resources'],
    excludes: ['Transport to venue', 'Gratuities', 'Private session upgrade'],
    meetingPoint: 'Sukha Healing Space, Jl. Raya Penestanan, Ubud',
    images: ['https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eJamu = await prisma.experience.create({ data: {
    slug: 'jamu-wellness-ritual', operatorId: opNinaPutri.id,
    title: 'Traditional Jamu Ritual', category: 'WELLNESS_HEALING', area: 'UBUD',
    price: 480000, duration: '2 hours', level: 'All levels', language: 'English', maxGuests: 6,
    rating: 4.8, totalReviews: 73, featured: false, instantConfirm: true, ecoLabel: true, status: 'ACTIVE',
    latitude: -8.5032, longitude: 115.2548,
    description: "Experience the ancient Balinese healing tradition of jamu — herbal medicine made from roots, bark, flowers, and spices. With healer Ibu Wayan, you'll forage fresh ingredients from her garden, grind them by hand using a traditional batu giling, and prepare five classic jamu tonics to drink fresh.",
    highlights: ['Forage healing plants from a traditional Balinese garden', 'Grind spices by hand using an ancient stone batu giling', 'Prepare and drink five classic jamu tonics', 'Learn the Balinese understanding of hot and cold foods', 'Take home a printed recipe booklet and dried spice blend'],
    includes: ['All ingredients', 'Use of traditional tools', 'Five jamu tastings', 'Printed recipe booklet', 'Dried spice blend to take home', 'Herbal tea and light snack'],
    excludes: ['Transport to the garden compound', 'Gratuities'],
    meetingPoint: "Ibu Wayan's Garden, Jl. Raya Sanggingan, Ubud (directions on booking confirmation)",
    images: ['https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eSunriseYogaUbud = await prisma.experience.create({ data: {
    slug: 'sunrise-yoga-ubud', operatorId: opKomangDewi.id,
    title: 'Sunrise Yoga in the Rice Fields', category: 'WELLNESS_HEALING', area: 'UBUD',
    price: 280000, duration: '75 minutes', level: 'All levels', language: 'English', maxGuests: 10,
    rating: 4.9, totalReviews: 156, featured: false, instantConfirm: true, ecoLabel: true, status: 'ACTIVE',
    latitude: -8.5038, longitude: 115.2533,
    description: "Greet the Balinese dawn with a flowing Hatha yoga practice on an open platform set directly among Ubud's famous rice paddies. As the sun rises over Mount Agung and the egrets circle the flooded terraces, your teacher Kadek guides you through breath, movement and stillness.",
    highlights: ['Sunrise yoga platform set directly in the rice fields', 'Views of Mount Agung from the mat', 'Mixed-level Hatha yoga — all welcome', 'Closing guided meditation and pranayama', 'Followed by fresh coconut and seasonal fruit'],
    includes: ['Yoga mat and props', 'Fresh coconut and fruit', 'Filtered water', 'Post-class herbal tea'],
    excludes: ['Transport to the rice field platform', 'Private instruction', 'Gratuities'],
    meetingPoint: 'Sawah Yoga Platform, Jl. Raya Campuhan, Ubud (look for the bamboo gate)',
    images: ['https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eMeditationTemple = await prisma.experience.create({ data: {
    slug: 'meditation-temple', operatorId: opWayanGede.id,
    title: 'Guided Meditation at Tirta Empul', category: 'CULTURE_SPIRITUAL', area: 'GIANYAR',
    price: 320000, duration: '2 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.7, totalReviews: 88, featured: false, instantConfirm: false, ecoLabel: true, status: 'ACTIVE',
    latitude: -8.4153, longitude: 115.3151,
    description: "Begin the day with a private guided meditation in the sacred gardens of Tirta Empul, one of Bali's most spiritually powerful temples. Before the crowds arrive, sit with guide Wayan Gede among the ancient frangipani trees and let the sound of the holy spring carry your practice.",
    highlights: ['Arrive at dawn before the temple opens to the public', 'Seated meditation in the inner sacred garden', 'Guided by temple guide Wayan Gede', 'Introduction to Balinese Hindu meditation philosophy', 'Witness morning ceremonies performed by local priests'],
    includes: ['Temple entrance fee', 'Traditional sarong and sash', 'Guided meditation (45 min)', 'Bottled water', 'Post-session herbal tea'],
    excludes: ['Transport to Tampaksiring', 'Water purification ceremony (available as add-on)', 'Gratuities'],
    meetingPoint: 'Tirta Empul Temple Gate, Tampaksiring, Gianyar (meet at 6:00am)',
    images: ['https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eWaterCeremony = await prisma.experience.create({ data: {
    slug: 'water-temple-ceremony', operatorId: opWayanGede.id,
    title: 'Water Temple Purification', category: 'CULTURE_SPIRITUAL', area: 'GIANYAR',
    price: 420000, duration: '3 hours', level: 'All levels', language: 'English', maxGuests: 10,
    rating: 4.7, totalReviews: 84, featured: false, instantConfirm: false, ecoLabel: true, status: 'ACTIVE',
    latitude: -8.4153, longitude: 115.3152,
    description: "Participate in a traditional purification ceremony at Tirta Empul — Bali's most sacred water temple — with local priest Wayan Gede as your guide. Wade into the holy spring pools, receive blessings at each of the twenty-two waterspouts, and emerge cleansed, centred and deeply connected to the living faith of Bali.",
    highlights: ['Participate (not just observe) in a real purification ceremony', 'Receive blessings at all twenty-two sacred waterspouts', 'Guided by temple priest Wayan Gede', 'Traditional Balinese prayer offering included', 'Access to the inner temple sanctum'],
    includes: ['Temple entrance fee', 'Traditional sarong and sash for the ceremony', 'Ceremonial flower offerings', 'Bottled water and light snack', 'English-speaking temple priest guide'],
    excludes: ['Transport to Tampaksiring', 'Photography services', 'Gratuities'],
    meetingPoint: 'Tirta Empul Temple Gate, Tampaksiring, Gianyar',
    images: ['https://images.unsplash.com/photo-1604999333679-b86d54738315?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eDanceClass = await prisma.experience.create({ data: {
    slug: 'traditional-dance-class', operatorId: opINyomanArta.id,
    title: 'Legong Dance Masterclass', category: 'CULTURE_SPIRITUAL', area: 'UBUD',
    price: 390000, duration: '2 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.8, totalReviews: 61, featured: false, instantConfirm: true, ecoLabel: false, status: 'ACTIVE',
    latitude: -8.5276, longitude: 115.2671,
    description: "Learn the exquisite Legong — Bali's most refined classical dance form — in a hands-on masterclass at Ubud's most respected dance studio. Ni Nyoman Sari, a dancer who has performed at the Ubud Palace for twenty years, teaches you the language of eyes, fingers, and flowing headdress.",
    highlights: ['Learn Legong from palace dancer Ni Nyoman Sari', 'Master the precise hand gestures (mudra) and eye movements', 'Dress in a traditional Legong costume for photos', 'Understand the story and mythology of the Legong Keraton', 'Small class of max 8 for personal attention'],
    includes: ['All costumes and accessories for class', 'Printed guide to Balinese mudra gestures', 'Post-class costume photo session', 'Welcome drink'],
    excludes: ['Transport to studio', 'Private session upgrade', 'Gratuities'],
    meetingPoint: 'Semara Ratih Dance Studio, Jl. Raya Lodtunduh, Ubud',
    images: ['https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eKecakFire = await prisma.experience.create({ data: {
    slug: 'kecak-fire-dance', operatorId: opINyomanArta.id,
    title: 'Kecak Fire Dance at Uluwatu', category: 'CULTURE_SPIRITUAL', area: 'ULUWATU',
    price: 250000, duration: '1.5 hours', level: 'All levels', language: 'English', maxGuests: 20,
    rating: 4.9, totalReviews: 318, featured: true, instantConfirm: false, ecoLabel: false, status: 'ACTIVE',
    latitude: -8.8291, longitude: 115.0850,
    description: 'Watch the legendary Kecak fire dance performed at the clifftop Uluwatu Temple as the sun sets behind the performers into the Indian Ocean. A hundred men in concentric circles chant the ancient Ramayana while a fire dancer walks barefoot through blazing coconut husks.',
    highlights: ['Front-row tickets to the Kecak fire dance at sunset', 'Dramatic clifftop temple setting above the Indian Ocean', 'Guided temple walk before the performance', 'Story of the Ramayana explained by your English-speaking guide', 'Small group for the best viewing position'],
    includes: ['Kecak performance ticket', 'Temple entrance fee', 'Traditional sarong', 'English-speaking guide', 'Bottled water'],
    excludes: ['Transport to Uluwatu', 'Dinner', 'Gratuities'],
    meetingPoint: 'Uluwatu Temple Car Park, Pecatu, Badung (meet 45 min before sunset)',
    images: ['https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eHistoryTour = await prisma.experience.create({ data: {
    slug: 'balinese-history-tour', operatorId: opINyomanArta.id,
    title: 'Old Bali Heritage Walk', category: 'CULTURE_SPIRITUAL', area: 'GIANYAR',
    price: 350000, duration: '3 hours', level: 'Easy', language: 'English', maxGuests: 8,
    rating: 4.7, totalReviews: 42, featured: false, instantConfirm: true, ecoLabel: false, status: 'ACTIVE',
    latitude: -8.5430, longitude: 115.4017,
    description: "Walk through Klungkung — the seat of Bali's last royal dynasty — with historian and guide I Wayan Sudira. Visit the Kerta Gosa justice pavilion with its extraordinary ceiling of Kamasan paintings, the floating pavilion, and the royal cremation site, learning the story of Bali's Puputan resistance against Dutch colonisation.",
    highlights: ['Visit the Kerta Gosa ceiling — 267 Kamasan paintings depicting Hindu cosmology', 'See the Bale Kambang floating pavilion', 'Learn the story of the 1908 Puputan battle', "Walk the royal market and craftspeople's quarter", 'Small group for personal access and conversation'],
    includes: ['Kerta Gosa entrance fee', 'English-speaking historian guide', 'Bottled water', 'Traditional Balinese snack at local warung'],
    excludes: ['Transport to Klungkung', 'Lunch', 'Gratuities'],
    meetingPoint: 'Kerta Gosa main gate, Jl. Untung Surapati, Klungkung town centre',
    images: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eCoffee = await prisma.experience.create({ data: {
    slug: 'coffee-plantation-tour', operatorId: opKetutWirawan.id,
    title: 'Coffee Plantation & Tasting Tour', category: 'CULINARY', area: 'KINTAMANI',
    price: 320000, duration: '3 hours', level: 'Easy', language: 'English', maxGuests: 12,
    rating: 4.8, totalReviews: 143, featured: false, instantConfirm: true, ecoLabel: true, status: 'ACTIVE',
    latitude: -8.2429, longitude: 115.3758,
    description: "Visit a working Arabica coffee plantation on the slopes of Mount Batur, where the volcanic soil and altitude produce some of Indonesia's finest coffee. With plantation owner Ketut Wirawan, you'll pick cherries, learn the wet-process method, roast beans on a traditional clay pot, and taste eight varieties including the infamous kopi luwak.",
    highlights: ['Pick ripe coffee cherries from high-altitude Arabica plants', 'Learn the full wet-process journey from cherry to cup', 'Roast and grind your own beans using traditional methods', 'Taste eight varieties of Balinese coffee and herbal tea', 'Stunning views across Lake Batur and the volcano'],
    includes: ['Full plantation tour with Ketut', 'Coffee tasting (8 varieties)', 'Herbal tea tasting', 'Roasting demonstration', '250g bag of freshly roasted beans to take home'],
    excludes: ['Transport to Kintamani', 'Lunch', 'Additional coffee purchases', 'Gratuities'],
    meetingPoint: 'Batur Arabica Plantation, Jl. Raya Kintamani, Batur village',
    images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eFoodTour = await prisma.experience.create({ data: {
    slug: 'ubud-market-food-tour', operatorId: opPutuSari.id,
    title: 'Ubud Market Food Tour', category: 'CULINARY', area: 'UBUD',
    price: 280000, duration: '3 hours', level: 'Easy', language: 'English', maxGuests: 8,
    rating: 4.8, totalReviews: 97, featured: false, instantConfirm: true, ecoLabel: false, status: 'ACTIVE',
    latitude: -8.5061, longitude: 115.2635,
    description: "Start before sunrise at Ubud's bustling Pasar Ubud to see the market at its most alive, then wind through the food stalls of Jl. Monkey Forest with guide Putu Ayu, tasting twelve dishes that form the backbone of Balinese home cooking — from fragrant nasi campur to crispy babi guling and sweet jaje Bali.",
    highlights: ["Pre-dawn Pasar Ubud market walk before tourists arrive", 'Taste twelve iconic Balinese dishes at local warungs', 'Learn the story behind each dish and its cultural significance', 'Try jamu health tonics at a traditional street stall', 'Finish with Balinese coffee and black rice pudding'],
    includes: ['All food tastings (twelve dishes)', 'Jamu tasting', 'Balinese coffee', 'Guide Putu Ayu throughout', "Printed guide to Ubud's best local warungs"],
    excludes: ['Transport to Ubud market', 'Additional purchases', 'Gratuities'],
    meetingPoint: 'Main entrance, Pasar Ubud (Ubud Market), Jl. Raya Ubud (meet at 6:00am)',
    images: ['https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eMountBatur = await prisma.experience.create({ data: {
    slug: 'mount-batur-sunrise', operatorId: opGedeArnawa.id,
    title: 'Mount Batur Sunrise Trek', category: 'NATURE_OUTDOORS', area: 'KINTAMANI',
    price: 650000, duration: '6 hours', level: 'Moderate', language: 'English', maxGuests: 10,
    rating: 4.8, totalReviews: 241, featured: true, instantConfirm: false, ecoLabel: false, status: 'ACTIVE',
    latitude: -8.2428, longitude: 115.3757,
    description: "Trek to the summit of Mount Batur — Bali's most active volcano at 1717m — in the dark, arriving at the crater rim just as the sun rises over Mount Agung and Lake Batur below. With certified guide Wayan Surya, you'll see the volcanic fumaroles, eat banana sandwiches warmed by volcanic steam, and descend through black lava fields.",
    highlights: ['Summit (1717m) for a 360° sunrise above the clouds', 'Watch dawn break over Mount Agung and Lake Batur', 'Cook your breakfast over active volcanic steam vents', 'Trek through black 1963 lava fields on the descent', 'Small group of max 10 for a personal experience'],
    includes: ['Certified volcano guide Wayan Surya', 'Torch and hiking poles', 'Breakfast at the summit (banana toast, egg, fruit)', 'Bottled water (2 litres)', 'Post-trek transfer back to trailhead'],
    excludes: ['Transport to Kintamani trailhead', 'Gratuities', 'Personal travel insurance'],
    meetingPoint: 'Toya Bungkah village, Kintamani (pick up from your accommodation available — ask on booking)',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eRiceTrek = await prisma.experience.create({ data: {
    slug: 'rice-terrace-trek', operatorId: opGedeArnawa.id,
    title: 'Tegalalang Rice Terrace Trek', category: 'NATURE_OUTDOORS', area: 'UBUD',
    price: 320000, duration: '3 hours', level: 'Easy', language: 'English', maxGuests: 8,
    rating: 4.7, totalReviews: 103, featured: false, instantConfirm: true, ecoLabel: true, status: 'ACTIVE',
    latitude: -8.4279, longitude: 115.2791,
    description: "Trek through the legendary UNESCO-listed Tegalalang terraces and into the less-visited valley below, where the real farming life of Bali continues unchanged. With local farmer Gede, you'll learn about the ancient subak irrigation system, plant a rice seedling, and see the terraces from angles no tourist path reaches.",
    highlights: ['Descend into the private valley sections closed to solo visitors', 'Plant your own rice seedling in a working paddy', 'Learn about the UNESCO-listed subak irrigation system', 'Cross hand-made bamboo bridges over the river', 'Finish with fresh coconut at a local farmer\'s warung'],
    includes: ['English-speaking farmer guide', 'Rice planting experience', 'Fresh coconut at midpoint', 'Bottled water', 'Access to private terrace sections'],
    excludes: ['Transport to Tegalalang', 'Lunch', 'Photography props or swings', 'Gratuities'],
    meetingPoint: 'Tegalalang main car park, Jl. Raya Tegalalang (north of Ubud — 20 min drive)',
    images: ['https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eWaterfall = await prisma.experience.create({ data: {
    slug: 'waterfall-hidden-canyon', operatorId: opGedeArnawa.id,
    title: 'Hidden Waterfall Canyon Hike', category: 'NATURE_OUTDOORS', area: 'AMED',
    price: 450000, duration: '5 hours', level: 'Moderate', language: 'English', maxGuests: 8,
    rating: 4.9, totalReviews: 89, featured: false, instantConfirm: false, ecoLabel: true, status: 'ACTIVE',
    latitude: -8.1187, longitude: 115.0916,
    description: 'Trek to the spectacular Aling-Aling waterfall complex in North Bali, where four waterfalls cascade into natural pools hidden deep in a jungle canyon. With guide Putu, you\'ll slide down natural rock slides, jump from clifftop platforms into emerald pools, and swim under the 35-metre Kroya waterfall.',
    highlights: ['Slide down natural rock slides into jungle pools', 'Cliff jump from platforms at 5, 8 and 12 metres (optional)', 'Swim under the 35-metre Kroya waterfall', 'Trek through dense North Bali jungle canyon', 'Far fewer visitors than South Bali waterfalls'],
    includes: ['Certified guide Putu throughout', 'Safety equipment (life vest, helmet)', 'Entrance fees to all four waterfalls', 'Light lunch at local warung', 'Bottled water and fruit'],
    excludes: ['Transport to Aling-Aling (approx 1.5 hrs from Ubud)', 'Gratuities', 'Personal travel insurance'],
    meetingPoint: 'Aling-Aling Waterfall car park, Sukasada, Buleleng',
    images: ['https://images.unsplash.com/photo-1552083375-1447ce886485?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eSurfCanggu = await prisma.experience.create({ data: {
    slug: 'surfing-lesson-canggu', operatorId: opKomangSurya.id,
    title: 'Surfing Lesson for Beginners', category: 'WATER_ACTIVITIES', area: 'CANGGU',
    price: 400000, duration: '2 hours', level: 'Beginner', language: 'English', maxGuests: 6,
    rating: 4.8, totalReviews: 176, featured: false, instantConfirm: true, ecoLabel: false, status: 'ACTIVE',
    latitude: -8.6510, longitude: 115.1337,
    description: "Learn to surf at Canggu's beginner-friendly Batu Bolong beach with certified instructor Komang — one of the most patient, encouraging surf teachers on the island. After a land lesson covering technique and ocean safety, you'll be riding whitewater waves in the first hour.",
    highlights: ['Beach lesson on technique, pop-up and ocean safety first', 'Beginner-friendly Batu Bolong beach break', 'Max 6 students per instructor for personalised coaching', 'Stand up and ride waves in your first session', 'Post-surf fresh coconut and photos of your waves'],
    includes: ['Softboard and leash', 'Rash vest', 'Certified instructor (1:3 ratio or better)', 'Post-surf fresh coconut', 'Surf photos via WhatsApp'],
    excludes: ['Transport to Canggu', 'Wetsuit (available to borrow)', 'Gratuities'],
    meetingPoint: 'Komang Surf School, Jl. Pantai Batu Bolong, Canggu (on the beach)',
    images: ['https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  const eSup = await prisma.experience.create({ data: {
    slug: 'sup-seminyak', operatorId: opKomangSurya.id,
    title: 'Stand-Up Paddleboard at Seminyak', category: 'WATER_ACTIVITIES', area: 'SEMINYAK',
    price: 350000, duration: '1.5 hours', level: 'All levels', language: 'English', maxGuests: 6,
    rating: 4.6, totalReviews: 52, featured: false, instantConfirm: true, ecoLabel: false, status: 'ACTIVE',
    latitude: -8.6979, longitude: 115.1596,
    description: "Glide across the calm morning waters of Seminyak Beach on a stand-up paddleboard before the day heats up and the crowds arrive. Instructor Wayan guides you from your first wobbly step onto the board through to confident paddling.",
    highlights: ['Early morning session when Seminyak Beach is at its calmest', 'Full instruction from beginner to confident paddler in one session', 'On flat days: paddle beyond the break for open ocean sunrise views', 'Great for core fitness and balance — no surf experience needed', 'Followed by fresh coconut on the beach'],
    includes: ['SUP board and paddle', 'Life vest and leash', 'Certified instructor Wayan', 'Post-session fresh coconut'],
    excludes: ['Transport to Seminyak Beach', 'Wetsuit', 'Gratuities'],
    meetingPoint: 'Seminyak Beach SUP point, in front of W Hotel, Jl. Kayu Aya, Seminyak (meet at 7:00am)',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=85', 'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
  }})

  // ── Reviews ────────────────────────────────────────────────────────────────
  await prisma.review.createMany({ data: [
    // pottery-making-class
    { userId: tSarah.id,  experienceId: ePottery.id, rating: 5, comment: "Absolutely magical. Made is an incredible teacher — patient, encouraging, and full of beautiful stories about her family's craft. I made a small bowl that I treasure deeply.", createdAt: new Date('2024-05-12') },
    { userId: tThomas.id, experienceId: ePottery.id, rating: 5, comment: "One of the best experiences I've had in Bali. The studio setting is serene, and you genuinely leave with something you shaped with your own hands.", createdAt: new Date('2024-04-18') },
    { userId: tPriya.id,  experienceId: ePottery.id, rating: 5, comment: "The location alone is worth it — surrounded by rice paddies. Wonderful for couples or solo travellers. Made makes everyone feel at ease.", createdAt: new Date('2024-03-25') },

    // silver-jewelry-workshop
    { userId: tYuki.id,   experienceId: eSilver.id, rating: 5, comment: "Ketut is an absolute master. I made a silver ring and could not believe how beautiful it turned out. The studio atmosphere was incredible — real Balinese charm.", createdAt: new Date('2024-04-08') },
    { userId: tThomas.id, experienceId: eSilver.id, rating: 5, comment: "The perfect activity for a special occasion. My partner and I each made a matching ring. Such a meaningful memory to take home from Bali.", createdAt: new Date('2024-03-15') },
    { userId: tLucas.id,  experienceId: eSilver.id, rating: 4, comment: "Fantastic experience. The process is more intricate than I expected but Ketut guides you through every step patiently. My pendant turned out beautifully.", createdAt: new Date('2024-02-22') },

    // batik-painting-workshop
    { userId: tAnna.id,  experienceId: eBatikPainting.id, rating: 5, comment: "Such a peaceful and creative experience. I made a beautiful batik scarf and learned so much about the history of this art form. Highly recommend!", createdAt: new Date('2024-05-01') },
    { userId: tLucas.id, experienceId: eBatikPainting.id, rating: 4, comment: "Really enjoyable workshop. The instructor was patient and knowledgeable. My batik piece is now proudly hanging on my wall back home.", createdAt: new Date('2024-04-12') },

    // traditional-batik-workshop
    { userId: tPriya.id,  experienceId: eTraditionalBatik.id, rating: 5, comment: "Wonderful class — the instructor made it easy and fun even for a complete beginner. My batik is now framed in my living room!", createdAt: new Date('2024-04-20') },
    { userId: tThomas.id, experienceId: eTraditionalBatik.id, rating: 4, comment: "Really lovely experience, very relaxing and creative. The studio is charming and the teacher is patient.", createdAt: new Date('2024-03-10') },

    // sound-healing-journey
    { userId: tRachel.id, experienceId: eSoundHealingJourney.id, rating: 5, comment: "One of the most profound experiences of my life. Nina holds the space with such grace and wisdom. I left feeling like a completely new person.", createdAt: new Date('2024-05-08') },
    { userId: tLucas.id,  experienceId: eSoundHealingJourney.id, rating: 5, comment: "I was sceptical at first but the sound bath genuinely shifted something in me. The bamboo pavilion setting is magical. Totally transformative.", createdAt: new Date('2024-04-25') },
    { userId: tAnna.id,   experienceId: eSoundHealingJourney.id, rating: 5, comment: "Nina is extraordinary. Her knowledge of sound healing is deep and she creates such a safe, nurturing environment. I go every time I visit Bali.", createdAt: new Date('2024-03-14') },

    // sunrise-yoga-class
    { userId: tAnna.id, experienceId: eSunriseYogaClass.id, rating: 5, comment: "The most beautiful way to start the day. The sunrise over the rice fields during shavasana was unforgettable. Komang is a wonderful teacher.", createdAt: new Date('2024-05-14') },
    { userId: tBen.id,  experienceId: eSunriseYogaClass.id, rating: 5, comment: "Went three mornings in a row — that good! Great for all levels. The coconut at the end is the perfect reward.", createdAt: new Date('2024-04-20') },

    // water-temple-purification
    { userId: tPriya.id,  experienceId: eWaterTemple.id, rating: 5, comment: "A deeply moving experience. Wayan is wise, warm and gives you true access to the sacred nature of the ceremony. I felt genuinely changed afterwards.", createdAt: new Date('2024-04-30') },
    { userId: tThomas.id, experienceId: eWaterTemple.id, rating: 5, comment: "Wayan brought so much meaning to every part of the ceremony. We accessed parts of the temple most tourists never see. Unforgettable.", createdAt: new Date('2024-03-22') },

    // uluwatu-kecak-sunset
    { userId: tGiulia.id, experienceId: eUluwatuKecak.id, rating: 5, comment: "The Kecak dance at sunset is genuinely one of the most spectacular things I have ever witnessed. The chanting, the fire, the ocean backdrop — absolutely extraordinary.", createdAt: new Date('2024-05-17') },
    { userId: tFelix.id,  experienceId: eUluwatuKecak.id, rating: 5, comment: "Don't miss this if you're in Bali. The cliffs are dramatic and the performance is mesmerising. Our guide made the whole experience so much richer.", createdAt: new Date('2024-04-28') },
    { userId: tYuki.id,   experienceId: eUluwatuKecak.id, rating: 5, comment: "A truly magical evening. We arrived early to explore the temple and stayed for the full sunset. The kecak performers are incredibly talented.", createdAt: new Date('2024-03-31') },

    // balinese-cooking-class
    { userId: tSarah.id, experienceId: eCooking.id, rating: 5, comment: "Absolutely loved every moment. The market visit was a highlight and the food we cooked was genuinely delicious. I've already cooked the nasi goreng recipe at home!", createdAt: new Date('2024-05-10') },
    { userId: tLucas.id, experienceId: eCooking.id, rating: 5, comment: "One of the best cooking classes I've done anywhere in the world. Small group, generous portions and everything was fresh from the market. Highly recommend.", createdAt: new Date('2024-04-05') },

    // jimbaran-seafood-sunset
    { userId: tThomas.id, experienceId: eJimbaran.id, rating: 5, comment: "The sunset, the sand between your toes, the freshest grilled seafood — this is Bali at its absolute best. Don't miss it.", createdAt: new Date('2024-05-05') },
    { userId: tAnna.id,   experienceId: eJimbaran.id, rating: 4, comment: "Lovely experience. The seafood was fresh and the sunset was gorgeous. Gets busy on weekends so arrive on time for the best tables.", createdAt: new Date('2024-04-14') },

    // beginner-surf-lesson
    { userId: tLucas.id, experienceId: eSurfKuta.id, rating: 5, comment: "I had never surfed before and stood up on my third attempt! Komang is encouraging, patient and makes the whole thing feel safe. Best 2 hours of my trip.", createdAt: new Date('2024-05-19') },
    { userId: tSarah.id, experienceId: eSurfKuta.id, rating: 5, comment: "Absolutely brilliant. Small group, attentive instructor and we all caught waves. The rash vest is provided so you're all set from the moment you arrive.", createdAt: new Date('2024-04-08') },
    { userId: tPriya.id, experienceId: eSurfKuta.id, rating: 4, comment: "Great fun. Kuta is a perfect beach for beginners — the waves are gentle and the instructor kept us safe the whole time.", createdAt: new Date('2024-03-03') },

    // snorkeling-amed
    { userId: tAnna.id,  experienceId: eSnorkeling.id, rating: 5, comment: "The Liberty shipwreck is incredible — coral-encrusted and full of life. The guide found us a sea turtle almost immediately. Truly special.", createdAt: new Date('2024-04-22') },
    { userId: tFelix.id, experienceId: eSnorkeling.id, rating: 5, comment: "Worth every rupiah. We snorkelled with at least four turtles and the wreck was breathtaking. Amed itself is gorgeous — so far from the crowds.", createdAt: new Date('2024-03-18') },

    // rice-terrace-walk
    { userId: tSarah.id,  experienceId: eRiceWalk.id, rating: 5, comment: "Gede was wonderful — so knowledgeable about the history of the terraces and the subak system. The walk itself is stunning and we had sections completely to ourselves.", createdAt: new Date('2024-05-16') },
    { userId: tThomas.id, experienceId: eRiceWalk.id, rating: 5, comment: "A beautiful, gentle walk through an impossibly green landscape. The coconut stop was a perfect touch. Book the afternoon tour for the best light.", createdAt: new Date('2024-04-03') },
    { userId: tPriya.id,  experienceId: eRiceWalk.id, rating: 4, comment: "Lovely guided experience. The private sections away from the tourist crowds make this worth it over going alone. Gede is knowledgeable and fun.", createdAt: new Date('2024-03-09') },

    // natural-dye-workshop
    { userId: tAnna.id,  experienceId: eNaturalDye.id, rating: 5, comment: "A hidden gem. Sidemen is utterly beautiful and the workshop was unlike anything I've done. My naturally dyed scarf is my favourite souvenir from Bali.", createdAt: new Date('2024-05-03') },
    { userId: tLucas.id, experienceId: eNaturalDye.id, rating: 4, comment: "Magical experience in a stunning setting. The drive to Sidemen is part of the adventure. Highly recommend combining with a night or two in the village.", createdAt: new Date('2024-03-28') },

    // wood-carving-workshop
    { userId: tThomas.id, experienceId: eWoodCarving.id, rating: 5, comment: "I Nyoman is a real master and an incredibly patient teacher. My carving is not perfect but I am incredibly proud of it. A truly special craft to learn.", createdAt: new Date('2024-04-16') },
    { userId: tYuki.id,   experienceId: eWoodCarving.id, rating: 4, comment: "Wonderful 4 hours. The workshop is beautiful and the village itself is worth a wander. A unique experience that you won't find in any other country.", createdAt: new Date('2024-03-07') },

    // rattan-weaving-class
    { userId: tSarah.id, experienceId: eRattan.id, rating: 5, comment: "Sitting with the women of the village, weaving and laughing together — this was the most authentic experience of my entire trip to Bali. The scenery is spectacular.", createdAt: new Date('2024-05-12') },
    { userId: tAnna.id,  experienceId: eRattan.id, rating: 5, comment: "Quiet, meditative, beautiful. Ayu is warm and encouraging. My little basket is one of my most treasured possessions.", createdAt: new Date('2024-04-09') },

    // sound-healing-session
    { userId: tRachel.id, experienceId: eSoundSession.id, rating: 5, comment: "One of the most profound experiences of my life. Nina holds the space with such grace. I left feeling like a completely new person.", createdAt: new Date('2024-05-08') },
    { userId: tLucas.id,  experienceId: eSoundSession.id, rating: 5, comment: "I was sceptical — not any more. The sound genuinely shifted something in me. The bamboo pavilion setting is magical. Totally transformative.", createdAt: new Date('2024-04-25') },
    { userId: tAnna.id,   experienceId: eSoundSession.id, rating: 5, comment: "Nina is extraordinary. I go every time I visit Bali — the experience deepens each time.", createdAt: new Date('2024-03-14') },

    // jamu-wellness-ritual
    { userId: tGiulia.id, experienceId: eJamu.id, rating: 5, comment: "This was unlike any wellness experience I've had. Ibu Wayan is a living encyclopedia of Balinese healing plants. The jamu tasted incredible — earthy, spicy, alive.", createdAt: new Date('2024-05-20') },
    { userId: tThomas.id, experienceId: eJamu.id, rating: 5, comment: "A beautiful two hours. Grinding spices by hand in a lush garden while Ibu Wayan explained every ingredient. Deeply calming and educational.", createdAt: new Date('2024-04-11') },

    // sunrise-yoga-ubud
    { userId: tAnna.id, experienceId: eSunriseYogaUbud.id, rating: 5, comment: "The most beautiful way to start a day. Egrets landing in the paddies during shavasana — I still think about it months later.", createdAt: new Date('2024-05-14') },
    { userId: tBen.id,  experienceId: eSunriseYogaUbud.id, rating: 5, comment: "Went three mornings in a row. The setting is incomparable. Kadek is patient and creates a genuinely welcoming space for all levels.", createdAt: new Date('2024-04-20') },

    // meditation-temple
    { userId: tPriya.id,  experienceId: eMeditationTemple.id, rating: 5, comment: "The temple at dawn with no one else there — one of the most peaceful experiences I have ever had. Wayan brings such calm and wisdom to the session.", createdAt: new Date('2024-05-01') },
    { userId: tThomas.id, experienceId: eMeditationTemple.id, rating: 4, comment: "A beautiful and unusual way to start a day in Bali. Highly recommend the early start — you have the gardens almost to yourself.", createdAt: new Date('2024-03-22') },

    // water-temple-ceremony
    { userId: tPriya.id,  experienceId: eWaterCeremony.id, rating: 5, comment: "Deeply moving. Wayan made sure we understood the meaning of every step. Standing in the holy spring with water streaming over your head — it cleanses something you didn't know needed cleansing.", createdAt: new Date('2024-04-30') },
    { userId: tThomas.id, experienceId: eWaterCeremony.id, rating: 4, comment: "A genuinely spiritual experience — not a tourist show. Wayan is deeply knowledgeable and deeply kind. Worth the early morning drive.", createdAt: new Date('2024-03-10') },

    // traditional-dance-class
    { userId: tAnna.id, experienceId: eDanceClass.id, rating: 5, comment: "Ni Nyoman is patient, precise, and deeply passionate. Even with two left feet, I learned enough to understand and truly appreciate the Legong performances I watched afterwards.", createdAt: new Date('2024-05-06') },
    { userId: tYuki.id, experienceId: eDanceClass.id, rating: 5, comment: "The costume session alone was worth it! But the teaching is the real gift. A completely unique experience.", createdAt: new Date('2024-04-01') },

    // kecak-fire-dance
    { userId: tGiulia.id, experienceId: eKecakFire.id, rating: 5, comment: "Absolutely extraordinary. The chanting builds into something overwhelming — one hundred voices becoming one sound. The fire walking finished me off completely.", createdAt: new Date('2024-05-17') },
    { userId: tFelix.id,  experienceId: eKecakFire.id, rating: 5, comment: "Don't miss this if you're in Bali. The cliffs are dramatic, the performance is mesmerising. Our guide made the whole experience so much richer.", createdAt: new Date('2024-04-28') },
    { userId: tYuki.id,   experienceId: eKecakFire.id, rating: 5, comment: "A truly magical evening. We arrived early, explored the temple, watched the full sunset — the kecak was the crescendo of a perfect afternoon.", createdAt: new Date('2024-03-31') },

    // balinese-history-tour
    { userId: tLucas.id, experienceId: eHistoryTour.id, rating: 5, comment: "The depth of knowledge is astonishing. I have been coming to Bali for ten years and learned more in three hours than in all my previous visits combined.", createdAt: new Date('2024-05-03') },
    { userId: tAnna.id,  experienceId: eHistoryTour.id, rating: 4, comment: "Fascinating tour. Klungkung is the most undervisited historical site in Bali. The Kerta Gosa ceiling alone justifies the trip.", createdAt: new Date('2024-03-19') },

    // coffee-plantation-tour
    { userId: tThomas.id, experienceId: eCoffee.id, rating: 5, comment: "Ketut is a wonderful host with encyclopedic knowledge of coffee. The plantation views over Lake Batur are stunning and the coffee is genuinely excellent.", createdAt: new Date('2024-05-11') },
    { userId: tSarah.id,  experienceId: eCoffee.id, rating: 5, comment: "The beans we roasted on the clay pot and then drank immediately were the best coffee of my life. Not an exaggeration. The fresh roast is extraordinary.", createdAt: new Date('2024-04-02') },

    // ubud-market-food-tour
    { userId: tAnna.id,  experienceId: eFoodTour.id, rating: 5, comment: "Putu is a superb guide and clearly loves every bite. The pre-dawn market is spectacular — so much colour and noise and wonderful smells. The nasi campur alone was worth waking up for.", createdAt: new Date('2024-05-09') },
    { userId: tFelix.id, experienceId: eFoodTour.id, rating: 5, comment: "I have done food tours in ten countries and this is in my top three. Putu's knowledge of Balinese food culture is extraordinary. Book the early slot.", createdAt: new Date('2024-04-16') },

    // mount-batur-sunrise
    { userId: tFelix.id,  experienceId: eMountBatur.id, rating: 5, comment: "The sunrise from the summit is genuinely one of the most beautiful things I've seen. Wayan is funny, safe, and knows the mountain perfectly. Do not skip the banana toast warmed on the volcano — surreal and delicious.", createdAt: new Date('2024-05-18') },
    { userId: tGiulia.id, experienceId: eMountBatur.id, rating: 5, comment: "Tough trek but every step worth it. We summited just as the light hit Mount Agung across the lake. The safety briefing was thorough and the stories about the volcano kept us going.", createdAt: new Date('2024-04-07') },
    { userId: tLucas.id,  experienceId: eMountBatur.id, rating: 4, comment: "Extraordinary experience. Bring warm layers — the summit is cold. The descent through the lava fields is almost as impressive as the sunrise.", createdAt: new Date('2024-03-24') },

    // rice-terrace-trek
    { userId: tSarah.id,  experienceId: eRiceTrek.id, rating: 5, comment: "Going into the valley below the tourist path changes everything. Gede showed us parts of the terrace that were stunning precisely because no one else was there.", createdAt: new Date('2024-05-16') },
    { userId: tThomas.id, experienceId: eRiceTrek.id, rating: 4, comment: "Planting a rice seedling sounds gimmicky but was surprisingly moving. These farmers do this every day. Gede explained the subak in a way I will never forget.", createdAt: new Date('2024-04-03') },

    // waterfall-hidden-canyon
    { userId: tBen.id,   experienceId: eWaterfall.id, rating: 5, comment: "The cliff jump at 12 metres was the most exhilarating thing I've done in years. The safety briefing was thorough and I felt completely confident. The waterfall itself is extraordinary.", createdAt: new Date('2024-05-22') },
    { userId: tAnna.id,  experienceId: eWaterfall.id, rating: 5, comment: "If you're after the adventurous side of Bali away from the crowds — this is it. Four waterfalls, jungle, natural pools, rock slides. Perfect day.", createdAt: new Date('2024-04-15') },
    { userId: tLucas.id, experienceId: eWaterfall.id, rating: 5, comment: "The drive to North Bali already feels like a different country. The waterfall canyon is breathtaking and the jumping was terrifying and brilliant.", createdAt: new Date('2024-03-28') },

    // surfing-lesson-canggu
    { userId: tLucas.id, experienceId: eSurfCanggu.id, rating: 5, comment: "Komang is the perfect teacher — calm, funny, and incredibly good at reading what each student needs. I stood up on my second attempt. Couldn't believe it.", createdAt: new Date('2024-05-19') },
    { userId: tSarah.id, experienceId: eSurfCanggu.id, rating: 5, comment: "The WhatsApp photos of me riding waves are my favourite photos from the entire trip. Such a brilliant morning. Small group made all the difference.", createdAt: new Date('2024-04-08') },

    // sup-seminyak
    { userId: tGiulia.id, experienceId: eSup.id, rating: 5, comment: "Perfect way to start the day — calm water, gorgeous light, and Wayan is a brilliant teacher. Went from complete beginner to paddling confidently in forty minutes.", createdAt: new Date('2024-05-07') },
    { userId: tThomas.id, experienceId: eSup.id, rating: 4, comment: "Really enjoyable. The early start is worth it — the beach is beautiful before the crowds. Good instructor, safe equipment.", createdAt: new Date('2024-04-01') },
  ]})

  console.log('✅ Seeded:')
  console.log('   • 25 users (15 operators, 10 tourists)')
  console.log('   • 15 operators')
  console.log('   • 31 experiences')
  console.log('   • 73 reviews')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
