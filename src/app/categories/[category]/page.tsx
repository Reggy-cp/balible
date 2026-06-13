import { getExperienceCards } from '@/lib/experiences'
import CategoryClient, { type CategoryExp } from './CategoryClient'

// Static fallback for experiences not yet in the database
const STATIC_EXPERIENCES: CategoryExp[] = [
  { slug: 'pottery-making-class',   title: 'Pottery Making Class',             area: 'Ubud',       price: 450000, rating: 4.9, reviews: 128, duration: '2.5 hours',  maxGuests: 8,  image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop&q=80',    badge: 'Bestseller', category: 'art-craft',  subcategory: 'Pottery'           },
  { slug: 'silver-jewelry-workshop', title: 'Silver Jewelry Workshop',          area: 'Canggu',     price: 580000, rating: 4.8, reviews: 94,  duration: '3 hours',    maxGuests: 6,  image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&auto=format&fit=crop&q=80',    badge: null,         category: 'art-craft',  subcategory: 'Jewelry'           },
  { slug: 'batik-painting-workshop', title: 'Batik Painting Workshop',          area: 'Ubud',       price: 380000, rating: 4.7, reviews: 64,  duration: '3 hours',    maxGuests: 10, image: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=600&auto=format&fit=crop&q=80',    badge: null,         category: 'art-craft',  subcategory: 'Painting'          },
  { slug: 'wood-carving-workshop',   title: 'Wood Carving Workshop',            area: 'Mas, Ubud',  price: 500000, rating: 4.6, reviews: 47,  duration: '4 hours',    maxGuests: 6,  image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80',    badge: null,         category: 'art-craft',  subcategory: 'Wood Carving'      },
  { slug: 'natural-dye-workshop',    title: 'Natural Dye Workshop',             area: 'Sidemen',    price: 380000, rating: 4.7, reviews: 31,  duration: '3 hours',    maxGuests: 8,  image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80',    badge: null,         category: 'art-craft',  subcategory: 'Textile'           },
  { slug: 'rattan-weaving-class',    title: 'Rattan Weaving Class',             area: 'Sidemen',    price: 350000, rating: 4.8, reviews: 29,  duration: '2.5 hours',  maxGuests: 8,  image: 'https://images.unsplash.com/photo-1605522469906-3fe226b356bc?w=600&auto=format&fit=crop&q=80',    badge: null,         category: 'art-craft',  subcategory: 'Weaving'           },
  { slug: 'sound-healing-session',   title: 'Sound Healing Journey',            area: 'Ubud',       price: 350000, rating: 4.9, reviews: 212, duration: '90 min',     maxGuests: 12, image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=600&auto=format&fit=crop&q=80',    badge: 'Top Rated',  category: 'wellness',   subcategory: 'Sound Healing'     },
  { slug: 'jamu-wellness-ritual',    title: 'Traditional Jamu Ritual',          area: 'Ubud',       price: 480000, rating: 4.8, reviews: 73,  duration: '2 hours',    maxGuests: 6,  image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&auto=format&fit=crop&q=80',    badge: null,         category: 'wellness',   subcategory: 'Spa & Ritual'      },
  { slug: 'sunrise-yoga-ubud',       title: 'Sunrise Yoga in the Rice Fields',  area: 'Ubud',       price: 280000, rating: 4.9, reviews: 156, duration: '75 min',     maxGuests: 10, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80',    badge: 'Bestseller', category: 'wellness',   subcategory: 'Yoga'              },
  { slug: 'meditation-temple',       title: 'Guided Meditation at Tirta Empul', area: 'Gianyar',    price: 320000, rating: 4.7, reviews: 88,  duration: '2 hours',    maxGuests: 8,  image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&auto=format&fit=crop&q=80',    badge: null,         category: 'wellness',   subcategory: 'Meditation'        },
  { slug: 'water-temple-ceremony',   title: 'Water Temple Purification',        area: 'Gianyar',    price: 420000, rating: 4.7, reviews: 84,  duration: '3 hours',    maxGuests: 10, image: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=600&auto=format&fit=crop&q=80',    badge: null,         category: 'culture',    subcategory: 'Temple & Ceremony' },
  { slug: 'traditional-dance-class', title: 'Legong Dance Masterclass',         area: 'Ubud',       price: 390000, rating: 4.8, reviews: 61,  duration: '2 hours',    maxGuests: 8,  image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&auto=format&fit=crop&q=80',    badge: null,         category: 'culture',    subcategory: 'Dance & Music'     },
  { slug: 'kecak-fire-dance',        title: 'Kecak Fire Dance at Uluwatu',      area: 'Uluwatu',    price: 250000, rating: 4.9, reviews: 318, duration: '1.5 hours',  maxGuests: 20, image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&auto=format&fit=crop&q=80',    badge: 'Iconic',     category: 'culture',    subcategory: 'Dance & Music'     },
  { slug: 'balinese-history-tour',   title: 'Old Bali Heritage Walk',           area: 'Klungkung',  price: 350000, rating: 4.7, reviews: 42,  duration: '3 hours',    maxGuests: 8,  image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80',    badge: null,         category: 'culture',    subcategory: 'History Tour'      },
  { slug: 'balinese-cooking-class',  title: 'Balinese Cooking Class',           area: 'Ubud',       price: 420000, rating: 4.9, reviews: 187, duration: '4 hours',    maxGuests: 8,  image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80',    badge: 'Bestseller', category: 'culinary',   subcategory: 'Cooking Class'     },
  { slug: 'coffee-plantation-tour',  title: 'Coffee Plantation & Tasting Tour', area: 'Kintamani',  price: 320000, rating: 4.8, reviews: 143, duration: '3 hours',    maxGuests: 12, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80',   badge: null,         category: 'culinary',   subcategory: 'Coffee & Tea'      },
  { slug: 'ubud-market-food-tour',   title: 'Ubud Market Food Tour',            area: 'Ubud',       price: 280000, rating: 4.8, reviews: 97,  duration: '3 hours',    maxGuests: 8,  image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&auto=format&fit=crop&q=80',    badge: null,         category: 'culinary',   subcategory: 'Market Tour'       },
  { slug: 'mount-batur-sunrise',     title: 'Mount Batur Sunrise Trek',         area: 'Kintamani',  price: 650000, rating: 4.8, reviews: 241, duration: '6 hours',    maxGuests: 10, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&auto=format&fit=crop&q=80',    badge: 'Top Rated',  category: 'nature',     subcategory: 'Sunrise'           },
  { slug: 'rice-terrace-trek',       title: 'Tegallalang Rice Terrace Trek',    area: 'Ubud',       price: 320000, rating: 4.7, reviews: 103, duration: '3 hours',    maxGuests: 8,  image: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=600&auto=format&fit=crop&q=80',    badge: null,         category: 'nature',     subcategory: 'Rice Terrace'      },
  { slug: 'waterfall-hidden-canyon', title: 'Hidden Waterfall Canyon Hike',     area: 'Aling-Aling',price: 450000, rating: 4.9, reviews: 89,  duration: '5 hours',    maxGuests: 8,  image: 'https://images.unsplash.com/photo-1552083375-1447ce886485?w=600&auto=format&fit=crop&q=80',    badge: null,         category: 'nature',     subcategory: 'Waterfall'         },
  { slug: 'surfing-lesson-canggu',   title: 'Surfing Lesson for Beginners',     area: 'Canggu',     price: 400000, rating: 4.8, reviews: 176, duration: '2 hours',    maxGuests: 6,  image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&auto=format&fit=crop&q=80',    badge: 'Bestseller', category: 'surf-water', subcategory: 'Surfing'           },
  { slug: 'snorkeling-amed',         title: 'Snorkelling at USAT Liberty Wreck',area: 'Amed',       price: 550000, rating: 4.9, reviews: 138, duration: '4 hours',    maxGuests: 8,  image: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=600&auto=format&fit=crop&q=80',    badge: 'Top Rated',  category: 'surf-water', subcategory: 'Snorkelling'       },
  { slug: 'sup-seminyak',            title: 'Stand-Up Paddleboard at Seminyak', area: 'Seminyak',   price: 350000, rating: 4.6, reviews: 52,  duration: '1.5 hours',  maxGuests: 6,  image: 'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=600&auto=format&fit=crop&q=80',    badge: null,         category: 'surf-water', subcategory: 'Stand-Up Paddle'   },
  // Spiritual
  { slug: 'tirta-empul-purification',  title: 'Tirta Empul Holy Water Ritual',      area: 'Gianyar',    price: 420000, rating: 4.9, reviews: 214, duration: '3 hours',   maxGuests: 8,  image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=600&auto=format&fit=crop&q=80', badge: 'Top Rated',  category: 'spiritual', subcategory: 'Holy Water'        },
  { slug: 'balian-healer-session',     title: 'Balian Traditional Healer Session',  area: 'Ubud',       price: 550000, rating: 4.8, reviews: 91,  duration: '2 hours',   maxGuests: 4,  image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop&q=80', badge: null,         category: 'spiritual', subcategory: 'Healing Ritual'    },
  { slug: 'temple-offering-ceremony',  title: 'Balinese Temple Offering Ceremony',  area: 'Ubud',       price: 380000, rating: 4.8, reviews: 127, duration: '2.5 hours', maxGuests: 8,  image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80', badge: 'Bestseller', category: 'spiritual', subcategory: 'Temple & Ceremony' },
  { slug: 'chakra-energy-healing',     title: 'Chakra Balancing & Energy Healing',  area: 'Ubud',       price: 480000, rating: 4.7, reviews: 63,  duration: '90 min',    maxGuests: 4,  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80', badge: null,         category: 'spiritual', subcategory: 'Energy Work'       },
  { slug: 'sunrise-temple-blessing',   title: 'Sunrise Temple Blessing Walk',       area: 'Kintamani',  price: 320000, rating: 4.9, reviews: 78,  duration: '3 hours',   maxGuests: 6,  image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&auto=format&fit=crop&q=80', badge: null,         category: 'spiritual', subcategory: 'Blessing'          },
  { slug: 'melukat-purification',      title: 'Melukat Water Purification Ritual',  area: 'Gianyar',    price: 450000, rating: 4.9, reviews: 102, duration: '2 hours',   maxGuests: 6,  image: 'https://images.unsplash.com/photo-1580674684031-7c6b7f6b7f6b?w=600&auto=format&fit=crop&q=80', badge: null,         category: 'spiritual', subcategory: 'Holy Water'        },
  // Culinary
  { slug: 'balinese-spice-workshop', title: 'Balinese Spice & Herb Workshop',   area: 'Ubud',       price: 360000, rating: 4.9, reviews: 84,  duration: '2.5 hours',  maxGuests: 8,  image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',    badge: 'Top Rated',  category: 'culinary',   subcategory: 'Spice & Herb'      },
  { slug: 'jamu-making-class',       title: 'Traditional Jamu Making Class',    area: 'Ubud',       price: 320000, rating: 4.8, reviews: 61,  duration: '2 hours',    maxGuests: 6,  image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&auto=format&fit=crop&q=80',    badge: null,         category: 'culinary',   subcategory: 'Spice & Herb'      },
  { slug: 'tempeh-fermentation',     title: 'Tempeh Fermentation Workshop',     area: 'Sidemen',    price: 390000, rating: 4.7, reviews: 38,  duration: '3 hours',    maxGuests: 8,  image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80',    badge: null,         category: 'culinary',   subcategory: 'Fermentation'      },
  { slug: 'balinese-dessert-class',  title: 'Balinese Dessert & Jajan Pasar',   area: 'Ubud',       price: 300000, rating: 4.8, reviews: 47,  duration: '2 hours',    maxGuests: 8,  image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&auto=format&fit=crop&q=80',    badge: null,         category: 'culinary',   subcategory: 'Dessert & Sweets'  },
  { slug: 'farm-table-ubud',         title: 'Farm to Table Lunch in the Jungle',area: 'Ubud',       price: 520000, rating: 4.9, reviews: 73,  duration: '4 hours',    maxGuests: 10, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop&q=80',    badge: 'Bestseller', category: 'culinary',   subcategory: 'Farm to Table'     },
  // Local Experts
  { slug: 'vacation-photoshoot-uluwatu', title: 'Golden Hour Vacation Photoshoot',  area: 'Uluwatu',   price: 850000, rating: 4.9, reviews: 116, duration: '90 min',    maxGuests: 6,  image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80', badge: 'Top Rated',  category: 'local-experts', subcategory: 'Photographers'          },
  { slug: 'private-island-guide',        title: 'Private Guide — Your Bali, Your Pace', area: 'Ubud',  price: 700000, rating: 4.8, reviews: 89,  duration: 'Full day',  maxGuests: 6,  image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=600&auto=format&fit=crop&q=80', badge: 'Bestseller', category: 'local-experts', subcategory: 'Guides'                 },
  { slug: 'private-yoga-practitioner',   title: 'Private Yoga & Breathwork Session', area: 'Canggu',   price: 550000, rating: 4.9, reviews: 74,  duration: '75 min',    maxGuests: 4,  image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&auto=format&fit=crop&q=80', badge: null,         category: 'local-experts', subcategory: 'Wellness Practitioners' },
  { slug: 'trusted-babysitter-seminyak', title: 'Trusted Babysitter & Kids Activities', area: 'Seminyak', price: 350000, rating: 4.9, reviews: 67, duration: 'Per 4 hours', maxGuests: 3, image: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&auto=format&fit=crop&q=80', badge: null,        category: 'local-experts', subcategory: 'Childcare'              },
  { slug: 'dog-walker-pet-sitter',       title: 'Dog Walking & Pet Sitting',        area: 'Canggu',    price: 250000, rating: 4.8, reviews: 53,  duration: 'Per visit', maxGuests: 2,  image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&auto=format&fit=crop&q=80', badge: null,         category: 'local-experts', subcategory: 'Pet Care'               },
  { slug: 'creative-mentor-session',     title: 'One-on-One Creative Mentor Session', area: 'Ubud',    price: 480000, rating: 4.8, reviews: 41,  duration: '2 hours',   maxGuests: 2,  image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80', badge: null,         category: 'local-experts', subcategory: 'Creative Mentors'       },
  { slug: 'private-driver-day-rate',     title: 'Private Driver — Full Day Charter', area: 'Seminyak', price: 650000, rating: 4.9, reviews: 138, duration: 'Up to 10 hours', maxGuests: 5, image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&auto=format&fit=crop&q=80', badge: 'Bestseller', category: 'local-experts', subcategory: 'Drivers'             },
]

export async function generateStaticParams() {
  return ['art-craft', 'wellness', 'culture', 'nature', 'surf-water', 'diving', 'water-activities', 'culinary', 'spiritual', 'local-experts'].map(category => ({ category }))
}

// For water-activities we query both SURF_WATER and DIVING
const WATER_ACTIVITY_SLUGS = new Set(['surf-water', 'diving'])

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const { category } = params
  const isWater = category === 'water-activities'

  const dbCards = await getExperienceCards()
  const dbSlugs = new Set(dbCards.map(c => c.slug))

  const dbExps: CategoryExp[] = dbCards
    .filter(c => isWater ? WATER_ACTIVITY_SLUGS.has(c.categorySlug) : c.categorySlug === category)
    .map(c => ({
      slug: c.slug,
      title: c.title,
      area: c.area,
      price: c.price,
      rating: c.rating,
      reviews: c.reviews,
      duration: c.duration,
      maxGuests: c.maxGuests,
      image: c.photo,
      badge: c.badge,
      category: isWater ? 'water-activities' : c.categorySlug,
      subcategory: null,
    }))

  const staticOnly = STATIC_EXPERIENCES.filter(e => {
    if (isWater) return WATER_ACTIVITY_SLUGS.has(e.category) && !dbSlugs.has(e.slug)
    return e.category === category && !dbSlugs.has(e.slug)
  }).map(e => isWater ? { ...e, category: 'water-activities' } : e)

  const initialExperiences = [...dbExps, ...staticOnly]

  return <CategoryClient categorySlug={category} initialExperiences={initialExperiences} />
}
