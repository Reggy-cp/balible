'use client'

import { useState } from 'react'
import {
  Star, Shield, TrendingUp, Users, Heart, Globe, ArrowRight,
  CheckCircle2, DollarSign, Calendar, Camera, MessageSquare,
  Menu, X, ChevronDown, ChevronUp,
} from 'lucide-react'

const STEPS = [
  {
    number: '01',
    title: 'Tell us about your experience',
    body: 'Describe what you offer, set your price, choose your availability, and upload photos. Our team will review and approve your listing within 48 hours.',
    icon: Camera,
  },
  {
    number: '02',
    title: 'Welcome your first guests',
    body: 'Once live, guests will discover your experience through search, our map, and featured collections. Confirm bookings with one tap.',
    icon: Users,
  },
  {
    number: '03',
    title: 'Get paid reliably',
    body: 'Receive secure monthly payouts directly to your Indonesian bank account. No hidden fees — you keep 85% of every booking.',
    icon: DollarSign,
  },
]

const BENEFITS = [
  { Icon: TrendingUp,      title: 'Grow your income',        body: 'Our hosts earn an average of IDR 7.4M per month. Top hosts earn over IDR 30M — doing what they love.' },
  { Icon: Shield,          title: 'We handle the logistics',  body: 'Booking management, payment processing, guest communication and dispute resolution — all handled by Balible.' },
  { Icon: Globe,           title: 'Global reach',             body: 'Connect with curious, culturally aware travellers from Europe, Australia, Asia and the Americas.' },
  { Icon: Heart,           title: 'Do work you love',         body: 'Share your craft, your culture, your knowledge. Every guest you inspire is a piece of Bali\'s story told.' },
  { Icon: Calendar,        title: 'Flexible scheduling',      body: 'Open for one day a week or seven — you set your own availability calendar. You\'re always in control.' },
  { Icon: MessageSquare,   title: 'Dedicated host support',   body: 'A dedicated Balible host advisor is available via WhatsApp 7 days a week to help you succeed.' },
]

const HOSTS = [
  {
    name: 'Made Sari',
    role: 'Potter · Ubud',
    photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&auto=format&fit=crop&q=80',
    quote: 'In my first month on Balible I had 12 bookings. Now I teach almost every day and my waiting list is 3 weeks long. Balible changed my life.',
    earning: 'IDR 12M / month',
    rating: 4.9,
  },
  {
    name: 'Ketut Suardana',
    role: 'Silversmith · Canggu',
    photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&auto=format&fit=crop&q=80',
    quote: 'I was selling in markets for 10 years before Balible. Now I teach workshops and earn three times more — and every student leaves with something they made themselves.',
    earning: 'IDR 9.5M / month',
    rating: 4.8,
  },
  {
    name: 'Nina Putri',
    role: 'Sound Healer · Ubud',
    photo: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=300&auto=format&fit=crop&q=80',
    quote: 'My guests come seeking healing and leave transformed. Balible connects me with exactly the kind of guests I want — open, curious and respectful of our traditions.',
    earning: 'IDR 8.2M / month',
    rating: 4.9,
  },
]

const FAQS = [
  { q: 'Who can become a Balible host?', a: 'Anyone based in Bali who can offer an authentic, meaningful experience. We welcome craft artists, healers, cooks, surfers, dive instructors, temple guides, farmers and more. If you have a skill, culture or space to share, we want to hear from you.' },
  { q: 'How much does it cost to list?', a: 'Listing on Balible is completely free. We charge a 15% commission only when a booking is confirmed. You keep 85% of every payment.' },
  { q: 'How and when do I get paid?', a: 'Balible pays out monthly via direct bank transfer to your Indonesian bank account. Payouts for bookings completed in a given month are released on the 5th of the following month.' },
  { q: 'How do I set my availability?', a: 'Once your listing is approved, you manage your own availability calendar from your host dashboard. Open any day, set slot capacities and block dates whenever you need time off.' },
  { q: 'What happens if a guest cancels?', a: 'Balible\'s standard cancellation policy protects hosts: guests who cancel within 24 hours of the experience receive no refund. For cancellations 24–72 hours before, hosts receive 50% of the booking value.' },
  { q: 'How long does approval take?', a: 'Our host review team aims to respond within 48 hours of your application. We may ask for additional photos or details to ensure your listing is its best before going live.' },
]

