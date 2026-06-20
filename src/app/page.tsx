import HomeClient from '@/components/HomeClient'
import { getExperienceCards } from '@/lib/experiences'
import { getPublishedEvents } from '@/lib/event-actions'

export default async function HomePage() {
  const [experiences, upcomingEvents] = await Promise.all([
    getExperienceCards(),
    getPublishedEvents(),
  ])
  return <HomeClient experiences={experiences} upcomingEvents={upcomingEvents} />
}
