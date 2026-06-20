import type { Metadata } from 'next'
import { MapPin, Star, Award } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Meet Our Hosts | Balible',
  description: 'Discover the passionate local artisans, guides, and teachers behind every Balible experience.',
}

export const revalidate = 3600

type HostCard = {
  slug: string; name: string; businessName: string; area: string
  category: string; rating: number; reviews: number; avatar: string | null; tagline: string
}

const CATEGORY_DISPLAY: Record<string, string> = {
  WELLNESS_HEALING: 'Wellness & Healing', ART_CRAFT: 'Art & Craft', CULTURE_SPIRITUAL: 'Culture & Spiritual',
  CULINARY: 'Culinary', NATURE_OUTDOORS: 'Nature & Outdoors',
  WATER_ACTIVITIES: 'Water Activities', LOCAL_EXPERTS: 'Local Experts', RENTALS: 'Rentals',
}
const AREA_DISPLAY: Record<string, string> = {
  UBUD: 'Ubud', CANGGU: 'Canggu', SEMINYAK: 'Seminyak', KUTA: 'Kuta',
  ULUWATU: 'Uluwatu', GIANYAR: 'Gianyar', KINTAMANI: 'Kintamani',
  AMED: 'Amed', SIDEMEN: 'Sidemen', SANUR: 'Sanur', JIMBARAN: 'Jimbaran',
  NUSA_DUA: 'Nusa Dua', MEDEWI: 'Medewi',
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

async function getHosts(): Promise<HostCard[]> {
  try {
    const operators = await prisma.operator.findMany({
      include: {
        user: { select: { name: true } },
        experiences: {
          where: { status: 'ACTIVE' },
          select: { area: true, category: true },
          take: 1,
          orderBy: { rating: 'desc' },
        },
      },
    })

    return operators.filter(op => op.experiences.length > 0).map(op => {
      const exp = op.experiences[0]
      return {
        slug: toSlug(op.user.name),
        name: op.user.name,
        businessName: op.businessName,
        area: exp ? (AREA_DISPLAY[String(exp.area)] ?? String(exp.area)) : '',
        category: exp ? (CATEGORY_DISPLAY[String(exp.category)] ?? String(exp.category)) : '',
        rating: op.rating,
        reviews: op.totalReviews,
        avatar: op.avatar ?? null,
        tagline: op.description.slice(0, 120),
      }
    })
  } catch {
    return []
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  'Art & Craft':        '#C8A97E',
  'Wellness & Healing': '#7EB5A6',
  'Culture & Spiritual': '#A97EB5',
  'Culinary':            '#B5A07E',
  'Nature & Outdoors':  '#7EA67E',
  'Water Activities':   '#7E9EB5',
  'Local Experts':      '#4A7C59',
  'Rentals':            '#B66A45',
}

export default async function HostsPage() {
  const hosts = await getHosts()

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ backgroundColor: '#111111', paddingTop: 64, paddingBottom: 64 }}>
        <div className="max-w-[1100px] mx-auto px-6 lg:px-16 text-center">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#C8A97E', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            The people behind Balible
          </p>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: 16 }}>
            Meet Our Hosts
          </h1>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 16, color: '#9E9A94', maxWidth: 540, margin: '0 auto' }}>
            Passionate local artisans, guides, and teachers who share Bali&apos;s living culture one guest at a time.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1100px] mx-auto px-6 lg:px-16 py-12 pb-28">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hosts.map(host => {
            const catColor = CATEGORY_COLORS[host.category] ?? '#C8A97E'
            return (
              <a
                key={host.slug}
                href={`/hosts/${host.slug}`}
                className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow block"
                style={{ border: '1px solid #E8E4DE', textDecoration: 'none' }}
              >
                {/* Photo */}
                <div className="relative overflow-hidden" style={{ height: 180 }}>
                  <img
                    src={host.avatar ?? '/avatar-default.png'}
                    alt={host.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span style={{ backgroundColor: catColor, color: 'white', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20 }}>
                      {host.category}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '16px 18px 18px' }}>
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111', marginBottom: 2 }}>
                    {host.name}
                  </h2>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C', marginBottom: 10 }}>
                    {host.businessName}
                  </p>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#4A4540', lineHeight: 1.6, marginBottom: 12 }}>
                    {host.tagline}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {host.area && (
                        <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}>
                          <MapPin size={11} style={{ color: '#C8A97E' }} />{host.area}
                        </span>
                      )}
                      <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#6F675C' }}>
                        <Star size={11} fill="#C8A97E" color="#C8A97E" />
                        <strong style={{ color: '#111111', fontSize: 12 }}>{host.rating.toFixed(1)}</strong>
                        {host.reviews > 0 && <span>({host.reviews})</span>}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#C8A97E' }}>View profile →</span>
                  </div>
                </div>
              </a>
            )
          })}
        </div>

        {/* Become a host CTA */}
        <div className="mt-16 text-center rounded-2xl py-14 px-8" style={{ backgroundColor: '#111111' }}>
          <Award size={32} style={{ color: '#C8A97E', margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, color: 'white', marginBottom: 10 }}>
            Share your craft with the world
          </h2>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#9E9A94', maxWidth: 440, margin: '0 auto 24px' }}>
            Join Balible as a host and earn income doing what you love while giving travellers an authentic Balinese experience.
          </p>
          <a
            href="/for-hosts"
            style={{ display: 'inline-block', backgroundColor: '#C8A97E', color: 'white', fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 600, padding: '12px 28px', borderRadius: 10, textDecoration: 'none' }}
          >
            Become A Host
          </a>
        </div>
      </div>

      <Footer />
      <MobileNav />
    </div>
  )
}
