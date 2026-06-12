import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service — Balible',
  description: 'The terms that govern your use of Balible and bookings made through the platform.',
}

const SECTIONS = [
  {
    title: '1. About Balible',
    body: 'Balible is a booking platform that connects travellers with independent local hosts offering experiences across Bali. Experiences are delivered by the hosts themselves; Balible facilitates discovery, booking, and payment.',
  },
  {
    title: '2. Bookings & Payment',
    body: 'All prices are shown in Indonesian Rupiah (IDR). A 10% service fee is added at checkout and shown in the price breakdown before you confirm. Payment is taken immediately at checkout, and most experiences are instantly confirmed. Your booking confirmation email is your proof of purchase.',
  },
  {
    title: '3. Cancellations & Refunds',
    body: 'Most experiences offer free cancellation up to 24 hours before the start time; some specialist experiences carry a 72-hour policy, always shown on the experience page before you book. If a host cancels, you receive a full refund. Refunds are processed within 1–2 business days on our end and may take a further 3–7 business days to reach your card.',
  },
  {
    title: '4. Your Responsibilities',
    body: 'You agree to provide accurate booking information, arrive at the meeting point on time, and follow reasonable safety instructions from hosts. Some experiences have age, health, or skill requirements listed on the experience page — please check them before booking.',
  },
  {
    title: '5. Host Responsibilities',
    body: 'Hosts are independent operators responsible for delivering their experiences safely and as described. Every host is personally vetted by Balible before listing, but hosts are not employees or agents of Balible.',
  },
  {
    title: '6. Liability',
    body: 'Balible is liable for the booking and payment services we provide directly. Participation in experiences is at your own risk to the extent permitted by Indonesian law; we recommend travel insurance covering activity-based experiences. Nothing in these terms limits liability that cannot be limited by law.',
  },
  {
    title: '7. Reviews & Content',
    body: 'Reviews must reflect your genuine experience. We may remove content that is fraudulent, abusive, or unrelated to the experience. By posting a review you grant Balible a licence to display it on the platform.',
  },
  {
    title: '8. Changes to These Terms',
    body: 'We may update these terms as the platform evolves. Continued use of Balible after changes take effect constitutes acceptance. Material changes will be announced on this page with an updated effective date.',
  },
]

export default function TermsPage() {
  return (
    <div style={{ fontFamily: 'var(--font-inter)' }}>
      <Navbar />
      <section className="py-12 px-6 lg:px-16" style={{ backgroundColor: '#F5F1EB' }}>
        <div className="max-w-[760px] mx-auto">
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 36, color: '#111111', fontWeight: 700 }}>
            Terms of Service
          </h1>
          <p className="mt-2" style={{ fontSize: 14, color: '#6F675C' }}>
            Effective date: June 12, 2026
          </p>
        </div>
      </section>
      <section className="bg-white py-12 px-6 lg:px-16">
        <div className="max-w-[760px] mx-auto">
          <p style={{ fontSize: 15, color: '#6F675C', lineHeight: 1.7 }}>
            These terms govern your use of Balible and any booking you make through the
            platform. By browsing or booking, you agree to them.
          </p>
          {SECTIONS.map(s => (
            <div key={s.title} className="mt-8">
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, color: '#111111', fontWeight: 700 }}>
                {s.title}
              </h2>
              <p className="mt-2" style={{ fontSize: 15, color: '#6F675C', lineHeight: 1.7 }}>
                {s.body}
              </p>
            </div>
          ))}
          <div className="mt-10 p-5 rounded-xl" style={{ backgroundColor: '#F5F1EB', border: '1px solid #E8E4DE' }}>
            <p style={{ fontSize: 14, color: '#6F675C', lineHeight: 1.7 }}>
              Questions about these terms? Email us at{' '}
              <a href="mailto:hello@balible.com" style={{ color: '#C8A97E', textDecoration: 'underline' }}>
                hello@balible.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>
      <Footer />
      <MobileNav />
    </div>
  )
}
