import type { Metadata } from 'next'
import HomeClient from '@/components/HomeClient'
import { getExperienceCards } from '@/lib/experiences'
import { getPublishedEvents } from '@/lib/event-actions'

export const metadata: Metadata = {
  title: 'Book Authentic Bali Experiences',
  description: 'Discover 200+ curated activities in Bali: wellness retreats, cultural workshops, surf lessons, culinary tours and vehicle rentals led by verified local hosts.',
  alternates: { canonical: 'https://balible.com' },
  openGraph: {
    url: 'https://balible.com',
    type: 'website',
  },
}

export const revalidate = 3600

export default async function HomePage() {
  const [experiences, allEvents] = await Promise.all([
    getExperienceCards(),
    getPublishedEvents(),
  ])
  const now = new Date()
  const upcomingEvents = allEvents.filter(e => new Date(e.date) >= now)
  return <HomeClient experiences={experiences} upcomingEvents={upcomingEvents} />
}
