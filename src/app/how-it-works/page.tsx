import { Search, CalendarDays, CreditCard, Star, Shield, Users, Clock, Heart } from 'lucide-react'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'How It Works — Balible',
  description: 'Book a real Bali experience in minutes. Browse, choose a date, pay securely, and meet your host.',
}

const GUEST_STEPS = [
  {
    step: '01',
    Icon: Search,
    title: 'Discover something real',
    body: 'Browse 16+ curated experiences across Bali — art, wellness, culture, food, nature, and surf. Filter by area, price, duration, or vibe. Every listing is personally reviewed by our team.',
    image: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=600&auto=format&fit=crop&q=80',
  },
  {
    step: '02',
    Icon: CalendarDays,
    title: 'Pick a date and guests',
    body: 'Choose from available dates on the booking widget. Select how many guests. See the full price breakdown — no hidden fees, ever. The 10% service fee is always shown upfront.',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80',
  },
  {
    step: '03',
    Icon: CreditCard,
    title: 'Book securely in seconds',
    body: 'Pay by card, bank transfer, GoPay, or OVO. Your spot is confirmed instantly — no waiting for approval. You\'ll receive a confirmation email with your host\'s contact and a precise meeting point.',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop&q=80',
  },
  {
    step: '04',
    Icon: Star,
    title: 'Show up and experience Bali',
    body: 'Meet your host at the agreed location. Dive in. Ask questions. Make something. Learn. At the end, leave an honest review — it helps the host and helps future guests find them.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80',
  },
]

const TRUST_ITEMS = [
  { Icon: Shield, title: 'Vetted hosts only', body: 'Every host is interviewed, visited, and test-booked by our team before going live. We say no far more than we say yes.' },
  { Icon: Clock, title: 'Free cancellation', body: 'Changed your plans? Most experiences offer free cancellation up to 24 hours before. We\'ll process your refund within 2 business days.' },
  { Icon: Users, title: 'Small groups', body: 'Most experiences cap at 6–8 guests. No crowds, no rush. Your host can actually focus on you.' },
  { Icon: Heart, title: 'Real impact', body: '85% of every payment goes directly to the host. Your booking supports a real person and their family, not a faceless corporation.' },
]

const FAQS = [
  { q: 'Do I need to speak Bahasa Indonesia?', a: 'No — all Balible hosts speak English. Many also speak additional languages; check the language listing on each experience page.' },
  { q: 'What should I bring?', a: 'Specific requirements are listed on each experience page. Generally: comfortable clothing, a water bottle, and an open mind. Your host will provide all tools and materials.' },
  { q: 'Are experiences suitable for beginners?', a: 'Yes — the skill level (Beginner / Intermediate / Advanced) is shown on every listing. Most of our experiences are designed for complete beginners.' },
  { q: 'What if I need to cancel?', a: 'Most experiences offer free cancellation up to 24 hours before. Some specialist experiences have a 72-hour policy. The cancellation policy is always shown on the experience page before you book.' },
  { q: 'Can I book a private experience?', a: 'Many hosts offer private bookings for couples, families, or groups. Contact us at hello@balible.com or reach out to the host directly via the booking widget notes field.' },
]

