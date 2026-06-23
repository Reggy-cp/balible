import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'
import { getPublishedEvents } from '@/lib/event-actions'
import EventsClientView from './EventsClientView'

export const revalidate = 3600

export const metadata = {
  title: 'Events in Bali — Balible',
  description: 'One-time events hosted by local Bali operators — workshops, festivals, ceremonies, and special experiences.',
}

const TZ = 'Asia/Makassar'

export default async function EventsPage() {
  const raw = await getPublishedEvents()
  const now = new Date()
  const events = [...raw].sort((a, b) => {
    const aDate = new Date(a.date), bDate = new Date(b.date)
    const aFuture = aDate >= now, bFuture = bDate >= now
    if (aFuture && !bFuture) return -1
    if (!aFuture && bFuture) return 1
    return aFuture
      ? aDate.getTime() - bDate.getTime()
      : bDate.getTime() - aDate.getTime()
  })

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F9F9F7', minHeight: '100vh' }}>
      <Navbar />
      <EventsClientView events={events} />
      <Footer />
      <MobileNav />
    </div>
  )
}
