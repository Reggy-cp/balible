import { Clock, Calendar } from 'lucide-react'
import Navbar from '@/components/Navbar'
import NewsletterSignup from '@/components/NewsletterSignup'
import MobileNav from '@/components/MobileNav'

export const metadata = {
  title: 'Journal — Balible',
  description: 'Stories from Bali — culture, craft, wellness, food, and the people who make the island extraordinary.',
}

const ARTICLES = [
  {
    slug: 'pottery-ubud-living-tradition',
    category: 'Craft & Art',
    title: 'The Potters of Ubud: A Living Tradition',
    excerpt: 'Three kilometres south of Ubud\'s market, in a workshop that smells of wet earth and woodsmoke, Made Sari shapes a pot the way her grandmother taught her — slow hands, total presence. We spent a morning watching her work.',
    author: 'Ayu Dewi Santika',
    authorImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&auto=format&fit=crop&q=80',
    date: 'Jun 1, 2024',
    readMins: 6,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80',
    featured: true,
  },
  {
    slug: 'sound-healing-science-and-soul',
    category: 'Wellness',
    title: 'Sound Healing: Where Science Meets the Sacred',
    excerpt: 'Singing bowls aren\'t new age nonsense. Neuroscientists are studying how resonant frequencies affect the nervous system. We spoke with a Ubud healer and a researcher who both arrived at the same conclusion from opposite directions.',
    author: 'Lena Kovač',
    authorImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&auto=format&fit=crop&q=80',
    date: 'May 18, 2024',
    readMins: 8,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
    featured: false,
  },
  {
    slug: 'kecak-dance-uluwatu-guide',
    category: 'Culture',
    title: 'How to Watch the Kecak Dance Without the Crowd',
    excerpt: 'The Kecak at Uluwatu is one of the most jaw-dropping performances in Asia. It\'s also one of the most crowded. Here\'s how to experience it the way it was meant to be seen — and what to do in the two hours before sunset.',
    author: 'Ni Made Suasti',
    authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
    date: 'May 5, 2024',
    readMins: 5,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
    featured: false,
  },
  {
    slug: 'jimbaran-seafood-guide',
    category: 'Food & Drink',
    title: 'Jimbaran After Dark: A Guide to the Beach Warungs',
    excerpt: 'By 6pm, the fishing boats have come in and the grills are lit. A row of rickety tables on the sand, candles flickering in the sea breeze, the whole catch laid out in ice. Not every warung is equal — we\'ve done the research.',
    author: 'Ayu Dewi Santika',
    authorImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&auto=format&fit=crop&q=80',
    date: 'Apr 22, 2024',
    readMins: 7,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80',
    featured: false,
  },
  {
    slug: 'sidemen-valley-east-bali',
    category: 'Travel',
    title: 'Sidemen: The Valley Most Visitors Never Find',
    excerpt: 'While Seminyak fills with pool parties and Ubud with yoga retreats, Sidemen sits quietly in the shadow of Mount Agung — emerald terraces, women weaving ikat at wooden looms, no one trying to sell you anything. We went and didn\'t want to leave.',
    author: 'James Whitfield',
    authorImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&auto=format&fit=crop&q=80',
    date: 'Apr 8, 2024',
    readMins: 9,
    image: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=800&auto=format&fit=crop&q=80',
    featured: false,
  },
  {
    slug: 'silver-celuk-village',
    category: 'Craft & Art',
    title: 'Celuk\'s Silver Villages: A Craft Under Pressure',
    excerpt: 'For generations, Celuk has been Bali\'s silver capital. But mass tourism and cheap imports are changing the craft. We visited three workshops — from tourist-trap to extraordinary — and spoke with a third-generation silversmith about what\'s at stake.',
    author: 'Ni Made Suasti',
    authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
    date: 'Mar 27, 2024',
    readMins: 11,
    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&auto=format&fit=crop&q=80',
    featured: false,
  },
]

const CATEGORIES = ['All', 'Craft & Art', 'Wellness', 'Culture', 'Food & Drink', 'Travel', 'Local Stories']

