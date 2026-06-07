import { PrismaClient, Category, Area, Status } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Balible database...')

  // ── Clean slate ─────────────────────────────────────────────────────────────
  await prisma.review.deleteMany()
  await prisma.wishlistItem.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.experience.deleteMany()
  await prisma.operator.deleteMany()
  await prisma.user.deleteMany()

  // ── Operator Users ──────────────────────────────────────────────────────────
  const madeSari = await prisma.user.create({
    data: {
      name: 'Made Sari',
      email: 'made.sari@balible.com',
      role: 'OPERATOR',
      image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80',
    },
  })
  const ketutSuardana = await prisma.user.create({
    data: {
      name: 'Ketut Suardana',
      email: 'ketut.suardana@balible.com',
      role: 'OPERATOR',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&auto=format&fit=crop&q=80',
    },
  })
  const wayanGede = await prisma.user.create({
    data: {
      name: 'Wayan Gede',
      email: 'wayan.gede@balible.com',
      role: 'OPERATOR',
      image: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=200&auto=format&fit=crop&q=80',
    },
  })

  // ── Operators ───────────────────────────────────────────────────────────────
  const opMade = await prisma.operator.create({
    data: {
      userId: madeSari.id,
      businessName: 'Made Sari Pottery Studio',
      description: 'Third-generation Balinese potter offering authentic clay experiences in the heart of Ubud.',
      avatar: madeSari.image,
      verified: true,
      rating: 4.9,
      totalReviews: 128,
    },
  })
  const opKetut = await prisma.operator.create({
    data: {
      userId: ketutSuardana.id,
      businessName: 'Ketut Silvercraft Celuk',
      description: 'Master silversmith and wellness practitioner from Celuk, Bali\'s traditional silversmithing village.',
      avatar: ketutSuardana.image,
      verified: true,
      rating: 4.85,
      totalReviews: 272,
    },
  })
  const opWayan = await prisma.operator.create({
    data: {
      userId: wayanGede.id,
      businessName: 'Wayan Gede Experiences',
      description: 'Certified temple guide and cultural interpreter offering deep dives into Balinese Hindu tradition.',
      avatar: wayanGede.image,
      verified: true,
      rating: 4.8,
      totalReviews: 256,
    },
  })

  // ── Tourist Users (for reviews) ─────────────────────────────────────────────
  const sarah = await prisma.user.create({ data: { name: 'Sarah K.', email: 'sarah.k@example.com', image: null } })
  const thomas = await prisma.user.create({ data: { name: 'Thomas R.', email: 'thomas.r@example.com', image: null } })
  const priya = await prisma.user.create({ data: { name: 'Priya M.', email: 'priya.m@example.com', image: null } })
  const lucas = await prisma.user.create({ data: { name: 'Lucas B.', email: 'lucas.b@example.com', image: null } })
  const yuki = await prisma.user.create({ data: { name: 'Yuki T.', email: 'yuki.t@example.com', image: null } })

  // ── Experiences ─────────────────────────────────────────────────────────────

  const exp1 = await prisma.experience.create({
    data: {
      slug: 'pottery-making-class',
      operatorId: opMade.id,
      title: 'Pottery Making Class',
      description: 'Step into a world of clay and creativity in the heart of Ubud. Guided by Made Sari — a third-generation Balinese potter — you\'ll learn the ancient art of hand-building and wheel throwing in a lush rice terrace compound. All skill levels welcome; beginners and experienced potters alike leave with a piece they made by hand.',
      category: Category.WELLNESS,
      area: Area.UBUD,
      price: 450000,
      duration: '2.5 hours',
      level: 'All levels',
      language: 'English',
      maxGuests: 8,
      images: [
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1616627428492-37e14fac6e14?w=400&h=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&h=300&auto=format&fit=crop&q=80',
      ],
      highlights: [
        'Hand-build with third-generation Balinese potter Made Sari',
        'Learn traditional and modern wheel-throwing techniques',
        'Create your own vessel to take home (after drying and firing)',
        'Set in a lush rice terrace compound in the heart of Ubud',
        'All materials and tools provided — no experience needed',
      ],
      includes: ['All clay and materials', 'Use of potter\'s wheel and tools', 'Glazing materials', 'Finished piece to take home', 'Welcome drink'],
      excludes: ['Transport to studio', 'Gratuities', 'Additional clay purchases'],
      meetingPoint: 'Made Sari Pottery Studio, Jl. Raya Tegallalang, Ubud',
      latitude: -8.4095,
      longitude: 115.2819,
      instantConfirm: true,
      ecoLabel: true,
      featured: true,
      rating: 4.9,
      totalReviews: 128,
      status: Status.ACTIVE,
    },
  })

  const exp2 = await prisma.experience.create({
    data: {
      slug: 'silver-jewelry-workshop',
      operatorId: opKetut.id,
      title: 'Silver Jewelry Workshop',
      description: 'In Celuk — Bali\'s traditional silversmithing village — master craftsman Ketut Suardana guides you through the complete process of creating your own sterling silver piece. Using authentic tools and traditional Balinese techniques, you\'ll leave with a ring, pendant, or bracelet you made entirely by hand.',
      category: Category.ART_CRAFT,
      area: Area.CANGGU,
      price: 550000,
      duration: '3 hours',
      level: 'All levels',
      language: 'English',
      maxGuests: 6,
      images: [
        'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&h=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&auto=format&fit=crop&q=80',
      ],
      highlights: [
        'Craft your own silver ring, pendant, or bracelet from scratch',
        'Learn traditional Balinese silversmithing from master craftsman Ketut',
        'Work with real sterling silver using authentic artisan tools',
        'Take home a unique piece of fine jewelry you made yourself',
        'Located in Celuk, Bali\'s renowned silversmithing village',
      ],
      includes: ['Sterling silver materials (up to 10g)', 'All tools and equipment', 'Finished jewelry piece', 'Polishing and final finishing', 'Branded keepsake box'],
      excludes: ['Transport to workshop', 'Additional silver materials', 'Gratuities'],
      meetingPoint: 'Ketut Silvercraft Studio, Jl. Celuk, Gianyar, Bali',
      latitude: -8.5611,
      longitude: 115.2753,
      instantConfirm: false,
      ecoLabel: false,
      featured: true,
      rating: 4.8,
      totalReviews: 94,
      status: Status.ACTIVE,
    },
  })

  const exp3 = await prisma.experience.create({
    data: {
      slug: 'sound-healing-journey',
      operatorId: opKetut.id,
      title: 'Sound Healing Journey',
      description: 'Surrender to the healing frequencies of Tibetan singing bowls and crystal bowls in a private jungle setting in Ubud. Guided by certified sound healing practitioner Nina Putri, this immersive 90-minute session uses vibration and resonance to release tension, balance your energy, and restore deep stillness.',
      category: Category.WELLNESS,
      area: Area.UBUD,
      price: 350000,
      duration: '90 minutes',
      level: 'All levels',
      language: 'English',
      maxGuests: 12,
      images: [
        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400&h=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&auto=format&fit=crop&q=80',
      ],
      highlights: [
        'Full-body relaxation through Tibetan and crystal singing bowls',
        'Guided by Nina Putri, certified sound healing practitioner',
        'Private jungle setting with natural ambient soundscape',
        'Includes chakra balancing and breathwork integration',
        'Post-session herbal tea and reflection journaling',
      ],
      includes: ['60-minute sound bath session', 'Herbal tea and light snacks', 'Reflection journal', 'Post-session wellness guide', 'Yoga mat and blanket'],
      excludes: ['Transport to studio', 'Personal purchases'],
      meetingPoint: 'Yoga Barn Annex, Jl. Hanoman, Ubud',
      latitude: -8.5161,
      longitude: 115.2625,
      instantConfirm: true,
      ecoLabel: true,
      featured: true,
      rating: 4.8,
      totalReviews: 178,
      status: Status.ACTIVE,
    },
  })

  const exp4 = await prisma.experience.create({
    data: {
      slug: 'water-temple-purification',
      operatorId: opWayan.id,
      title: 'Water Temple Purification',
      description: 'Experience the sacred Melukat purification ritual at Tirta Empul, one of Bali\'s holiest water temples. Guided by Wayan Gede — a certified temple guide from a priestly family in Gianyar — you\'ll wade through 13 sacred spring pools, receiving blessings as Balinese Hindus have done for over 1,000 years.',
      category: Category.CULTURE,
      area: Area.GIANYAR,
      price: 600000,
      duration: '4 hours',
      level: 'All levels',
      language: 'English',
      maxGuests: 10,
      images: [
        'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80',
      ],
      highlights: [
        'Authentic Melukat purification ceremony at Tirta Empul',
        'Guided by Wayan Gede, a certified temple guide from Gianyar',
        'Traditional sarong and sash provided for entry to sacred sites',
        'Visit two additional temple complexes in the Gianyar area',
        'Learn about Balinese Hindu philosophy and living traditions',
      ],
      includes: ['Traditional sarong and sash rental', 'Entrance fees to all temples', 'Certified local guide', 'Bottled water', 'Blessing flower offerings (canang sari)'],
      excludes: ['Transport to temples', 'Personal camera equipment', 'Gratuities for temple staff'],
      meetingPoint: 'Tirta Empul Temple Carpark, Tampaksiring, Gianyar',
      latitude: -8.4153,
      longitude: 115.3151,
      instantConfirm: false,
      ecoLabel: true,
      featured: true,
      rating: 4.8,
      totalReviews: 78,
      status: Status.ACTIVE,
    },
  })

  const exp5 = await prisma.experience.create({
    data: {
      slug: 'sunrise-yoga-rice-fields',
      operatorId: opMade.id,
      title: 'Sunrise Yoga at Rice Fields',
      description: 'Greet the Balinese sunrise with a mindful yoga practice set among the emerald terraces of Tegallalang. Our certified instructor leads a gentle flow followed by breathwork and meditation as the mist rises over the rice paddies. Finish with a nourishing breakfast of fresh tropical fruit and local dishes.',
      category: Category.WELLNESS,
      area: Area.UBUD,
      price: 250000,
      duration: '90 minutes',
      level: 'All levels',
      language: 'English',
      maxGuests: 15,
      images: [
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400&h=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400&h=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&auto=format&fit=crop&q=80',
      ],
      highlights: [
        'Golden hour yoga overlooking Tegallalang Rice Terraces',
        'Led by a certified yoga instructor with 15+ years experience',
        'Suitable for all levels — modifications always offered',
        'Healthy Balinese breakfast included after the session',
        'Small group — maximum 15 people for personal attention',
      ],
      includes: ['Yoga mat and props', 'Healthy breakfast after session', 'Welcome coconut water', 'Certified instructor', 'Downloadable home practice guide'],
      excludes: ['Transport to rice terraces', 'Personal items', 'Gratuities'],
      meetingPoint: 'Tegallalang Rice Terrace viewpoint, Ubud',
      latitude: -8.4082,
      longitude: 115.2818,
      instantConfirm: true,
      ecoLabel: true,
      featured: false,
      rating: 4.9,
      totalReviews: 203,
      status: Status.ACTIVE,
    },
  })

  const exp6 = await prisma.experience.create({
    data: {
      slug: 'balinese-cooking-class',
      operatorId: opWayan.id,
      title: 'Balinese Cooking Class',
      description: 'Begin your culinary journey at a local morning market before heading to a traditional compound kitchen in Canggu to cook five authentic Balinese dishes from scratch. Learn to create the sacred spice paste — base genep — the heart of Balinese cuisine, and sit down to eat everything you\'ve cooked.',
      category: Category.FOOD_DRINK,
      area: Area.CANGGU,
      price: 450000,
      duration: '4 hours',
      level: 'All levels',
      language: 'English',
      maxGuests: 8,
      images: [
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
      ],
      highlights: [
        'Morning market tour to source fresh, hyper-local ingredients',
        'Cook 5 traditional Balinese dishes — from lawar to black rice pudding',
        'Master the base genep, the sacred Balinese spice paste',
        'Take home a printed recipe booklet and cooking guide',
        'Eat what you cook — sit down to a full Balinese feast at the end',
      ],
      includes: ['Morning market tour', 'All ingredients', 'Full 5-dish Balinese meal', 'Recipe booklet to take home', 'Welcome drink'],
      excludes: ['Transport to market and kitchen', 'Alcoholic beverages', 'Gratuities'],
      meetingPoint: 'Pasar Canggu morning market, Jl. Batu Bolong, Canggu',
      latitude: -8.6475,
      longitude: 115.1354,
      instantConfirm: true,
      ecoLabel: false,
      featured: false,
      rating: 4.7,
      totalReviews: 145,
      status: Status.ACTIVE,
    },
  })

  const exp7 = await prisma.experience.create({
    data: {
      slug: 'mount-batur-sunrise-trek',
      operatorId: opWayan.id,
      title: 'Mount Batur Sunrise Trek',
      description: 'Summit Bali\'s sacred active volcano at 1,717 metres before dawn and watch the sun rise over the crater lake and Mount Agung. Your certified guide leads you on a 2-hour ascent through volcanic ash fields. At the summit, cook eggs in natural steam vents. Descend to a hot spring soak at Toya Bungkah.',
      category: Category.NATURE,
      area: Area.KINTAMANI,
      price: 750000,
      duration: '8 hours',
      level: 'Moderate',
      language: 'English',
      maxGuests: 12,
      images: [
        'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80',
      ],
      highlights: [
        'Summit Bali\'s sacred active volcano at 1,717m elevation',
        'Witness a 360° panoramic sunrise view from the crater rim',
        'Professional certified guide with 10+ years of trekking experience',
        'Cook eggs in natural volcanic steam vents at the summit',
        'Hot spring soak in Toya Bungkah natural pools after descent',
      ],
      includes: ['Certified trekking guide', 'Headlamp and trekking poles rental', 'Summit breakfast (eggs, banana, toast)', 'Hot spring Toya Bungkah entry', 'Bottled water'],
      excludes: ['Transport from Ubud/Canggu to base camp', 'Personal travel insurance', 'Gratuities'],
      meetingPoint: 'Toya Bungkah Village base camp, Kintamani, Bangli',
      latitude: -8.2428,
      longitude: 115.3757,
      instantConfirm: false,
      ecoLabel: false,
      featured: false,
      rating: 4.8,
      totalReviews: 312,
      status: Status.ACTIVE,
    },
  })

  const exp8 = await prisma.experience.create({
    data: {
      slug: 'traditional-batik-workshop',
      operatorId: opMade.id,
      title: 'Traditional Batik Workshop',
      description: 'Discover the ancient Indonesian art of wax-resist dyeing in a traditional Balinese arts village in Ubud. You\'ll design your own motif, apply hot wax with a traditional canting tool and copper block stamps, then dip your fabric into vibrant natural dyes. Leave with a unique piece of wearable art you made entirely by hand.',
      category: Category.ART_CRAFT,
      area: Area.UBUD,
      price: 380000,
      duration: '3 hours',
      level: 'All levels',
      language: 'English',
      maxGuests: 10,
      images: [
        'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&h=300&auto=format&fit=crop&q=80',
      ],
      highlights: [
        'Learn the ancient Indonesian art of wax-resist dyeing',
        'Design your own motif using traditional Balinese patterns',
        'Use a hand canting tool and traditional copper stamp blocks',
        'Take home your finished batik fabric creation',
        'Located in a traditional Balinese arts village in Ubud',
      ],
      includes: ['All batik materials (wax, dye, fabric)', 'Traditional canting tool and copper stamps', 'Apron and protective gloves', 'Finished batik piece to take home', 'Certificate of participation'],
      excludes: ['Transport to workshop', 'Additional materials', 'Gratuities'],
      meetingPoint: 'Ubud Arts Village, Jl. Raya Andong, Ubud',
      latitude: -8.4930,
      longitude: 115.2670,
      instantConfirm: true,
      ecoLabel: false,
      featured: false,
      rating: 4.6,
      totalReviews: 88,
      status: Status.ACTIVE,
    },
  })

  // ── Reviews ──────────────────────────────────────────────────────────────────

  const reviewData = [
    // Pottery (exp1)
    { userId: sarah.id, experienceId: exp1.id, rating: 5, comment: 'Absolutely magical. Made is an incredible teacher — patient, encouraging, and full of beautiful stories about her family\'s craft. I made a small bowl that I treasure deeply.', createdAt: new Date('2024-05-12') },
    { userId: thomas.id, experienceId: exp1.id, rating: 5, comment: 'One of the best experiences I\'ve had in Bali. The studio setting is serene, and you genuinely leave with something you shaped with your own hands. Highly recommend.', createdAt: new Date('2024-04-18') },
    { userId: priya.id, experienceId: exp1.id, rating: 5, comment: 'The location alone is worth it — surrounded by rice paddies with birdsong everywhere. Wonderful for couples or solo travellers. Made makes everyone feel at ease.', createdAt: new Date('2024-03-25') },

    // Jewelry (exp2)
    { userId: lucas.id, experienceId: exp2.id, rating: 5, comment: 'I\'ve done jewelry workshops before but this was on another level. Ketut\'s skill and patience are extraordinary. I wore my ring the moment I left.', createdAt: new Date('2024-05-08') },
    { userId: sarah.id, experienceId: exp2.id, rating: 5, comment: 'Made a beautiful silver ring for my partner. Ketut guided us through every step and made it feel achievable even for a beginner. The workshop space is lovely too.', createdAt: new Date('2024-04-02') },
    { userId: yuki.id, experienceId: exp2.id, rating: 4, comment: 'Great experience overall. The silver materials are real quality and the technique is authentic. Would give 5 stars but the workshop started 15 min late.', createdAt: new Date('2024-03-15') },

    // Sound Healing (exp3)
    { userId: priya.id, experienceId: exp3.id, rating: 5, comment: 'I went in curious and came out transformed. The resonance of the bowls settles something deep. Nina is a gifted healer. Already booked a second session.', createdAt: new Date('2024-05-17') },
    { userId: yuki.id, experienceId: exp3.id, rating: 5, comment: 'An hour of complete stillness. The jungle setting, the bowls, Nina\'s calm presence — everything was perfect. I fell asleep briefly and woke up feeling completely refreshed.', createdAt: new Date('2024-04-22') },
    { userId: thomas.id, experienceId: exp3.id, rating: 5, comment: 'I\'m skeptical of wellness experiences but this genuinely delivered. The vibrations you feel in your chest are incredible. Go with an open mind.', createdAt: new Date('2024-04-01') },

    // Water Temple (exp4)
    { userId: lucas.id, experienceId: exp4.id, rating: 5, comment: 'Wayan is a phenomenal guide — knowledgeable, respectful, and deeply connected to the culture. The purification ritual was one of the most moving things I\'ve ever done.', createdAt: new Date('2024-05-14') },
    { userId: sarah.id, experienceId: exp4.id, rating: 5, comment: 'We felt genuinely welcomed by the temple community, not like tourists passing through. Wayan explained everything so well. A once-in-a-lifetime experience.', createdAt: new Date('2024-04-10') },
    { userId: priya.id, experienceId: exp4.id, rating: 4, comment: 'Beautiful and deeply meaningful. The temple was busy on our visit which slightly reduced the sense of peace — but Wayan navigated it perfectly. Would still give 5 stars for the guide alone.', createdAt: new Date('2024-03-28') },

    // Yoga (exp5)
    { userId: yuki.id, experienceId: exp5.id, rating: 5, comment: 'Watching the sunrise over the rice terraces while in warrior pose is one of the most beautiful moments of my life. The instructor is wonderful and the breakfast was delicious.', createdAt: new Date('2024-05-20') },
    { userId: thomas.id, experienceId: exp5.id, rating: 5, comment: 'Perfect for all levels — I\'m a beginner and felt completely supported. The location is breathtaking. Do this on your first day in Bali to set the tone for your whole trip.', createdAt: new Date('2024-04-28') },
    { userId: lucas.id, experienceId: exp5.id, rating: 5, comment: 'The mist over the terraces at sunrise was ethereal. Great instruction, small group, and the coconut water at the start was a lovely touch. Highly recommend.', createdAt: new Date('2024-04-05') },

    // Cooking (exp6)
    { userId: priya.id, experienceId: exp6.id, rating: 5, comment: 'The market visit alone made this worth it. Learning to make base genep from scratch was a revelation. I\'ve recreated the nasi goreng at home three times since.', createdAt: new Date('2024-05-09') },
    { userId: sarah.id, experienceId: exp6.id, rating: 4, comment: 'Really fun and educational. The host was charming and the food was genuinely delicious. Only minor note is the kitchen could use better ventilation on a hot day.', createdAt: new Date('2024-04-15') },
    { userId: yuki.id, experienceId: exp6.id, rating: 5, comment: 'A full immersion in Balinese food culture. Five dishes felt ambitious but we did it! The feast at the end was spectacular. A must-do for food lovers.', createdAt: new Date('2024-03-30') },

    // Trek (exp7)
    { userId: thomas.id, experienceId: exp7.id, rating: 5, comment: 'Hardest thing I did on this trip and 100% worth it. Watching the sunrise from the crater rim while eating eggs cooked in volcanic steam — unforgettable. The guide was excellent.', createdAt: new Date('2024-05-15') },
    { userId: lucas.id, experienceId: exp7.id, rating: 5, comment: 'We started at 2am and reached the summit just as the sky turned pink. The hot spring soak after the descent was the perfect reward. Fit people of any age can do this.', createdAt: new Date('2024-04-22') },
    { userId: sarah.id, experienceId: exp7.id, rating: 5, comment: 'A bucket-list experience. The view from the rim is indescribable. Our guide kept the mood light and energetic on the steep final section. Bring warm layers — it\'s cold at the top.', createdAt: new Date('2024-04-08') },

    // Batik (exp8)
    { userId: yuki.id, experienceId: exp8.id, rating: 5, comment: 'I came expecting a craft class and left with a deep appreciation for the patience and artistry batik demands. My fabric turned out beautifully. Wonderful afternoon.', createdAt: new Date('2024-05-18') },
    { userId: priya.id, experienceId: exp8.id, rating: 4, comment: 'Creative and relaxing. The workshop space is charming and the instructor is skilled. My wax work was a bit uneven but that\'s part of the charm of handmade batik!', createdAt: new Date('2024-04-20') },
    { userId: thomas.id, experienceId: exp8.id, rating: 5, comment: 'Surprisingly meditative — the slow careful work of applying wax is almost like a moving meditation. A great introduction to an important Indonesian art form.', createdAt: new Date('2024-03-22') },
  ]

  for (const r of reviewData) {
    await prisma.review.create({ data: r })
  }

  console.log('✅ Seeded:')
  console.log('   • 8 users (3 operators, 5 tourists)')
  console.log('   • 3 operators')
  console.log('   • 8 experiences')
  console.log('   • 24 reviews')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
