import type { Metadata } from 'next'
import {
  Star, Shield, TrendingUp, Users, Heart, Globe, ArrowRight,
  CheckCircle2, DollarSign, Calendar, Camera, MessageSquare,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'
import ForHostsEarnings from './ForHostsEarnings'
import ForHostsFAQ from './ForHostsFAQ'

export const metadata: Metadata = {
  title: 'List Your Experience — Become a Balible Host',
  description: 'Join 320+ Balinese hosts earning from their passion. Share your craft, culture or skill with travellers from around the world. Free to list. You keep 85% of every booking.',
  alternates: { canonical: 'https://balible.com/for-hosts' },
  openGraph: {
    title: 'Become a Balible Host — Share Your Bali',
    description: 'Join 320+ Balinese hosts earning from their passion. Share your craft, culture or skill with travellers from around the world.',
    url: 'https://balible.com/for-hosts',
    images: [{ url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&h=630&auto=format&fit=crop&q=80', width: 1200, height: 630, alt: 'Host teaching pottery in Bali' }],
  },
  twitter: { card: 'summary_large_image' },
}

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

export default function ForHostsPage() {
  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: 'white' }}>

      <Navbar />

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
              href="/sign-up/host"
              className="flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ height: 52, padding: '0 28px', backgroundColor: '#C8A97E', color: '#111111', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--font-inter)' }}
            >
              Become A Host <ArrowRight size={16} />
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
          <div className="flex flex-wrap gap-x-8 gap-y-4 mt-10 sm:mt-12">
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
              href="/sign-up/host"
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
      <section id="stories" className="py-16 px-6 lg:px-16" style={{ backgroundColor: '#111111' }}>
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
      <section id="calculator" className="py-16 px-6 lg:px-16" style={{ backgroundColor: '#F5F1EB' }}>
        <div className="max-w-[1440px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
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
            <ForHostsEarnings />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 lg:px-16 bg-white">
        <div className="max-w-[720px] mx-auto">
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 700, color: '#111111', marginBottom: 40, textAlign: 'center' }}>
            Frequently asked questions
          </h2>
          <ForHostsFAQ />
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
            href="/sign-up/host"
            className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
            style={{ height: 52, padding: '0 36px', backgroundColor: '#111111', color: 'white', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--font-inter)' }}
          >
            Become A Host <ArrowRight size={16} />
          </a>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(0,0,0,0.55)', marginTop: 14 }}>
            No upfront cost. Approval within 48 hours.
          </p>
        </div>
      </section>

      <Footer />
      <MobileNav />
    </div>
  )
}
