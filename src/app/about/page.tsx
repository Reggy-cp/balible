import { Heart, Star, Users, MapPin } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'About Balible — Curated Experiences in Bali',
  description: 'We connect travellers with Bali\'s most gifted local hosts — from master potters in Ubud to surf coaches in Kuta. Learn our story.',
}

const STATS = [
  { value: '200+', label: 'Local Hosts' },
  { value: '3,800+', label: 'Bookings Made' },
  { value: '4.86', label: 'Average Rating' },
  { value: '12', label: 'Areas of Bali' },
]

const VALUES = [
  {
    Icon: Heart,
    title: 'Authentic by Design',
    body: 'We reject generic tours. Every experience on Balible is led by someone who has spent years — often a lifetime — mastering their craft or tradition. We visit every host before listing them.',
  },
  {
    Icon: Users,
    title: 'Community First',
    body: 'When you book through Balible, 85% of every payment goes directly to the host. We keep the platform lean so more money stays in the communities that make Bali extraordinary.',
  },
  {
    Icon: Star,
    title: 'Quality Over Volume',
    body: 'We list fewer experiences than our competitors — intentionally. If it doesn\'t pass our curation bar, it doesn\'t go live. Every listing is reviewed, photographed, and test-booked by our team.',
  },
  {
    Icon: MapPin,
    title: 'Beyond the Guidebook',
    body: 'You won\'t find Balible experiences at every tourist booth. We seek out the silversmith in a back-street Celuk workshop, the healer recommended by villagers, the chef who still uses her grandmother\'s recipes.',
  },
]

const TEAM = [
  {
    name: 'Ayu Dewi Santika',
    role: 'Co-Founder & CEO',
    location: 'Ubud, Bali',
    bio: 'Born and raised in Ubud, Ayu grew up watching her family\'s batik workshop draw curious travellers. After studying hospitality in Singapore, she came home with a mission: make authentic Bali accessible to people who want more than a temple selfie.',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'James Whitfield',
    role: 'Co-Founder & CTO',
    location: 'London / Canggu',
    bio: 'James spent seven years building travel platforms in London before a surf trip to Canggu convinced him to stay. He writes code in the morning, surfs in the afternoon, and genuinely believes Bali has the world\'s best breakfast.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Ni Made Suasti',
    role: 'Head of Host Experience',
    location: 'Gianyar, Bali',
    bio: 'Made spent a decade as a cultural programme director before joining Balible. She personally onboards every new host, helps them tell their story, and makes sure their listing captures what makes them genuinely special.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Lena Kovač',
    role: 'Head of Guest Experience',
    location: 'Zagreb / Bali',
    bio: 'Lena arrived in Bali on a three-month sabbatical and stayed for three years. She leads everything that happens after you book — making sure every guest feels looked after from the moment they confirm to the moment they step into the experience.',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&auto=format&fit=crop&q=80',
  },
]

const TIMELINE = [
  { year: '2022', event: 'Founded in Ubud with 8 host partners and a shared conviction that Bali deserved a better booking platform.' },
  { year: '2023', event: 'Reached 100 verified experiences across 6 areas. Launched the host earnings calculator and dashboard after repeated requests.' },
  { year: '2024', event: 'Crossed 3,000 bookings. Introduced the interactive map, wishlist, and category pages. Expanded into East Bali and Sidemen.' },
  { year: '2025', event: 'Now 200+ active hosts, a fully mobile-native platform, and a community that keeps us honest. Bali, we\'re just getting started.' },
]