export default function BlogPage() {
  const featured = ARTICLES[0]
  const rest = ARTICLES.slice(1)

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh' }}>

      <Navbar />

      {/* HEADER */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 pt-14 pb-10 text-center">
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, letterSpacing: '0.2em', color: '#C8A97E', textTransform: 'uppercase', marginBottom: 12 }}>Balible Journal</p>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, color: '#111111', marginBottom: 14 }}>
          Stories from the Island
        </h1>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 16, color: '#6F675C', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Culture, craft, food, and the people who make Bali what it is. Slow reading for slow travel.
        </p>
      </div>

      {/* CATEGORY PILLS */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 pb-10">
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat, i) => (
            <span
              key={cat}
              className="flex-shrink-0 px-4 py-2 rounded-full cursor-pointer"
              style={{
                backgroundColor: i === 0 ? '#111111' : 'white',
                color: i === 0 ? 'white' : '#6F675C',
                border: `1px solid ${i === 0 ? '#111111' : '#E8E4DE'}`,
                fontSize: 13, fontWeight: i === 0 ? 600 : 400,
              }}
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 pb-20">

        {/* FEATURED ARTICLE */}
        <a
          href={`/blog/${featured.slug}`}
          className="block bg-white rounded-2xl overflow-hidden mb-8 hover:shadow-lg transition-shadow"
          style={{ border: '1px solid #E8E4DE', textDecoration: 'none' }}
        >
          <div className="grid lg:grid-cols-2">
            <div className="relative" style={{ minHeight: 320 }}>
              <img src={featured.image} alt={featured.title} className="w-full h-full object-cover absolute inset-0" />
              <span
                className="absolute top-5 left-5 px-3 py-1 rounded-full"
                style={{ backgroundColor: '#C8A97E', color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
              >
                Featured
              </span>
            </div>
            <div className="p-8 lg:p-10 flex flex-col justify-center">
              <span
                className="inline-block px-3 py-1 rounded-full mb-4 self-start"
                style={{ backgroundColor: '#F5F1EB', color: '#C8A97E', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}
              >
                {featured.category}
              </span>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(22px, 2.5vw, 30px)', fontWeight: 700, color: '#111111', lineHeight: 1.2, marginBottom: 14 }}>
                {featured.title}
              </h2>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#6F675C', lineHeight: 1.8, marginBottom: 20 }}>
                {featured.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={featured.authorImage} alt={featured.author} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: '#111111' }}>{featured.author}</p>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 12, color: '#6F675C' }}>{featured.date}</span>
                      <span style={{ color: '#E8E4DE' }}>·</span>
                      <Clock size={11} style={{ color: '#6F675C' }} />
                      <span style={{ fontSize: 12, color: '#6F675C' }}>{featured.readMins} min read</span>
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 13, color: '#C8A97E', fontWeight: 600 }}>Read →</span>
              </div>
            </div>
          </div>
        </a>

        {/* ARTICLE GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map(article => (
            <a
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
              style={{ border: '1px solid #E8E4DE', textDecoration: 'none' }}
            >
              <div style={{ height: 200, overflow: 'hidden' }}>
                <img src={article.image} alt={article.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <span
                  className="inline-block px-2.5 py-0.5 rounded-full mb-3"
                  style={{ backgroundColor: '#F5F1EB', color: '#C8A97E', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}
                >
                  {article.category}
                </span>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111111', lineHeight: 1.3, marginBottom: 10 }}>
                  {article.title}
                </h3>
                <p className="line-clamp-2" style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C', lineHeight: 1.7, marginBottom: 14 }}>
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #E8E4DE' }}>
                  <div className="flex items-center gap-2">
                    <img src={article.authorImage} alt={article.author} className="w-7 h-7 rounded-full object-cover" />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#111111' }}>{article.author.split(' ')[0]}</p>
                      <div className="flex items-center gap-1">
                        <Calendar size={10} style={{ color: '#6F675C' }} />
                        <span style={{ fontSize: 11, color: '#6F675C' }}>{article.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={11} style={{ color: '#6F675C' }} />
                    <span style={{ fontSize: 11, color: '#6F675C' }}>{article.readMins} min</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* NEWSLETTER STRIP */}
        <div className="mt-16 rounded-2xl p-10 text-center" style={{ backgroundColor: '#111111' }}>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, letterSpacing: '0.2em', color: '#C8A97E', textTransform: 'uppercase', marginBottom: 10 }}>New stories, every fortnight</p>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(22px, 2.5vw, 30px)', fontWeight: 700, color: 'white', marginBottom: 8 }}>
            Join the Journal
          </h2>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 24, maxWidth: 380, margin: '0 auto 24px' }}>
            No spam. Just one good story about Bali every two weeks, written by people who live here.
          </p>
          <NewsletterSignup dark />
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#111111', padding: '40px 24px 28px' }}>
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <a href="/" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: 'white', textDecoration: 'none' }}>BALIBLE</a>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>© 2024 Balible. All rights reserved.</p>
          <div className="flex gap-6">
            {[{ label: 'Experiences', href: '/search' }, { label: 'Destinations', href: '/destinations' }, { label: 'For Hosts', href: '/for-hosts' }].map(({ label, href }) => (
              <a key={label} href={href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }} className="hover:text-white transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </footer>
      <MobileNav />
    </div>
  )
}