function EarningsCalculator() {
  const [guests, setGuests] = useState(2)
  const [price, setPrice] = useState(500000)
  const [sessions, setSessions] = useState(10)

  const gross = price * guests * sessions
  const net = Math.round(gross * 0.85)

  return (
    <div className="bg-white rounded-2xl p-6 lg:p-8" style={{ border: '1px solid #E8E4DE' }}>
      <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: '#111111', marginBottom: 6 }}>
        Estimate your earnings
      </h3>
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', marginBottom: 24 }}>
        Adjust the sliders to see what you could earn each month.
      </p>

      <div className="space-y-6">
        {[
          { label: 'Price per person (IDR)',  value: price,    set: setPrice,    min: 100000, max: 2000000, step: 50000,  fmt: (v: number) => `IDR ${(v/1000).toFixed(0)}K` },
          { label: 'Guests per session',      value: guests,   set: setGuests,   min: 1,      max: 20,      step: 1,      fmt: (v: number) => `${v} guests` },
          { label: 'Sessions per month',      value: sessions, set: setSessions, min: 1,      max: 30,      step: 1,      fmt: (v: number) => `${v} sessions` },
        ].map(({ label, value, set, min, max, step, fmt }) => (
          <div key={label}>
            <div className="flex justify-between items-center mb-2">
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#111111' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 700, color: '#C8A97E' }}>{fmt(value)}</span>
            </div>
            <input
              type="range" min={min} max={max} step={step} value={value}
              onChange={e => set(Number(e.target.value))}
              className="w-full price-range"
              style={{ position: 'relative', top: 0 }}
            />
          </div>
        ))}
      </div>

      <div className="mt-8 p-5 rounded-xl" style={{ backgroundColor: '#F5F1EB' }}>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C' }}>Estimated monthly earnings</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 32, fontWeight: 700, color: '#111111' }}>
            IDR {(net / 1_000_000).toFixed(1)}M
          </span>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#4A7C59' }}>after 15% fee</span>
        </div>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C', marginTop: 4 }}>
          Gross: IDR {(gross / 1_000_000).toFixed(1)}M · You keep 85%
        </p>
      </div>
    </div>
  )
}

