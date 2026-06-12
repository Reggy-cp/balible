import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy — Balible',
  description: 'How Balible collects, uses, and protects your personal information.',
}

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: 'When you browse Balible, we collect basic usage data such as pages visited and device type. When you book an experience, we collect your name, email address, and payment details (processed securely by our payment provider — we never store full card numbers). If you create an account, we also store your profile information and wishlist. If you grant location permission, we use your approximate location only to show experiences near you — it is never stored or shared.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your information to process bookings, send booking confirmations and updates, provide customer support, and improve the platform. If you subscribe to our newsletter, we use your email to send occasional updates about new experiences — you can unsubscribe at any time via the link in any email.',
  },
  {
    title: '3. Sharing with Hosts',
    body: 'When you book an experience, we share your name, group size, and booking details with the host so they can deliver the experience. Hosts are required to use this information solely for fulfilling your booking.',
  },
  {
    title: '4. Third-Party Services',
    body: 'We rely on trusted third parties to operate the platform: payment processing, authentication, and website hosting. These providers only receive the data necessary to perform their service and are bound by their own privacy obligations. We never sell your personal information to anyone.',
  },
  {
    title: '5. Data Retention & Your Rights',
    body: 'We retain booking records for as long as needed for legal and accounting purposes. You may request a copy of your personal data, correct inaccuracies, or request deletion of your account at any time by emailing hello@balible.com. We respond to all requests within 30 days.',
  },
  {
    title: '6. Cookies',
    body: 'We use essential cookies to keep you signed in and remember your wishlist. We do not use third-party advertising cookies.',
  },
  {
    title: '7. Changes to This Policy',
    body: 'We may update this policy as the platform evolves. Material changes will be announced on this page with an updated effective date.',
  },
]

export default function PrivacyPage() {
  return (
    <div style={{ fontFamily: 'var(--font-inter)' }}>
      <Navbar />
      <section className="py-12 px-6 lg:px-16" style={{ backgroundColor: '#F5F1EB' }}>
        <div className="max-w-[760px] mx-auto">
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 36, color: '#111111', fontWeight: 700 }}>
            Privacy Policy
          </h1>
          <p className="mt-2" style={{ fontSize: 14, color: '#6F675C' }}>
            Effective date: June 12, 2026
          </p>
        </div>
      </section>
      <section className="bg-white py-12 px-6 lg:px-16">
        <div className="max-w-[760px] mx-auto">
          <p style={{ fontSize: 15, color: '#6F675C', lineHeight: 1.7 }}>
            Balible connects travellers with local hosts across Bali. We keep the personal
            information we collect to the minimum needed to run the platform, and this page
            explains exactly what we collect and why.
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
              Questions about your data? Email us at{' '}
              <a href="mailto:hello@balible.com" style={{ color: '#C8A97E', textDecoration: 'underline' }}>
                hello@balible.com
              </a>{' '}
              and we&apos;ll get back to you within one business day.
            </p>
          </div>
        </div>
      </section>
      <Footer />
      <MobileNav />
    </div>
  )
}
