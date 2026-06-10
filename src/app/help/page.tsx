'use client'

import { useState } from 'react'
import { Search, ChevronDown, ChevronUp, MessageCircle, Mail, Phone } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'

const CATEGORIES = [
  {
    id: 'getting-started',
    icon: '🌿',
    title: 'Getting Started',
    desc: 'New to Balible? Start here.',
    faqs: [
      { q: 'What is Balible?', a: 'Balible is a curated booking platform connecting travellers with authentic, small-group experiences led by local hosts across Bali. Every experience is personally reviewed before listing.' },
      { q: 'Do I need to create an account to book?', a: 'You can browse all experiences without an account. To complete a booking, you\'ll be asked for your name and email at checkout — no account required, though creating one lets you track bookings and manage your wishlist.' },
      { q: 'How are experiences selected?', a: 'Every host is discovered through local referrals or direct outreach. Before listing, we visit the host, participate in the experience ourselves, and check reviews. If it doesn\'t pass our curation bar, it doesn\'t go live.' },
      { q: 'Is Balible only available in Bali?', a: 'Yes — Balible is entirely focused on Bali. We believe depth beats breadth. By staying focused, we can offer genuinely curated experiences rather than a generic global catalogue.' },
    ],
  },
  {
    id: 'bookings',
    icon: '📅',
    title: 'Bookings',
    desc: 'Managing your reservations.',
    faqs: [
      { q: 'How do I book an experience?', a: 'Find an experience you love, select a date and number of guests on the experience page, then click "Book this experience." You\'ll be taken to a 4-step checkout: confirm details, enter your info, pay, and receive confirmation instantly.' },
      { q: 'What does "Instant Confirmation" mean?', a: 'Most experiences on Balible are instantly confirmed — your spot is secured the moment payment is processed and you\'ll receive a confirmation email within minutes. No waiting for a host to approve.' },
      { q: 'Can I book for a group?', a: 'Yes. Select the number of guests during checkout (up to 8 for most experiences). For larger groups, contact us directly at hello@balible.com and we\'ll coordinate with the host.' },
      { q: 'How do I find my booking details?', a: 'Your confirmation email contains all booking details including the meeting point, host contact, and booking reference. If you have an account, you can also view all bookings in your Profile → Bookings tab.' },
      { q: 'Can I modify my booking?', a: 'Date changes are subject to host availability. Contact us at least 48 hours before your experience and we\'ll do our best to accommodate. Guest number changes can usually be made up to 24 hours before.' },
    ],
  },
  {
    id: 'payments',
    icon: '💳',
    title: 'Payments',
    desc: 'Pricing, currency, and billing.',
    faqs: [
      { q: 'What currency are prices shown in?', a: 'All prices are shown in Indonesian Rupiah (IDR). Your bank or card provider will convert to your home currency at the prevailing exchange rate. We don\'t add a currency conversion fee.' },
      { q: 'What payment methods are accepted?', a: 'We accept Visa, Mastercard, and American Express. Indonesian users can also pay via GoPay, OVO, or bank transfer. All transactions are protected by 256-bit SSL encryption.' },
      { q: 'Is there a service fee?', a: 'Yes — a 10% service fee is added at checkout. This covers our platform, guest support, and payment processing. It\'s shown clearly in the price breakdown before you confirm.' },
      { q: 'When am I charged?', a: 'Payment is taken immediately at checkout. You\'ll see the charge appear on your statement within 1–3 business days depending on your bank.' },
      { q: 'Can I get a receipt?', a: 'Yes. A payment receipt is included in your booking confirmation email. For business travel, contact us if you need a formal tax invoice.' },
    ],
  },
  {
    id: 'cancellations',
    icon: '↩️',
    title: 'Cancellations & Refunds',
    desc: 'Our cancellation policy.',
    faqs: [
      { q: 'What is the cancellation policy?', a: 'Most experiences offer free cancellation up to 24 hours before the start time. Some specialist experiences (e.g. private temple ceremonies) have a 72-hour policy. The specific policy is always shown on the experience page before you book.' },
      { q: 'How do I cancel a booking?', a: 'Go to Profile → Bookings, find your upcoming booking, and tap "Cancel." Alternatively, email us at hello@balible.com with your booking reference and we\'ll process it within one business day.' },
      { q: 'How long does a refund take?', a: 'Refunds are processed within 1–2 business days on our end. It may take a further 3–7 business days to appear on your card statement depending on your bank.' },
      { q: 'What if the host cancels?', a: 'In the rare event a host cancels, you\'ll receive a full refund and we\'ll proactively offer an alternative experience of equal or greater value at no extra cost.' },
      { q: 'What if there is bad weather?', a: 'For outdoor experiences, we monitor weather closely. If conditions make the experience impossible or unsafe, we\'ll contact you to reschedule or issue a full refund.' },
    ],
  },
  {
    id: 'for-hosts',
    icon: '🏡',
    title: 'For Hosts',
    desc: 'Listing and managing your experience.',
    faqs: [
      { q: 'How do I become a host on Balible?', a: 'Visit our For Hosts page and click "Apply to host." Tell us about your experience and what makes it special. Our host team reviews every application and will be in touch within 5 business days.' },
      { q: 'How much does Balible charge hosts?', a: 'Balible takes a 15% commission from each booking. You keep 85% of every payment, paid directly to your registered bank account within 3 business days after each experience.' },
      { q: 'How do I set my price?', a: 'You set your own price. We\'ll show you how similar experiences are priced on the platform and offer a suggested range, but the final decision is always yours.' },
      { q: 'Can I block dates on my calendar?', a: 'Yes. Your host dashboard includes a full availability calendar. Mark any dates as unavailable and they\'ll be immediately removed from the booking widget on your listing.' },
      { q: 'What support do hosts receive?', a: 'Every host gets a dedicated onboarding call with our host team, professional photography guidance, listing copywriting support, and ongoing access to our host community channel.' },
    ],
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid #E8E4DE' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <span style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 500, color: '#111111', paddingRight: 16 }}>{q}</span>
        {open
          ? <ChevronUp size={16} style={{ color: '#6F675C', flexShrink: 0 }} />
          : <ChevronDown size={16} style={{ color: '#6F675C', flexShrink: 0 }} />}
      </button>
      {open && (
        <div className="pb-4">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', lineHeight: 1.8 }}>{a}</p>
        </div>
      )}
    </div>
  )
}