export default function ForHostsPage() {
  const [menuOpen, setMenuOpen]   = useState(false)
  const [openFaq, setOpenFaq]     = useState<number | null>(null)

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: 'white' }}>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white" style={{ height: 64, borderBottom: '1px solid #E8E4DE' }}>
        <div className="flex items-center justify-between h-full px-6 lg:px-16 max-w-[1440px] mx-auto">
          <a href="/" className="flex flex-col leading-none flex-shrink-0" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: '#111111' }}>BALIBLE</span>
            <span className="hidden sm:block" style={{ fontSize: 8, letterSpacing: '0.2em', color: '#6F675C', textTransform: 'uppercase' }}>CURATED EXPERIENCES IN BALI</span>
          </a>
          <div className="hidden lg:flex items-center gap-8">
            <a href="/search" style={{ fontSize: 14, color: '#111111', textDecoration: 'none' }} className="hover:opacity-70 transition-opacity">Browse Experiences</a>
            <a href="/map" style={{ fontSize: 14, color: '#111111', textDecoration: 'none' }} className="hover:opacity-70 transition-opacity">Map</a>
            <a href="/for-hosts" style={{ fontSize: 14, color: '#C8A97E', fontWeight: 600, textDecoration: 'none' }}>For Hosts</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/auth/signin" className="hidden sm:flex items-center hover:opacity-70 transition-opacity" style={{ fontSize: 14, color: '#111111', textDecoration: 'none' }}>Sign in</a>
            <a
              href="/auth/signup"
              className="hidden sm:flex items-center hover:opacity-90 transition-opacity"
              style={{ height: 38, padding: '0 18px', backgroundColor: '#C8A97E', color: '#111111', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
            >
              Become a host
            </a>
            <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} style={{ color: '#111111' }} /> : <Menu size={22} style={{ color: '#111111' }} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b shadow-lg z-50" style={{ borderColor: '#E8E4DE' }}>
            {['Browse Experiences', 'Map', 'Sign in', 'Become a host'].map(l => (
              <a key={l} href={l === 'Browse Experiences' ? '/search' : l === 'Map' ? '/map' : l === 'Sign in' ? '/auth/signin' : '/auth/signup'} className="block px-6 py-3 text-sm border-b hover:bg-ivory transition-colors" style={{ color: '#111111', borderColor: '#E8E4DE' }}>{l}</a>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative" style={{ minHeight: 560, display: 'flex', alignItems: 'center' }}>
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1400&auto=format&fit=crop&q=85"
            alt="Host teaching pottery in Bali"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' }} />
        </div>
        <div className="relative z-10 px-6 lg:px-16 max-w-[1440px] mx-auto w-full py-20">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#C8A97E', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Host on Balible
          </p>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 700, color: 'white', lineHeight: 1.1, maxWidth: 540, marginBottom: 20 }}>
            Share your craft.<br />Earn doing what you love.
          </h1>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 17, color: 'rgba(255,255,255,0.8)', maxWidth: 440, lineHeight: 1.6, marginBottom: 32 }}>
            Join 320+ Balinese hosts sharing their skills, culture and creativity with travellers from around the world.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/auth/signup"
              className="flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ height: 52, padding: '0 28px', backgroundColor: '#C8A97E', color: '#111111', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--font-inter)' }}
            >
              Become a host <ArrowRight size={16} />
            </a>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              style={{ height: 52, padding: '0 24px', border: '1.5px solid rgba(255,255,255,0.6)', color: 'white', borderRadius: 10, fontSize: 15, fontWeight: 500, textDecoration: 'none', fontFamily: 'var(--font-inter)' }}
            >
              How it works
            </a>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-8 mt-12">
            {[
              { value: '320+',    label: 'Active hosts' },
              { value: 'IDR 7.4M', label: 'Avg monthly earnings' },
              { value: '4.8',     label: 'Average host rating' },
              { value: '1,248',   label: 'Bookings last month' },
            ].map(s => (
              <div key={s.label}>
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, color: 'white', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-16 px-6 lg:px-16" style={{ backgroundColor: '#F5F1EB' }}>
        <div className="max-w-[1440px] mx-auto">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, fontWeight: 600, color: '#C8A97E', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
            Getting started
          </p>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 700, color: '#111111', marginBottom: 48 }}>
            Start hosting in 3 simple steps
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map(({ number, title, body, icon: Icon }) => (
              <div key={number}>
                <div className="flex items-center gap-4 mb-4">
                  <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 40, fontWeight: 700, color: '#E8E4DE', lineHeight: 1 }}>{number}</span>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#111111' }}>
                    <Icon size={18} style={{ color: '#C8A97E' }} />
                  </div>
                </div>
                <h3 style={{ fontFamily: 'var(--font-inter)', fontSize: 17, fontWeight: 700, color: '#111111', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', lineHeight: 1.7 }}>{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <a
              href="/auth/signup"
              className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ height: 50, padding: '0 32px', backgroundColor: '#111111', color: 'white', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}
            >
              Apply to host <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-16 px-6 lg:px-16 bg-white">
        <div className="max-w-[1440px] mx-auto">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, fontWeight: 600, color: '#C8A97E', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
            Why Balible?
          </p>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 700, color: '#111111', marginBottom: 48 }}>
            Everything you need to succeed
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {BENEFITS.map(({ Icon, title, body }) => (
              <div key={title}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#F5F1EB' }}>
                  <Icon size={20} strokeWidth={1.5} style={{ color: '#111111' }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-inter)', fontSize: 16, fontWeight: 700, color: '#111111', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', lineHeight: 1.7 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOST STORIES */}
      <section className="py-16 px-6 lg:px-16" style={{ backgroundColor: '#111111' }}>
        <div className="max-w-[1440px] mx-auto">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, fontWeight: 600, color: '#C8A97E', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
            Host stories
          </p>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 700, color: 'white', marginBottom: 48 }}>
            Hear from our hosts
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {HOSTS.map(host => (
              <div key={host.name} className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <img src={host.photo} alt={host.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  <div>
                    <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 700, color: 'white' }}>{host.name}</p>
                    <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{host.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="#C8A97E" color="#C8A97E" />)}
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#C8A97E', marginLeft: 4 }}>{host.rating}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 16 }}>
                  "{host.quote}"
                </p>
                <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Monthly earnings</p>
                  <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#C8A97E', marginTop: 2 }}>{host.earning}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EARNINGS CALCULATOR */}
      <section className="py-16 px-6 lg:px-16" style={{ backgroundColor: '#F5F1EB' }}>
        <div className="max-w-[1440px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, fontWeight: 600, color: '#C8A97E', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                Earnings
              </p>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 700, color: '#111111', marginBottom: 16 }}>
                See what you could earn
              </h2>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#6F675C', lineHeight: 1.7, marginBottom: 24 }}>
                Our hosts set their own prices and availability. Whether you run one session a week or several per day, Balible helps you maximise your earning potential.
              </p>
              <ul className="space-y-3">
                {[
                  'You keep 85% of every booking',
                  'Monthly payouts direct to your bank',
                  'No upfront costs — ever',
                  'Set your own price and capacity',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} style={{ color: '#4A7C59', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#111111' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <EarningsCalculator />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 lg:px-16 bg-white">
        <div className="max-w-[720px] mx-auto">
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 700, color: '#111111', marginBottom: 40, textAlign: 'center' }}>
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E8E4DE' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 hover:bg-ivory transition-colors"
                  style={{ background: 'none', cursor: 'pointer' }}
                >
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 600, color: '#111111', textAlign: 'left', flex: 1, paddingRight: 12 }}>{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={16} style={{ color: '#6F675C', flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: '#6F675C', flexShrink: 0 }} />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', lineHeight: 1.7 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 px-6 lg:px-16 text-center" style={{ backgroundColor: '#C8A97E' }}>
        <div className="max-w-[1440px] mx-auto">
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#111111', marginBottom: 12 }}>
            Ready to share your Bali?
          </h2>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 16, color: 'rgba(0,0,0,0.65)', maxWidth: 440, margin: '0 auto 28px' }}>
            Join 320 hosts already earning from their passion. Your first listing is free.
          </p>
          <a
            href="/auth/signup"
            className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
            style={{ height: 52, padding: '0 36px', backgroundColor: '#111111', color: 'white', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--font-inter)' }}
          >
            Apply to become a host <ArrowRight size={16} />
          </a>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(0,0,0,0.55)', marginTop: 14 }}>
            No upfront cost. Approval within 48 hours.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#111111' }} className="px-6 lg:px-16 pt-10 pb-8">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: 'white' }}>BALIBLE</span>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            © 2024 Balible. All rights reserved.
          </p>
          <div className="flex gap-4">
            {['Privacy', 'Terms', 'Help'].map(l => (
              <a key={l} href="#" style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }} className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
