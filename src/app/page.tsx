import HomeClient from '@/components/HomeClient'
import { getExperienceCards } from '@/lib/experiences'
import type { ExperienceCard } from '@/lib/experiences'
import { getPublishedEvents } from '@/lib/event-actions'

const STATIC_EXPERIENCES: ExperienceCard[] = [
  { slug: 'pottery-making-class',      title: 'Pottery Making Class',         area: 'Ubud',     rating: 4.9, reviews: 128, price: 450000, durationMins: 150, duration: '2.5 hours', maxGuests: 8,  category: 'Art & Craft',       categorySlug: 'art-craft',       photo: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=480&auto=format&fit=crop&q=80', featured: true,  badge: 'Bestseller', subcategory: null, level: 'All levels' },
  { slug: 'silver-jewelry-workshop',   title: 'Silver Jewelry Workshop',      area: 'Canggu',   rating: 4.8, reviews: 94,  price: 550000, durationMins: 180, duration: '3 hours',   maxGuests: 6,  category: 'Art & Craft',       categorySlug: 'art-craft',       photo: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=480&auto=format&fit=crop&q=80', featured: true,  badge: 'Bestseller', subcategory: null, level: 'All levels' },
  { slug: 'sound-healing-journey',     title: 'Sound Healing Journey',        area: 'Ubud',     rating: 4.8, reviews: 178, price: 350000, durationMins: 90,  duration: '90 minutes',maxGuests: 10, category: 'Wellness & Healing',           categorySlug: 'wellness',        photo: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=480&auto=format&fit=crop&q=80', featured: true,  badge: 'Bestseller', subcategory: null, level: 'All levels' },
  { slug: 'water-temple-purification', title: 'Water Temple Purification',    area: 'Gianyar',  rating: 4.8, reviews: 78,  price: 600000, durationMins: 240, duration: '4 hours',   maxGuests: 8,  category: 'Culture & Spiritual', categorySlug: 'culture-spiritual',         photo: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=480&auto=format&fit=crop&q=80', featured: false, badge: null,         subcategory: null, level: 'All levels' },
]

export default async function HomePage() {
  const [dbExperiences, upcomingEvents] = await Promise.all([
    getExperienceCards(),
    getPublishedEvents(),
  ])
  const experiences = dbExperiences.length > 0 ? dbExperiences : STATIC_EXPERIENCES
  return <HomeClient experiences={experiences} upcomingEvents={upcomingEvents} />
}
