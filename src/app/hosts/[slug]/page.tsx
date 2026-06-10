import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MapPin, Star, Clock, Users, Award, ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import WishlistHeart from '@/components/WishlistHeart'
import { prisma } from '@/lib/prisma'

// ── Host + experience data ────────────────────────────────────────────────────

type Experience = {
  slug: string; title: string; area: string; price: number
  duration: string; rating: number; reviews: number; category: string; image: string
}

type Host = {
  slug: string; name: string; businessName: string; area: string
  avatar: string | null; bio: string; rating: number; totalReviews: number
  memberSince: string; responseRate: string; languages: string[]
  experiences: Experience[]
}

const HOST_DB: Record<string, Host> = {
  'made-sari': {
    slug: 'made-sari', name: 'Made Sari', businessName: 'Made Sari Pottery Studio',
    area: 'Ubud', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',
    bio: 'Third-generation Balinese potter and artist based in the heart of Ubud. Made learned the craft from her grandmother and has been teaching visitors the ancient art of hand-building and wheel throwing for over 15 years. Her studio sits in a lush rice terrace compound where clay, creativity, and culture come together.',
    rating: 4.9, totalReviews: 128, memberSince: '2019', responseRate: '98%',
    languages: ['Balinese', 'Indonesian', 'English'],
    experiences: [
      { slug: 'pottery-making-class', title: 'Pottery Making Class', area: 'Ubud', price: 450000, duration: '2.5 hrs', rating: 4.9, reviews: 128, category: 'Art & Craft', image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop&q=80' },
    ],
  },
  'ketut-suardana': {
    slug: 'ketut-suardana', name: 'Ketut Suardana', businessName: 'Ketut Silver Artistry',
    area: 'Canggu', avatar: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop&q=80',
    bio: 'Second-generation Balinese silversmith with over 20 years of experience blending traditional craftsmanship with contemporary design. Ketut\'s studio is nestled in a coconut grove in Canggu, where he teaches guests the full arc of silversmithing — from raw metal to polished wearable art.',
    rating: 4.8, totalReviews: 94, memberSince: '2020', responseRate: '95%',
    languages: ['Balinese', 'Indonesian', 'English'],
    experiences: [
      { slug: 'silver-jewelry-workshop', title: 'Silver Jewelry Workshop', area: 'Canggu', price: 550000, duration: '3 hrs', rating: 4.8, reviews: 94, category: 'Art & Craft', image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&auto=format&fit=crop&q=80' },
    ],
  },
  'ni-wayan-artini': {
    slug: 'ni-wayan-artini', name: 'Ni Wayan Artini', businessName: 'Ubud Batik Studio',
    area: 'Ubud', avatar: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&auto=format&fit=crop&q=80',
    bio: 'A family-run batik studio in the heart of Ubud sharing the UNESCO-recognised art of traditional Indonesian textile art with visitors from around the world. Wayan comes from a long line of Balinese artisans and brings warmth, patience and deep knowledge to every session.',
    rating: 4.7, totalReviews: 148, memberSince: '2020', responseRate: '92%',
    languages: ['Balinese', 'Indonesian', 'English'],
    experiences: [
      { slug: 'batik-painting-workshop', title: 'Batik Painting Workshop', area: 'Ubud', price: 380000, duration: '3 hrs', rating: 4.7, reviews: 64, category: 'Art & Craft', image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&auto=format&fit=crop&q=80' },
      { slug: 'traditional-batik-workshop', title: 'Traditional Batik Workshop', area: 'Ubud', price: 420000, duration: '3.5 hrs', rating: 4.7, reviews: 84, category: 'Art & Craft', image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&auto=format&fit=crop&q=80' },
    ],
  },
  'nina-putri': {
    slug: 'nina-putri', name: 'Nina Putri', businessName: 'Sukha Healing Space',
    area: 'Ubud', avatar: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop&q=80',
    bio: 'A sanctuary of stillness in the heart of Ubud offering sound healing, breathwork and somatic therapies with Bali\'s most experienced practitioners. Nina trained in traditional Balinese healing arts alongside modern sound therapy, weaving both into transformative experiences for every guest.',
    rating: 4.9, totalReviews: 390, memberSince: '2018', responseRate: '99%',
    languages: ['Balinese', 'Indonesian', 'English'],
    experiences: [
      { slug: 'sound-healing-journey', title: 'Sound Healing Journey', area: 'Ubud', price: 350000, duration: '90 min', rating: 4.8, reviews: 178, category: 'Wellness', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80' },
      { slug: 'breathwork-and-meditation', title: 'Breathwork & Meditation', area: 'Ubud', price: 280000, duration: '75 min', rating: 4.9, reviews: 212, category: 'Wellness', image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&auto=format&fit=crop&q=80' },
    ],
  },
  'komang-dewi': {
    slug: 'komang-dewi', name: 'Komang Dewi', businessName: 'Jiwa Yoga Canggu',
    area: 'Canggu', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',
    bio: 'A beloved Canggu yoga studio with rooftop sunrise classes, breathwork sessions and sound healing for the wandering soul. Komang has been teaching yoga for 12 years and brings a deeply personal, grounding approach to every class — whether you\'re a first-timer or a seasoned practitioner.',
    rating: 4.9, totalReviews: 203, memberSince: '2019', responseRate: '97%',
    languages: ['Balinese', 'Indonesian', 'English'],
    experiences: [
      { slug: 'sunrise-yoga-class', title: 'Sunrise Yoga & Meditation', area: 'Canggu', price: 250000, duration: '75 min', rating: 4.9, reviews: 203, category: 'Wellness', image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&auto=format&fit=crop&q=80' },
      { slug: 'yoga-philosophy-workshop', title: 'Yoga Philosophy Workshop', area: 'Canggu', price: 320000, duration: '2 hrs', rating: 4.8, reviews: 67, category: 'Wellness', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80' },
    ],
  },
  'wayan-gede': {
    slug: 'wayan-gede', name: 'Wayan Gede', businessName: 'Sacred Bali Ceremonies',
    area: 'Ubud', avatar: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&auto=format&fit=crop&q=80',
    bio: 'Third-generation temple guide and Balinese priest offering authentic spiritual experiences at Bali\'s most sacred sites. Wayan holds deep knowledge of Balinese Hindu traditions and shares them with rare openness, helping visitors connect meaningfully with the island\'s living spiritual culture.',
    rating: 4.8, totalReviews: 78, memberSince: '2021', responseRate: '90%',
    languages: ['Balinese', 'Indonesian', 'English'],
    experiences: [
      { slug: 'water-temple-purification', title: 'Water Temple Purification', area: 'Gianyar', price: 600000, duration: '4 hrs', rating: 4.8, reviews: 78, category: 'Culture', image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&auto=format&fit=crop&q=80' },
      { slug: 'blessing-ceremony-ubud', title: 'Blessing Ceremony in Ubud', area: 'Ubud', price: 480000, duration: '3 hrs', rating: 4.9, reviews: 45, category: 'Culture', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80' },
    ],
  },
  'i-nyoman-arta': {
    slug: 'i-nyoman-arta', name: 'I Nyoman Arta', businessName: 'Bali Culture Tours',
    area: 'Uluwatu', avatar: null,
    bio: 'Specialist in Balinese cultural experiences with 18 years guiding guests through temple ceremonies, dance performances and sacred traditions across the island. Nyoman\'s deep network of local artists and priests allows him to offer access to experiences most visitors never see.',
    rating: 4.9, totalReviews: 312, memberSince: '2018', responseRate: '94%',
    languages: ['Balinese', 'Indonesian', 'English', 'Japanese'],
    experiences: [
      { slug: 'uluwatu-kecak-sunset', title: 'Uluwatu Sunset & Kecak Dance', area: 'Uluwatu', price: 450000, duration: '3 hrs', rating: 4.9, reviews: 312, category: 'Culture', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80' },
      { slug: 'kecak-sunset-performance', title: 'Kecak Sunset Performance', area: 'Uluwatu', price: 380000, duration: '2 hrs', rating: 4.8, reviews: 156, category: 'Culture', image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&auto=format&fit=crop&q=80' },
    ],
  },
  'putu-sari': {
    slug: 'putu-sari', name: 'Putu Sari', businessName: 'Warung Dapur Bali',
    area: 'Seminyak', avatar: null,
    bio: 'Family-run Balinese cooking school in Seminyak teaching the art of traditional island cuisine to food-loving travellers for over a decade. Putu begins every class at the local market at dawn, letting guests hand-pick their ingredients before cooking a full feast in a beautiful open kitchen.',
    rating: 4.8, totalReviews: 156, memberSince: '2019', responseRate: '96%',
    languages: ['Indonesian', 'English'],
    experiences: [
      { slug: 'balinese-cooking-class', title: 'Balinese Cooking Class', area: 'Seminyak', price: 480000, duration: '3.5 hrs', rating: 4.8, reviews: 156, category: 'Food & Drink', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80' },
      { slug: 'balinese-raw-food-workshop', title: 'Balinese Raw Food Workshop', area: 'Seminyak', price: 380000, duration: '2.5 hrs', rating: 4.7, reviews: 42, category: 'Food & Drink', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop&q=80' },
    ],
  },
  'komang-surya': {
    slug: 'komang-surya', name: 'Komang Surya', businessName: 'Kuta Surf Academy',
    area: 'Kuta', avatar: null,
    bio: 'Bali\'s most-reviewed surf school with certified ISA instructors, softboard lessons and surf coaching for all levels on Kuta and Legian Beach. Komang has been surfing since childhood and brings infectious enthusiasm and patience to every lesson, from total beginners to intermediate surfers.',
    rating: 4.7, totalReviews: 428, memberSince: '2017', responseRate: '93%',
    languages: ['Indonesian', 'English'],
    experiences: [
      { slug: 'beginner-surf-lesson', title: 'Beginner Surf Lesson', area: 'Kuta', price: 320000, duration: '2 hrs', rating: 4.7, reviews: 428, category: 'Surf & Water', image: 'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=600&auto=format&fit=crop&q=80' },
      { slug: 'intermediate-surf-coaching', title: 'Intermediate Surf Coaching', area: 'Kuta', price: 420000, duration: '2.5 hrs', rating: 4.8, reviews: 89, category: 'Surf & Water', image: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=600&auto=format&fit=crop&q=80' },
      { slug: 'sunset-surf-session', title: 'Sunset Surf Session', area: 'Kuta', price: 350000, duration: '2 hrs', rating: 4.7, reviews: 63, category: 'Surf & Water', image: 'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=600&auto=format&fit=crop&q=80' },
    ],
  },
  'gede-arnawa': {
    slug: 'gede-arnawa', name: 'Gede Arnawa', businessName: 'Tegalalang Walking Tours',
    area: 'Ubud', avatar: null,
    bio: 'Local farmer-guide sharing the living landscape of Tegalalang\'s famous rice terraces and the ancient subak irrigation system with curious travellers. Gede\'s family has farmed these terraces for generations, giving his tours an authenticity no guidebook can replicate.',
    rating: 4.8, totalReviews: 192, memberSince: '2020', responseRate: '91%',
    languages: ['Balinese', 'Indonesian', 'English'],
    experiences: [
      { slug: 'rice-terrace-walk', title: 'Tegalalang Rice Terrace Walk', area: 'Ubud', price: 280000, duration: '2.5 hrs', rating: 4.8, reviews: 192, category: 'Nature', image: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=600&auto=format&fit=crop&q=80' },
      { slug: 'mount-batur-sunrise-trek', title: 'Mount Batur Sunrise Trek', area: 'Kintamani', price: 650000, duration: '6 hrs', rating: 4.9, reviews: 134, category: 'Nature', image: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=600&auto=format&fit=crop&q=80' },
    ],
  },
  'ni-made-suari': {
    slug: 'ni-made-suari', name: 'Ni Made Suari', businessName: 'Sidemen Weave & Dye',
    area: 'Sidemen', avatar: null,
    bio: 'A family compound in Sidemen preserving the ancient art of natural dyeing and traditional weaving, welcoming visitors to learn and participate. Made draws pigments from plants grown in her own garden, creating vibrant colours the way her ancestors did for centuries.',
    rating: 4.7, totalReviews: 31, memberSince: '2022', responseRate: '88%',
    languages: ['Balinese', 'Indonesian'],
    experiences: [
      { slug: 'natural-dye-workshop', title: 'Natural Dye Workshop', area: 'Sidemen', price: 380000, duration: '3 hrs', rating: 4.7, reviews: 31, category: 'Art & Craft', image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80' },
    ],
  },
  'i-nyoman-karsa': {
    slug: 'i-nyoman-karsa', name: 'I Nyoman Karsa', businessName: 'Karsa Wood Studio',
    area: 'Ubud', avatar: null,
    bio: 'Third-generation wood carving family in Mas Village, Ubud, teaching traditional Balinese carving to visitors in their family studio. Nyoman works primarily with hibiscus and albesia wood, creating pieces that range from small decorative totems to full temple ornaments.',
    rating: 4.6, totalReviews: 47, memberSince: '2021', responseRate: '89%',
    languages: ['Balinese', 'Indonesian', 'English'],
    experiences: [
      { slug: 'wood-carving-workshop', title: 'Wood Carving Workshop', area: 'Ubud', price: 500000, duration: '4 hrs', rating: 4.8, reviews: 72, category: 'Art & Craft', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=80' },
    ],
  },
  'ni-komang-ayu': {
    slug: 'ni-komang-ayu', name: 'Ni Komang Ayu', businessName: 'Sidemen Village Crafts',
    area: 'Sidemen', avatar: null,
    bio: 'A women\'s weaving collective in Sidemen, East Bali, preserving traditional rattan craft and welcoming visitors to learn and support their community. Ayu and her collective have been weaving since childhood, and their hospitality is as warm as their craft is precise.',
    rating: 4.8, totalReviews: 29, memberSince: '2022', responseRate: '87%',
    languages: ['Balinese', 'Indonesian'],
    experiences: [
      { slug: 'rattan-weaving-class', title: 'Rattan Weaving Class', area: 'Sidemen', price: 350000, duration: '3 hrs', rating: 4.7, reviews: 38, category: 'Art & Craft', image: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=600&auto=format&fit=crop&q=80' },
    ],
  },
}

export function generateStaticParams() {
  return Object.keys(HOST_DB).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const host = HOST_DB[params.slug]
  if (!host) return { title: 'Host not found' }
  return {
    title: `${host.name} — ${host.businessName} | Balible`,
    description: host.bio.slice(0, 155),
  }
}

async function getHostFromDB(slug: string): Promise<Host | null> {
  try {
    const CATEGORY_DISPLAY: Record<string, string> = {
      WELLNESS: 'Wellness', ART_CRAFT: 'Art & Craft', CULTURE: 'Culture',
      FOOD_DRINK: 'Food & Drink', NATURE: 'Nature', SURF_WATER: 'Surf & Water',
    }
    const AREA_DISPLAY: Record<string, string> = {
      UBUD: 'Ubud', CANGGU: 'Canggu', SEMINYAK: 'Seminyak', KUTA: 'Kuta',
      ULUWATU: 'Uluwatu', GIANYAR: 'Gianyar', KINTAMANI: 'Kintamani',
      AMED: 'Amed', SIDEMEN: 'Sidemen',
    }
    const operators = await prisma.operator.findMany({
      include: {
        user: true,
        experiences: {
          where: { status: 'ACTIVE' },
          select: { slug: true, title: true, area: true, price: true, duration: true, rating: true, totalReviews: true, category: true, images: true },
        },
      },
    })
    const op = operators.find(o => {
      const nameSlug = o.user.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      return nameSlug === slug
    })
    if (!op) return null

    // Supplement DB fields with static data for fields not yet in schema
    const staticFallback = HOST_DB[slug]
    const firstExpArea = op.experiences[0] ? AREA_DISPLAY[String(op.experiences[0].area)] ?? '' : ''

    return {
      slug,
      name: op.user.name,
      businessName: op.businessName,
      area: staticFallback?.area ?? firstExpArea,
      avatar: op.avatar ?? staticFallback?.avatar ?? null,
      bio: op.description,
      rating: op.rating > 0 ? op.rating : (staticFallback?.rating ?? 4.8),
      totalReviews: op.totalReviews > 0 ? op.totalReviews : (staticFallback?.totalReviews ?? 0),
      memberSince: staticFallback?.memberSince ?? String(new Date().getFullYear()),
      responseRate: staticFallback?.responseRate ?? '90%',
      languages: staticFallback?.languages ?? ['English'],
      experiences: op.experiences.map(e => ({
        slug: e.slug,
        title: e.title,
        area: AREA_DISPLAY[String(e.area)] ?? String(e.area),
        price: e.price,
        duration: e.duration,
        rating: e.rating,
        reviews: e.totalReviews,
        category: CATEGORY_DISPLAY[String(e.category)] ?? String(e.category),
        image: (e.images as string[])[0] ?? '',
      })),
    }
  } catch {
    return null
  }
}

// ── Experience card ───────────────────────────────────────────────────────────

function ExpCard({ exp }: { exp: Experience }) {
  return (
    <a
      href={`/experiences/${exp.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
      style={{ border: '1px solid #E8E4DE', textDecoration: 'none' }}
    >
      <div className="relative overflow-hidden" style={{ height: 200 }}>
        <img
          src={exp.image} alt={exp.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span style={{ backgroundColor: 'rgba(17,17,17,0.65)', color: 'white', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20 }}>
            {exp.category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <WishlistHeart slug={exp.slug} size={12} compact />
        </div>
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 700, color: '#111111', lineHeight: 1.3, marginBottom: 8 }}>
          {exp.title}
        </h3>
        <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 10 }}>
          <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}>
            <MapPin size={11} style={{ color: '#C8A97E' }} />{exp.area}
          </span>
          <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}>
            <Clock size={11} />{exp.duration}
          </span>
          <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}>
            <Star size={11} fill="#C8A97E" color="#C8A97E" />
            <strong style={{ color: '#111111' }}>{exp.rating}</strong>
            <span>({exp.reviews})</span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#111111' }}>
            From <span style={{ color: '#C8A97E', fontWeight: 700 }}>IDR</span>{' '}
            <span style={{ fontWeight: 700 }}>{exp.price.toLocaleString('id-ID')}</span>
          </p>
          <span className="flex items-center gap-1" style={{ fontSize: 12, fontWeight: 600, color: '#C8A97E' }}>
            Book <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </a>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HostPage({ params }: { params: { slug: string } }) {
  const dbHost = await getHostFromDB(params.slug)
  const host = dbHost ?? HOST_DB[params.slug]
  if (!host) notFound()

  const totalReviews = host.experiences.reduce((s, e) => s + e.reviews, 0)
  const initials = host.name.split(' ').map(w => w[0]).join('').slice(0, 2)

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh' }}>
      <Navbar />

      {/* ── HERO ── */}
      <div style={{ backgroundColor: '#111111' }}>
        <div className="max-w-[1100px] mx-auto px-6 lg:px-16 py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

            {/* Avatar */}
            {host.avatar ? (
              <img
                src={host.avatar} alt={host.name}
                className="rounded-2xl object-cover flex-shrink-0"
                style={{ width: 96, height: 96 }}
              />
            ) : (
              <div className="rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ width: 96, height: 96, backgroundColor: '#C8A97E' }}>
                <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 32, fontWeight: 700, color: 'white' }}>{initials}</span>
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#C8A97E', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                Host on Balible
              </p>
              <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(24px,3vw,32px)', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: 4 }}>
                {host.name}
              </h1>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#9E9A94', marginBottom: 12 }}>
                {host.businessName} · {host.area}, Bali
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-1.5">
                  <Star size={14} fill="#C8A97E" color="#C8A97E" />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{host.rating}</span>
                  <span style={{ fontSize: 13, color: '#9E9A94' }}>({totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award size={14} style={{ color: '#C8A97E' }} />
                  <span style={{ fontSize: 13, color: '#9E9A94' }}>Member since {host.memberSince}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={14} style={{ color: '#C8A97E' }} />
                  <span style={{ fontSize: 13, color: '#9E9A94' }}>{host.responseRate} response rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-[1100px] mx-auto px-6 lg:px-16 py-10 pb-28">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* LEFT — bio + experiences */}
          <div className="flex-1 min-w-0">

            {/* About */}
            <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: '1px solid #E8E4DE' }}>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111', marginBottom: 12 }}>
                About {host.name.split(' ')[0]}
              </h2>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#4A4540', lineHeight: 1.75 }}>
                {host.bio}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {host.languages.map(lang => (
                  <span key={lang} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, backgroundColor: '#F5F1EB', color: '#6F675C', border: '1px solid #E8E4DE' }}>
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Experiences */}
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111', marginBottom: 16 }}>
              Experiences by {host.name.split(' ')[0]}
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 400, color: '#6F675C', marginLeft: 10 }}>
                {host.experiences.length} listing{host.experiences.length !== 1 ? 's' : ''}
              </span>
            </h2>

            <div className={`grid gap-5 ${host.experiences.length === 1 ? 'grid-cols-1 max-w-sm' : 'sm:grid-cols-2'}`}>
              {host.experiences.map(exp => <ExpCard key={exp.slug} exp={exp} />)}
            </div>
          </div>

          {/* RIGHT — stats card */}
          <div style={{ width: 280, flexShrink: 0, alignSelf: 'flex-start', position: 'sticky', top: 88 }}>
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E8E4DE' }}>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: '#111111', marginBottom: 16 }}>
                Host details
              </h3>
              {[
                { label: 'Rating',        value: `${host.rating} ★` },
                { label: 'Total reviews', value: totalReviews.toLocaleString() },
                { label: 'Experiences',   value: host.experiences.length.toString() },
                { label: 'Response rate', value: host.responseRate },
                { label: 'Member since',  value: host.memberSince },
                { label: 'Languages',     value: host.languages.join(', ') },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start py-2.5" style={{ borderBottom: '1px solid #F5F1EB' }}>
                  <span style={{ fontSize: 13, color: '#6F675C' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111111', textAlign: 'right', maxWidth: '55%' }}>{value}</span>
                </div>
              ))}
              <a
                href={`/search`}
                className="mt-5 flex items-center justify-center hover:opacity-90 transition-opacity"
                style={{ height: 44, backgroundColor: '#111111', color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-inter)' }}
              >
                Browse all experiences
              </a>
            </div>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