export default function HowItWorksPage() {
  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh' }}>

      <Navbar />

      {/* HERO */}
      <div className="text-center px-6 py-20 max-w-[800px] mx-auto">
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, letterSpacing: '0.2em', color: '#C8A97E', textTransform: 'uppercase', marginBottom: 14 }}>Simple by design</p>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, color: '#111111', lineHeight: 1.1, marginBottom: 18 }}>
          Four Steps to an Unforgettable Bali Experience
        </h1>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 17, color: '#6F675C', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
          From browsing to booking takes under five minutes. The experience itself lasts a lifetime.
        </p>
      </div>

      {/* STEPS */}
      <div className="max-w-[1100px] mx-auto px-5 lg:px-8 pb-20 space-y-8">
        {GUEST_STEPS.map(({ step, Icon, title, body, image }, i) => (
          <div
            key={step}
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border: '1px solid #E8E4DE', display: 'grid', gridTemplateColumns: i % 2 === 0 ? '1fr 1fr' : '1fr 1fr' }}
          >
            {/* Image — left on even */}
            {i % 2 === 0 && (
              <div className="relative hidden sm:block" style={{ minHeight: 280 }}>
                <img src={image} alt={title} className="w-full h-full object-cover absolute inset-0" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0) 60%, rgba(255,255,255,0.08) 100%)' }} />
              </div>
            )}

            {/* Content */}
            <div className="p-8 lg:p-12 flex flex-col justify-center" style={{ gridColumn: i % 2 === 0 ? undefined : '1' }}>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#111111' }}>
                  <Icon size={20} style={{ color: '#C8A97E' }} />
                </div>
                <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 48, fontWeight: 700, color: '#E8E4DE', lineHeight: 1 }}>{step}</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(20px, 2vw, 26px)', fontWeight: 700, color: '#111111', marginBottom: 12, lineHeight: 1.2 }}>
                {title}
              </h2>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#6F675C', lineHeight: 1.85, maxWidth: 460 }}>
                {body}
              </p>
            </div>

            {/* Image — right on odd */}
            {i % 2 !== 0 && (
              <div className="relative hidden sm:block" style={{ minHeight: 280 }}>
                <img src={image} alt={title} className="w-full h-full object-cover absolute inset-0" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* TRUST SIGNALS */}
      <div style={{ backgroundColor: '#111111', padding: '80px 24px' }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12">
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, letterSpacing: '0.2em', color: '#C8A97E', textTransform: 'uppercase', marginBottom: 10 }}>Why Balible</p>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 700, color: 'white' }}>
              Booked with Confidence
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TRUST_ITEMS.map(({ Icon, title, body }) => (
              <div key={title} className="p-6 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(200,169,126,0.12)' }}>
                  <Icon size={18} style={{ color: '#C8A97E' }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-[760px] mx-auto px-5 lg:px-8 py-20">
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 700, color: '#111111', marginBottom: 32, textAlign: 'center' }}>
          Common Questions
        </h2>
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E8E4DE' }}>
          {FAQS.map(({ q, a }, i) => (
            <div key={q} style={{ borderBottom: i < FAQS.length - 1 ? '1px solid #E8E4DE' : 'none' }}>
              <div className="py-4">
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 600, color: '#111111', marginBottom: 6 }}>{q}</p>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', lineHeight: 1.75 }}>{a}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center mt-6" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>
          More questions?{' '}
          <a href="/help" style={{ color: '#C8A97E', textDecoration: 'underline' }}>Visit our Help Centre</a>
          {' '}or email{' '}
          <a href="mailto:hello@balible.com" style={{ color: '#C8A97E', textDecoration: 'underline' }}>hello@balible.com</a>
        </p>
      </div>

      {/* CTA */}
      <div className="max-w-[1100px] mx-auto px-5 lg:px-8 pb-20">
        <div className="rounded-2xl overflow-hidden relative" style={{ backgroundColor: '#F5F1EB', border: '1px solid #E8E4DE' }}>
          <div className="grid lg:grid-cols-2">
            <div className="p-10 lg:p-14">
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(24px, 2.5vw, 34px)', fontWeight: 700, color: '#111111', marginBottom: 14, lineHeight: 1.2 }}>
                Ready to Experience the Real Bali?
              </h2>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#6F675C', marginBottom: 28, lineHeight: 1.7 }}>
                16+ handpicked experiences, from pottery in Ubud to snorkelling in Amed. Every one of them worth it.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="/search" style={{ height: 48, display: 'inline-flex', alignItems: 'center', padding: '0 28px', backgroundColor: '#111111', color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-inter)' }} className="hover:opacity-90 transition-opacity">
                  Browse all experiences
                </a>
                <a href="/destinations" style={{ height: 48, display: 'inline-flex', alignItems: 'center', padding: '0 28px', border: '1px solid #E8E4DE', color: '#111111', borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none', fontFamily: 'var(--font-inter)', backgroundColor: 'white' }} className="hover:opacity-70 transition-opacity">
                  Explore destinations →
                </a>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <img src="https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&auto=format&fit=crop&q=80" alt="Bali experience" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#111111', padding: '40px 24px 28px' }}>
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <a href="/" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: 'white', textDecoration: 'none' }}>BALIBLE</a>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>© 2024 Balible. All rights reserved.</p>
          <div className="flex gap-6">
            {[{ label: 'Help Centre', href: '/help' }, { label: 'About', href: '/about' }, { label: 'For Hosts', href: '/for-hosts' }].map(({ label, href }) => (
              <a key={label} href={href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }} className="hover:text-white transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