export default function AboutPage() {
  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F3EEE5', minHeight: '100vh' }}>

      <Navbar />

      {/* HERO */}
      <div className="relative" style={{ minHeight: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="absolute inset-0 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1604999333679-b86d54738315?w=1600&auto=format&fit=crop&q=80" alt="Bali" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(17,17,17,0.75) 0%, rgba(17,17,17,0.35) 100%)' }} />
        </div>
        <div className="relative px-6 lg:px-16 py-24 max-w-[1200px] mx-auto w-full">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, letterSpacing: '0.2em', color: '#B58A4B', textTransform: 'uppercase', marginBottom: 16 }}>Our Story</p>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: 700, color: 'white', lineHeight: 1.1, maxWidth: 680, marginBottom: 20 }}>
            We Built the Platform<br />We Wished Existed
          </h1>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 'clamp(15px, 1.8vw, 18px)', color: 'rgba(255,255,255,0.75)', maxWidth: 520, lineHeight: 1.8 }}>
            Balible exists because booking a real, intimate experience in Bali was harder than it should have been. We changed that — for guests and for the hosts who make Bali what it is.
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="bg-white" style={{ borderBottom: '1px solid #E8E4DE' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-16 py-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 700, color: '#1D1D1D' }}>{value}</p>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', marginTop: 4 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MISSION SECTION */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-16 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, letterSpacing: '0.15em', color: '#B58A4B', textTransform: 'uppercase', marginBottom: 14 }}>Why Balible</p>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 700, color: '#1D1D1D', lineHeight: 1.2, marginBottom: 18 }}>
              Bali Has More to Offer Than Most People See
            </h2>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#6F675C', lineHeight: 1.85, marginBottom: 14 }}>
              When we first came to Bali, we were amazed by the warmth, the craft, the depth of culture. But we struggled to connect with it beyond the surface level. The good stuff — the pottery classes with actual masters, the temple rituals led by genuine priests, the cooking lessons in someone's actual family kitchen — took weeks to find.
            </p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#6F675C', lineHeight: 1.85 }}>
              We built Balible to surface that richness. Not just for visitors, but for the local hosts whose extraordinary skills deserve a proper stage.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&auto=format&fit=crop&q=80',
            ].map((src, i) => (
              <div key={i} className="overflow-hidden rounded-xl" style={{ height: i % 2 === 0 ? 160 : 140, marginTop: i % 2 !== 0 ? 16 : 0 }}>
                <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VALUES */}
      <div style={{ backgroundColor: '#1D1D1D', padding: '80px 24px' }}>
        <div className="max-w-[1200px] mx-auto">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, letterSpacing: '0.2em', color: '#B58A4B', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>What we stand for</p>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 700, color: 'white', textAlign: 'center', marginBottom: 56 }}>
            Our Principles
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ Icon, title, body }) => (
              <div key={title} className="p-6 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(200,169,126,0.15)' }}>
                  <Icon size={18} style={{ color: '#B58A4B' }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 10 }}>{title}</h3>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TEAM */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-16 py-20">
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, letterSpacing: '0.15em', color: '#B58A4B', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>The People Behind It</p>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 700, color: '#1D1D1D', textAlign: 'center', marginBottom: 48 }}>
          Meet the Team
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map(member => (
            <div key={member.name} className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E8E4DE' }}>
              <div style={{ height: 220 }}>
                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: '#1D1D1D' }}>{member.name}</h3>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#B58A4B', fontWeight: 600, marginTop: 2, marginBottom: 4 }}>{member.role}</p>
                <div className="flex items-center gap-1 mb-8">
                  <MapPin size={10} style={{ color: '#6F675C' }} />
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>{member.location}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C', lineHeight: 1.75 }}>{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TIMELINE */}
      <div style={{ backgroundColor: '#F3EEE5', borderTop: '1px solid #E8E4DE', borderBottom: '1px solid #E8E4DE' }}>
        <div className="max-w-[860px] mx-auto px-6 lg:px-8 py-20">
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(26px, 3vw, 34px)', fontWeight: 700, color: '#1D1D1D', marginBottom: 48, textAlign: 'center' }}>
            How We Got Here
          </h2>
          <div className="space-y-0">
            {TIMELINE.map(({ year, event }, i) => (
              <div key={year} className="flex gap-6" style={{ paddingBottom: i < TIMELINE.length - 1 ? 32 : 0 }}>
                <div className="flex flex-col items-center" style={{ flexShrink: 0 }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1D1D1D' }}>
                    <span style={{ fontFamily: 'var(--font-inter)', fontSize: 10, fontWeight: 700, color: '#B58A4B' }}>{year}</span>
                  </div>
                  {i < TIMELINE.length - 1 && <div style={{ flex: 1, width: 1, backgroundColor: '#E8E4DE', marginTop: 6 }} />}
                </div>
                <div style={{ paddingTop: 8 }}>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#6F675C', lineHeight: 1.8 }}>{event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-16 py-20 text-center">
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 700, color: '#1D1D1D', marginBottom: 14 }}>
          Ready to Experience the Real Bali?
        </h2>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 16, color: '#6F675C', marginBottom: 32, maxWidth: 440, margin: '0 auto 32px' }}>
          Browse 16+ curated experiences led by Bali's finest local hosts.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/search" style={{ height: 48, display: 'inline-flex', alignItems: 'center', padding: '0 32px', backgroundColor: '#1D1D1D', color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-inter)' }} className="hover:opacity-90 transition-opacity">
            Browse experiences
          </a>
          <a href="/for-hosts" style={{ height: 48, display: 'inline-flex', alignItems: 'center', padding: '0 32px', border: '1px solid #E8E4DE', color: '#1D1D1D', borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none', fontFamily: 'var(--font-inter)' }} className="hover:opacity-70 transition-opacity">
            Become A Host →
          </a>
        </div>
      </div>

      <MobileNav />

      <Footer />
    </div>
  )
}
