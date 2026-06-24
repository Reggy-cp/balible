'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const FAQS = [
  { q: 'Who can become a Balible host?', a: 'Anyone based in Bali who can offer an authentic, meaningful experience. We welcome craft artists, healers, cooks, surfers, dive instructors, temple guides, farmers and more. If you have a skill, culture or space to share, we want to hear from you.' },
  { q: 'How much does it cost to list?', a: 'Listing on Balible is completely free. We charge a 15% commission only when a booking is confirmed. You keep 85% of every payment.' },
  { q: 'How and when do I get paid?', a: 'Balible pays out monthly via direct bank transfer to your Indonesian bank account. Payouts for bookings completed in a given month are released on the 5th of the following month.' },
  { q: 'How do I set my availability?', a: 'Once your listing is approved, you manage your own availability calendar from your host dashboard. Open any day, set slot capacities and block dates whenever you need time off.' },
  { q: 'What happens if a guest cancels?', a: 'Balible\'s standard cancellation policy protects hosts: guests who cancel within 24 hours of the experience receive no refund. For cancellations 24–72 hours before, hosts receive 50% of the booking value.' },
  { q: 'How long does approval take?', a: 'Our host review team aims to respond within 48 hours of your application. We may ask for additional photos or details to ensure your listing is its best before going live.' },
]

export default function ForHostsFAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {FAQS.map((faq, i) => (
        <div key={i} className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E8E4DE' }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between p-5 hover:bg-ivory transition-colors"
            style={{ cursor: 'pointer' }}
          >
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 600, color: '#111111', textAlign: 'left', flex: 1, paddingRight: 12 }}>{faq.q}</span>
            {open === i ? <ChevronUp size={16} style={{ color: '#6F675C', flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: '#6F675C', flexShrink: 0 }} />}
          </button>
          {open === i && (
            <div className="px-5 pb-5">
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C', lineHeight: 1.7 }}>{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
