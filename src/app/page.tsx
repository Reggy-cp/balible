import HomeClient from '@/components/HomeClient'
import { getExperienceCards } from '@/lib/experiences'
import { getPublishedEvents } from '@/lib/event-actions'

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
