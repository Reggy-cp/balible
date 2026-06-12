import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding service providers and listings...')

  // ── Provider 1: Wellness & Beauty ─────────────────────────────────────────
  const user1 = await prisma.user.upsert({
    where: { email: 'dewi.wellness@balible.com' },
    update: {},
    create: {
      name: 'Dewi Ayu',
      email: 'dewi.wellness@balible.com',
      role: 'PROVIDER',
    },
  })

  const provider1 = await prisma.provider.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      businessName: 'Dewi Spa & Beauty',
      description: 'Certified Balinese massage therapist with 10 years of experience. I bring the full spa experience to your villa — organic oils, hot stones, and authentic Balinese techniques.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      verified: true,
      rating: 4.9,
      totalReviews: 142,
    },
  })

  await prisma.serviceListing.upsert({
    where: { slug: 'balinese-massage-in-villa-canggu' },
    update: {},
    create: {
      slug: 'balinese-massage-in-villa-canggu',
      providerId: provider1.id,
      title: 'Balinese Massage at Your Villa',
      description: 'A deeply relaxing full-body Balinese massage using warm coconut oil and traditional techniques. I arrive at your villa with everything needed — massage table, oils, music, and aromatherapy. Perfect after a long flight or a surf session.',
      category: 'WELLNESS_BEAUTY',
      subcategory: 'Balinese Massage',
      area: 'CANGGU',
      priceType: 'HOURLY',
      price: 200000,
      images: [
        'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
      ],
      highlights: [
        'Certified Balinese massage therapist',
        'All equipment and oils included',
        'Available 7 days a week, 8am–9pm',
        'Can serve couples simultaneously',
      ],
      includes: ['Massage table & linens', 'Organic coconut & essential oils', 'Aromatherapy setup', 'Hot towels'],
      excludes: ['Tips (appreciated)', 'Travel fee outside Canggu area'],
      instantConfirm: true,
      featured: true,
      rating: 4.9,
      totalReviews: 87,
    },
  })

  await prisma.serviceListing.upsert({
    where: { slug: 'bridal-makeup-bali' },
    update: {},
    create: {
      slug: 'bridal-makeup-bali',
      providerId: provider1.id,
      title: 'Bridal & Event Makeup',
      description: 'Professional makeup for brides, prewedding shoots, and special events. I use premium brands (MAC, Charlotte Tilbury, NARS) and tailor the look to your vision — from natural glow to full glam. Includes a trial session.',
      category: 'WELLNESS_BEAUTY',
      subcategory: 'Bridal Makeup',
      area: 'CANGGU',
      priceType: 'FIXED',
      price: 850000,
      images: [
        'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
      ],
      highlights: [
        'Premium international makeup brands',
        'Trial session included',
        'On-location at your villa or venue',
        'Long-wear formulas for all-day hold',
      ],
      includes: ['Trial session', 'Day-of makeup', 'Lashes', 'Touch-up kit for the day'],
      excludes: ['Hair styling', 'Bridesmaids (can be booked separately)'],
      instantConfirm: false,
      rating: 5.0,
      totalReviews: 34,
    },
  })

  // ── Provider 2: Photography & Content ─────────────────────────────────────
  const user2 = await prisma.user.upsert({
    where: { email: 'rian.photo@balible.com' },
    update: {},
    create: {
      name: 'Rian Saputra',
      email: 'rian.photo@balible.com',
      role: 'PROVIDER',
    },
  })

  const provider2 = await prisma.provider.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      businessName: 'Rian Lens Studio',
      description: 'Travel & lifestyle photographer based in Bali. I shoot couples, solo travelers, families, and content creators at Bali\'s most iconic and hidden locations. Drone certified.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      verified: true,
      rating: 4.8,
      totalReviews: 96,
    },
  })

  await prisma.serviceListing.upsert({
    where: { slug: 'couples-photoshoot-ubud-rice-fields' },
    update: {},
    create: {
      slug: 'couples-photoshoot-ubud-rice-fields',
      providerId: provider2.id,
      title: 'Couples Photoshoot — Ubud Rice Fields',
      description: 'A golden-hour couples shoot at Tegallalang or Campuhan Ridge Walk. I handle location scouting, posing guidance, and same-week delivery of 60+ edited images. Great for anniversaries, honeymoons, or just a beautiful memory.',
      category: 'PHOTOGRAPHY_CONTENT',
      subcategory: 'Couples & Pre-Wedding Shoot',
      area: 'UBUD',
      priceType: 'FIXED',
      price: 1500000,
      images: [
        'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
      ],
      highlights: [
        '2-hour golden hour shoot',
        '60+ professionally edited photos',
        'Iconic Bali rice field backdrop',
        'Delivered within 5 days',
      ],
      includes: ['Location scouting', '2 hours shooting', '60+ edited digital photos', 'Private online gallery'],
      excludes: ['Prints', 'Drone shots (add-on available)', 'Transport to location'],
      instantConfirm: true,
      featured: true,
      rating: 4.9,
      totalReviews: 61,
    },
  })

  await prisma.serviceListing.upsert({
    where: { slug: 'content-creator-package-bali' },
    update: {},
    create: {
      slug: 'content-creator-package-bali',
      providerId: provider2.id,
      title: 'Content Creator Day Package',
      description: 'Full-day content creation for influencers, travel bloggers, and brands. We hit 3–4 locations across Bali, shooting photos and short-form video (Reels, TikTok) throughout the day. You leave with a week\'s worth of content.',
      category: 'PHOTOGRAPHY_CONTENT',
      subcategory: 'Content Creator (Lifestyle / Travel)',
      area: 'CANGGU',
      priceType: 'DAILY',
      price: 3500000,
      images: [
        'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
      ],
      highlights: [
        'Full day (8 hours) at multiple locations',
        '100+ photos + short-form video clips',
        'Trending audio & caption suggestions',
        'Perfect for Instagram & TikTok',
      ],
      includes: ['8 hours shooting', '3–4 Bali locations', '100+ edited photos', 'Raw video footage + 3 edited Reels'],
      excludes: ['Outfits & styling', 'Paid entrance fees', 'Transport fuel'],
      instantConfirm: false,
      rating: 4.8,
      totalReviews: 28,
    },
  })

  // ── Provider 3: Transportation ─────────────────────────────────────────────
  const user3 = await prisma.user.upsert({
    where: { email: 'made.driver@balible.com' },
    update: {},
    create: {
      name: 'Made Sudiarta',
      email: 'made.driver@balible.com',
      role: 'PROVIDER',
    },
  })

  const provider3 = await prisma.provider.upsert({
    where: { userId: user3.id },
    update: {},
    create: {
      userId: user3.id,
      businessName: 'Made Bali Driver',
      description: 'Professional English-speaking driver with 8 years of experience. Clean, air-conditioned vehicles. I know every corner of Bali — from temple hops to hidden waterfalls. Available for airport transfers and custom day tours.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      verified: true,
      rating: 4.9,
      totalReviews: 218,
    },
  })

  await prisma.serviceListing.upsert({
    where: { slug: 'private-driver-bali-full-day' },
    update: {},
    create: {
      slug: 'private-driver-bali-full-day',
      providerId: provider3.id,
      title: 'Private Driver — Full Day Bali',
      description: 'A fully flexible full-day private driver service. I pick you up from your villa and take you wherever you want — temples, rice terraces, waterfalls, beaches, markets. You set the itinerary or I can suggest the best route for your interests.',
      category: 'TRANSPORTATION',
      subcategory: 'Private Driver (Full Day)',
      area: 'UBUD',
      priceType: 'DAILY',
      price: 600000,
      images: [
        'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
      ],
      highlights: [
        '10 hours, fully flexible itinerary',
        'English-speaking, knowledgeable guide',
        'Air-conditioned Toyota Innova',
        'Pickup anywhere in Bali',
      ],
      includes: ['10 hours driving', 'Fuel', 'Parking fees', 'Bottled water'],
      excludes: ['Entrance fees', 'Meals', 'Tips (appreciated)'],
      instantConfirm: true,
      featured: true,
      rating: 4.9,
      totalReviews: 134,
    },
  })

  await prisma.serviceListing.upsert({
    where: { slug: 'airport-transfer-bali' },
    update: {},
    create: {
      slug: 'airport-transfer-bali',
      providerId: provider3.id,
      title: 'Airport Transfer — Ngurah Rai Airport',
      description: 'Reliable, on-time airport pickups and drop-offs. I track your flight, meet you at arrivals with a name board, and get you to your villa comfortably. No surprises — fixed price, no meter.',
      category: 'TRANSPORTATION',
      subcategory: 'Airport Transfer',
      area: 'KUTA',
      priceType: 'FIXED',
      price: 250000,
      images: [
        'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=80',
      ],
      highlights: [
        'Flight tracking — always on time',
        'Name board at arrivals',
        'Fixed price, no hidden fees',
        'Available 24/7',
      ],
      includes: ['Meet & greet at arrivals', 'Luggage assistance', 'Bottled water', 'Up to 60 min wait'],
      excludes: ['Toll fees (if applicable)', 'Long-distance surcharge (>40km)'],
      instantConfirm: true,
      rating: 5.0,
      totalReviews: 84,
    },
  })

  // ── Provider 4: Fitness & Coaching ────────────────────────────────────────
  const user4 = await prisma.user.upsert({
    where: { email: 'ayu.yoga@balible.com' },
    update: {},
    create: {
      name: 'Ayu Pertiwi',
      email: 'ayu.yoga@balible.com',
      role: 'PROVIDER',
    },
  })

  const provider4 = await prisma.provider.upsert({
    where: { userId: user4.id },
    update: {},
    create: {
      userId: user4.id,
      businessName: 'Ayu Yoga & Wellness',
      description: 'RYT-500 certified yoga teacher and meditation guide. I offer private sessions at your villa, tailored to your level and goals — from beginner flows to advanced pranayama and meditation.',
      avatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&auto=format&fit=crop&q=80',
      verified: true,
      rating: 5.0,
      totalReviews: 73,
    },
  })

  await prisma.serviceListing.upsert({
    where: { slug: 'private-yoga-in-villa-seminyak' },
    update: {},
    create: {
      slug: 'private-yoga-in-villa-seminyak',
      providerId: provider4.id,
      title: 'Private Yoga at Your Villa',
      description: 'Start your Bali morning with a private yoga session tailored entirely to you. I bring mats, blocks, and straps. Whether you\'re a complete beginner or experienced practitioner, we design each session around your goals and energy.',
      category: 'FITNESS_COACHING',
      subcategory: 'Private Yoga (In-Villa)',
      area: 'SEMINYAK',
      priceType: 'HOURLY',
      price: 300000,
      images: [
        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
      ],
      highlights: [
        'RYT-500 certified instructor',
        'Tailored to your level & goals',
        'All equipment provided',
        'Available 6am–8pm daily',
      ],
      includes: ['Yoga mats, blocks & straps', 'Personalised session plan', 'Breathing techniques', 'Optional 15-min meditation at end'],
      excludes: ['Travel fee outside Seminyak/Kerobokan'],
      instantConfirm: true,
      featured: true,
      rating: 5.0,
      totalReviews: 52,
    },
  })

  // ── Provider 5: Villa Service ──────────────────────────────────────────────
  const user5 = await prisma.user.upsert({
    where: { email: 'ketut.clean@balible.com' },
    update: {},
    create: {
      name: 'Ketut Wijaya',
      email: 'ketut.clean@balible.com',
      role: 'PROVIDER',
    },
  })

  const provider5 = await prisma.provider.upsert({
    where: { userId: user5.id },
    update: {},
    create: {
      userId: user5.id,
      businessName: 'Ketut Clean Team',
      description: 'Professional villa cleaning and laundry service trusted by Airbnb Superhosts across Bali. Eco-friendly products, thorough turnovers, and flexible scheduling.',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
      verified: true,
      rating: 4.8,
      totalReviews: 109,
    },
  })

  await prisma.serviceListing.upsert({
    where: { slug: 'villa-deep-cleaning-bali' },
    update: {},
    create: {
      slug: 'villa-deep-cleaning-bali',
      providerId: provider5.id,
      title: 'Villa Deep Cleaning',
      description: 'Full deep clean for 2–5 bedroom villas. We clean every room, bathroom, kitchen, and outdoor area thoroughly. Trusted by Airbnb Superhosts for guest turnovers and monthly deep cleans. Eco-friendly products available on request.',
      category: 'VILLA_SERVICE',
      subcategory: 'Deep Cleaning',
      area: 'CANGGU',
      priceType: 'FIXED',
      price: 450000,
      images: [
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1527515545081-5db817172677?w=800&auto=format&fit=crop&q=80',
      ],
      highlights: [
        'Trusted by Airbnb Superhosts',
        '2–5 bedroom villas covered',
        'Eco-friendly products available',
        'Pool area and outdoor spaces included',
      ],
      includes: ['All bedrooms & bathrooms', 'Kitchen deep clean', 'Living areas', 'Outdoor & pool deck', 'Cleaning products & equipment'],
      excludes: ['Laundry (can be added)', 'Window exterior', 'Garden maintenance'],
      instantConfirm: false,
      rating: 4.8,
      totalReviews: 67,
    },
  })

  // ── Provider 6: Pet Service ────────────────────────────────────────────────
  const user6 = await prisma.user.upsert({
    where: { email: 'sari.pets@balible.com' },
    update: {},
    create: {
      name: 'Sari Lestari',
      email: 'sari.pets@balible.com',
      role: 'PROVIDER',
    },
  })

  const provider6 = await prisma.provider.upsert({
    where: { userId: user6.id },
    update: {},
    create: {
      userId: user6.id,
      businessName: 'Sari Pet Care Bali',
      description: 'Animal lover and trained pet caregiver. I walk, sit, and care for dogs and cats while their owners travel around Bali. Updates via WhatsApp throughout the day.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b0e57a95?w=200&auto=format&fit=crop&q=80',
      verified: true,
      rating: 5.0,
      totalReviews: 48,
    },
  })

  await prisma.serviceListing.upsert({
    where: { slug: 'dog-walking-seminyak-canggu' },
    update: {},
    create: {
      slug: 'dog-walking-seminyak-canggu',
      providerId: provider6.id,
      title: 'Dog Walking — Seminyak & Canggu',
      description: 'Daily dog walks for your pup while you explore Bali. I pick up from your villa, walk for 1 hour in a safe route, and return home. Photo updates sent via WhatsApp so you know they\'re happy.',
      category: 'PET_SERVICE',
      subcategory: 'Dog Walking',
      area: 'SEMINYAK',
      priceType: 'FIXED',
      price: 120000,
      images: [
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop&q=80',
      ],
      highlights: [
        '1-hour walk per session',
        'WhatsApp photo updates',
        'Pickup & dropoff at your villa',
        'Available daily, 7am–6pm',
      ],
      includes: ['1-hour walk', 'Pickup & dropoff', 'Water & treats', 'WhatsApp updates'],
      excludes: ['More than 2 dogs (surcharge applies)', 'Areas outside Seminyak/Canggu'],
      instantConfirm: true,
      featured: true,
      rating: 5.0,
      totalReviews: 31,
    },
  })

  console.log('✅ Seeded 6 providers and 9 service listings')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