export default function HelpPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = CATEGORIES.map(cat => ({
    ...cat,
    faqs: search
      ? cat.faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
      : cat.faqs,
  })).filter(cat => cat.faqs.length > 0)

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh' }}>

      <Navbar />

      {/* HERO */}
      <div style={{ backgroundColor: '#111111', padding: '56px 24px' }}>
        <div className="max-w-[720px] mx-auto text-center">
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'white', marginBottom: 14 }}>
            How can we help?
          </h1>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 28 }}>
            Search our knowledge base or browse topics below.
          </p>
          <div className="relative">
            <Search size={16} style={{ color: '#6F675C', position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search help articles…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full outline-none"
              style={{ height: 52, borderRadius: 12, border: 'none', padding: '0 20px 0 46px', fontSize: 15, color: '#111111', fontFamily: 'var(--font-inter)' }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-5 lg:px-8 py-12">

        {/* CATEGORY CARDS */}
        {!search && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                className="p-4 rounded-xl text-left transition-all hover:shadow-md"
                style={{
                  backgroundColor: activeCategory === cat.id ? '#111111' : 'white',
                  border: `1px solid ${activeCategory === cat.id ? '#111111' : '#E8E4DE'}`,
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 22 }}>{cat.icon}</span>
                <h3 style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 700, color: activeCategory === cat.id ? 'white' : '#111111', marginTop: 8, marginBottom: 3 }}>{cat.title}</h3>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: activeCategory === cat.id ? 'rgba(255,255,255,0.6)' : '#6F675C', lineHeight: 1.5 }}>{cat.desc}</p>
              </button>
            ))}
          </div>
        )}

        {/* FAQ SECTIONS */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {(search ? filtered : activeCategory ? filtered.filter(c => c.id === activeCategory) : CATEGORIES).map(cat => (
              <div key={cat.id} className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E8E4DE' }}>
                <div className="flex items-center gap-3 mb-5">
                  <span style={{ fontSize: 20 }}>{cat.icon}</span>
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: '#111111' }}>{cat.title}</h2>
                  <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>{cat.faqs.length} articles</span>
                </div>
                <div>
                  {cat.faqs.map(faq => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
                </div>
              </div>
            ))}
            {search && filtered.length === 0 && (
              <div className="bg-white rounded-2xl p-10 text-center" style={{ border: '1px solid #E8E4DE' }}>
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111111', marginBottom: 8 }}>No results found</p>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>Try a different search or browse the categories above.</p>
              </div>
            )}
          </div>

          {/* CONTACT SIDEBAR */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E8E4DE' }}>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111', marginBottom: 4 }}>Still need help?</h3>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C', marginBottom: 20, lineHeight: 1.6 }}>
                Our team is based in Bali and typically responds within 2 hours during business hours (8am–8pm WITA).
              </p>
              <div className="space-y-3">
                {[
                  { Icon: MessageCircle, label: 'Live Chat', sub: 'Available 8am–8pm WITA', href: '#chat' },
                  { Icon: Mail,          label: 'Email Us', sub: 'hello@balible.com',       href: 'mailto:hello@balible.com' },
                  { Icon: Phone,         label: 'WhatsApp', sub: '+62 811 3892 7441',        href: '#wa' },
                ].map(({ Icon, label, sub, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: '#F5F1EB', textDecoration: 'none' }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#111111' }}>
                      <Icon size={15} style={{ color: '#C8A97E' }} />
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#111111' }}>{label}</p>
                      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: '#6F675C' }}>{sub}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ backgroundColor: '#F0F7F2', border: '1px solid #D4E8DA' }}>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 700, color: '#4A7C59', marginBottom: 5 }}>💚 Emergency during your experience?</p>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#4A7C59', lineHeight: 1.6 }}>
                Call our Bali emergency line: <strong>+62 811 3892 7441</strong><br />
                Available 24/7 for active bookings.
              </p>
            </div>
          </div>
        </div>
      </div>

      <MobileNav />

      <Footer />
    </div>
  )
}
