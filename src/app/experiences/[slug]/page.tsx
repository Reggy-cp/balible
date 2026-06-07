import { notFound } from 'next/navigation'
import { Heart, ShoppingBag, User, MapPin, Star, Clock, Users, Globe, Camera, Menu } from 'lucide-react'
import BookingWidget from '@/components/BookingWidget'
import ExperienceTabs from '@/components/ExperienceTabs'
import RecommendationsSection from '@/components/RecommendationsSection'
import { prisma } from '@/lib/prisma'

// ── Static fallback (used when DB is not yet connected) ───────────────────────

type ExpData = {
  slug: string; title: string; area: string; price: number; duration: string;
  level: string; language: string; maxGuests: number; rating: number; totalReviews: number;
  description: string; highlights: string[]; includes: string[]; excludes: string[];
  meetingPoint: string; images: string[];
  operator: { businessName: string; description: string; avatar?: string | null; rating: number; totalReviews: number; user: { name: string; image?: string | null } };
  reviews: { id: string; rating: number; comment: string; createdAt: Date; user: { name: string; image?: string | null } }[];
}

const STATIC: Record<string, ExpData> = {
  'pottery-making-class': {
    slug: 'pottery-making-class', title: 'Pottery Making Class', area: 'Ubud',
    price: 450000, duration: '2.5 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.9, totalReviews: 128,
    description: 'Step into a world of clay and creativity in the heart of Ubud. Guided by Made Sari — a third-generation Balinese potter — you\'ll learn the ancient art of hand-building and wheel throwing in a lush rice terrace compound.',
    highlights: ['Hand-build with third-generation Balinese potter Made Sari', 'Learn traditional and modern wheel-throwing techniques', 'Create your own vessel to take home', 'Set in a lush rice terrace compound in the heart of Ubud', 'All materials and tools provided — no experience needed'],
    includes: ['All clay and materials', 'Use of potter\'s wheel and tools', 'Glazing materials', 'Finished piece to take home', 'Welcome drink'],
    excludes: ['Transport to studio', 'Gratuities', 'Additional clay purchases'],
    meetingPoint: 'Made Sari Pottery Studio, Jl. Raya Tegallalang, Ubud',
    images: [
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1616627428492-37e14fac6e14?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Made Sari Pottery Studio', description: 'Third-generation Balinese potter offering authentic clay experiences in the heart of Ubud.', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80', rating: 4.9, totalReviews: 128, user: { name: 'Made Sari', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80' } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'Absolutely magical. Made is an incredible teacher — patient, encouraging, and full of beautiful stories about her family\'s craft. I made a small bowl that I treasure deeply.', createdAt: new Date('2024-05-12'), user: { name: 'Sarah K.', image: null } },
      { id: 'r2', rating: 5, comment: 'One of the best experiences I\'ve had in Bali. The studio setting is serene, and you genuinely leave with something you shaped with your own hands.', createdAt: new Date('2024-04-18'), user: { name: 'Thomas R.', image: null } },
      { id: 'r3', rating: 5, comment: 'The location alone is worth it — surrounded by rice paddies. Wonderful for couples or solo travellers. Made makes everyone feel at ease.', createdAt: new Date('2024-03-25'), user: { name: 'Priya M.', image: null } },
    ],
  },
  'silver-jewelry-workshop': {
    slug: 'silver-jewelry-workshop', title: 'Silver Jewelry Workshop', area: 'Canggu',
    price: 550000, duration: '3 hours', level: 'All levels', language: 'English', maxGuests: 6,
    rating: 4.8, totalReviews: 94,
    description: 'Discover the ancient art of Balinese silversmithing with master craftsman Ketut Suardana in his charming studio nestled in a Canggu coconut grove. From shaping molten silver to stamping traditional motifs, you will craft a wearable piece of Balinese heritage.',
    highlights: ['Create your own silver ring, pendant or bracelet', 'Learn traditional Balinese silversmithing techniques', 'Work with master craftsman Ketut Suardana', 'Studio set in a lush Canggu coconut grove', 'Take home your polished silver creation'],
    includes: ['All silver materials (up to 5g)', 'Use of professional tools', 'Polishing and finishing', 'Finished piece to take home', 'Welcome drink'],
    excludes: ['Additional silver weight beyond 5g', 'Transport to studio', 'Gratuities'],
    meetingPoint: 'Ketut Silver Studio, Jl. Batu Mejan, Canggu',
    images: [
      'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Ketut Silver Artistry', description: 'Second-generation Balinese silversmith with over 20 years of experience, blending traditional craftsmanship with contemporary design in his Canggu studio.', avatar: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&auto=format&fit=crop&q=80', rating: 4.8, totalReviews: 94, user: { name: 'Ketut Suardana', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&auto=format&fit=crop&q=80' } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'Ketut is an absolute master. I made a silver ring and could not believe how beautiful it turned out. The studio atmosphere was incredible — real Balinese charm.', createdAt: new Date('2024-04-08'), user: { name: 'Emma L.', image: null } },
      { id: 'r2', rating: 5, comment: 'The perfect activity for a special occasion. My partner and I each made a matching ring. Such a meaningful memory to take home from Bali.', createdAt: new Date('2024-03-15'), user: { name: 'James W.', image: null } },
      { id: 'r3', rating: 4, comment: 'Fantastic experience. The process is more intricate than I expected but Ketut guides you through every step patiently. My pendant turned out beautifully.', createdAt: new Date('2024-02-22'), user: { name: 'Yuki T.', image: null } },
    ],
  },
  'batik-painting-workshop': {
    slug: 'batik-painting-workshop', title: 'Batik Painting Workshop', area: 'Ubud',
    price: 380000, duration: '3 hours', level: 'All levels', language: 'English', maxGuests: 10,
    rating: 4.7, totalReviews: 64,
    description: 'Immerse yourself in the meditative art of batik — one of UNESCO\'s Intangible Cultural Heritage of Humanity. Using hot wax and natural dyes, you\'ll paint intricate patterns on cotton fabric to create a one-of-a-kind Balinese textile to take home.',
    highlights: ['Learn the traditional wax-resist batik technique', 'Paint your own unique patterns using traditional motifs', 'Use natural plant-based dyes', 'Create a framed wall piece or scarf to take home', 'Set in a serene open-air studio in Ubud'],
    includes: ['All materials (fabric, wax, dyes)', 'Apron and protective gloves', 'Finished batik piece', 'Framing or hemming of your creation', 'Cold drink and snack'],
    excludes: ['Transport to studio', 'Additional fabric', 'Gratuities'],
    meetingPoint: 'Ubud Batik Studio, Jl. Hanoman, Ubud',
    images: [
      'https://images.unsplash.com/photo-1616627428492-37e14fac6e14?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Ubud Batik Studio', description: 'A family-run batik studio in Ubud sharing the art of traditional Indonesian textile art with visitors from around the world.', avatar: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=200&auto=format&fit=crop&q=80', rating: 4.7, totalReviews: 64, user: { name: 'Ni Wayan Artini', image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=200&auto=format&fit=crop&q=80' } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'Such a peaceful and creative experience. I made a beautiful batik scarf and learned so much about the history of this art form. Highly recommend!', createdAt: new Date('2024-05-01'), user: { name: 'Sophie M.', image: null } },
      { id: 'r2', rating: 4, comment: 'Really enjoyable workshop. The instructor was patient and knowledgeable. My batik piece is now proudly hanging on my wall back home.', createdAt: new Date('2024-04-12'), user: { name: 'David K.', image: null } },
    ],
  },
  'traditional-batik-workshop': {
    slug: 'traditional-batik-workshop', title: 'Batik Painting Class', area: 'Ubud',
    price: 420000, duration: '2 hours', level: 'All levels', language: 'English', maxGuests: 10,
    rating: 4.7, totalReviews: 84,
    description: 'Discover the ancient art of batik in a hands-on class in the heart of Ubud. Using the traditional tjanting tool and hot wax, you\'ll create intricate resist patterns on fabric before dyeing your cloth in rich natural colours.',
    highlights: ['Use the traditional tjanting wax tool', 'Choose from a range of traditional Balinese motifs', 'Natural dyes from local plants and minerals', 'Take home your finished batik cloth', 'Small group class (max 10 people)'],
    includes: ['All materials and tools', 'Apron', 'Finished batik piece', 'Welcome drink'],
    excludes: ['Transport', 'Gratuities'],
    meetingPoint: 'Jl. Monkey Forest, Ubud',
    images: [
      'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1616627428492-37e14fac6e14?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Bali Batik Arts', description: 'Family-run batik studio bringing the UNESCO-recognized art of batik to visitors from around the world.', avatar: null, rating: 4.7, totalReviews: 84, user: { name: 'Wayan Artini', image: null } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'Wonderful class — the instructor made it easy and fun even for a complete beginner. My batik is now framed in my living room!', createdAt: new Date('2024-04-20'), user: { name: 'Claire B.', image: null } },
      { id: 'r2', rating: 4, comment: 'Really lovely experience, very relaxing and creative. The studio is charming and the teacher is patient.', createdAt: new Date('2024-03-10'), user: { name: 'Marco F.', image: null } },
    ],
  },
  'sound-healing-journey': {
    slug: 'sound-healing-journey', title: 'Sound Healing Journey', area: 'Ubud',
    price: 350000, duration: '90 minutes', level: 'All levels', language: 'English', maxGuests: 12,
    rating: 4.8, totalReviews: 178,
    description: 'Surrender to the ancient healing power of Tibetan singing bowls, gongs, and crystal resonators in a sacred ceremony led by master healer Nina Putri. Held in a bamboo pavilion surrounded by jungle, this transformative session quiets the mind and restores the soul.',
    highlights: ['Guided by certified sound healer Nina Putri', 'Experience Tibetan bowls, gongs, and crystal resonators', 'Set in a sacred bamboo pavilion in the Ubud jungle', 'Includes guided breathwork and meditation', 'Leave feeling deeply rested and realigned'],
    includes: ['Welcome herbal tea', 'Yoga mat and bolster', 'Eye pillow and blanket', 'Post-session guided integration', 'Digital sound healing resources'],
    excludes: ['Transport to venue', 'Gratuities', 'Private session upgrade'],
    meetingPoint: 'Sukha Healing Space, Jl. Raya Penestanan, Ubud',
    images: [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Sukha Healing Space', description: 'A sanctuary of stillness in the heart of Ubud, offering sound healing, breathwork and meditation with trained Balinese healers.', avatar: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=200&auto=format&fit=crop&q=80', rating: 4.8, totalReviews: 178, user: { name: 'Nina Putri', image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=200&auto=format&fit=crop&q=80' } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'One of the most profound experiences of my life. Nina holds the space with such grace and wisdom. I left feeling like a completely new person.', createdAt: new Date('2024-05-08'), user: { name: 'Rachel T.', image: null } },
      { id: 'r2', rating: 5, comment: 'I was sceptical at first but the sound bath genuinely shifted something in me. The bamboo pavilion setting is magical. Totally transformative.', createdAt: new Date('2024-04-25'), user: { name: 'Lucas P.', image: null } },
      { id: 'r3', rating: 5, comment: 'Nina is extraordinary. Her knowledge of sound healing is deep and she creates such a safe, nurturing environment. I go every time I visit Bali.', createdAt: new Date('2024-03-14'), user: { name: 'Hana S.', image: null } },
    ],
  },
  'sunrise-yoga-class': {
    slug: 'sunrise-yoga-class', title: 'Sunrise Yoga & Meditation', area: 'Canggu',
    price: 250000, duration: '75 minutes', level: 'All levels', language: 'English', maxGuests: 15,
    rating: 4.9, totalReviews: 203,
    description: 'Greet the Balinese dawn with a flowing Hatha yoga practice followed by silent meditation, held on an open-air rooftop overlooking Canggu\'s famous rice fields. A perfect way to begin your day with intention, breath and stillness.',
    highlights: ['Sunrise practice on an open-air rooftop', 'Views across Canggu\'s iconic rice fields', 'Mixed-level Hatha yoga suitable for all', 'Closing 15-minute guided meditation', 'Followed by fresh coconut and fruit'],
    includes: ['Yoga mat and props', 'Fresh coconut and seasonal fruit', 'Filtered water', 'Post-class herbal tea'],
    excludes: ['Transport', 'Gratuities', 'Private instruction'],
    meetingPoint: 'Jiwa Yoga Rooftop, Jl. Batu Mejan, Canggu (look for the blue gate)',
    images: [
      'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Jiwa Yoga Canggu', description: 'A beloved Canggu yoga studio with rooftop classes, breathwork sessions and sound healing for the wandering soul.', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80', rating: 4.9, totalReviews: 203, user: { name: 'Komang Dewi', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80' } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'The most beautiful way to start the day. The sunrise over the rice fields during shavasana was unforgettable. Komang is a wonderful teacher.', createdAt: new Date('2024-05-14'), user: { name: 'Anna G.', image: null } },
      { id: 'r2', rating: 5, comment: 'Went three mornings in a row — that good! Great for all levels. The coconut at the end is the perfect reward.', createdAt: new Date('2024-04-20'), user: { name: 'Ben R.', image: null } },
    ],
  },
  'water-temple-purification': {
    slug: 'water-temple-purification', title: 'Water Temple Purification', area: 'Gianyar',
    price: 600000, duration: '4 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.8, totalReviews: 78,
    description: 'Embark on a deeply spiritual journey to Tirta Empul — Bali\'s most sacred water temple — guided by temple priest Wayan Gede. This intimate ceremony includes a traditional purification ritual in the holy spring, a blessing from a local priest, and a guided meditation in the temple grounds.',
    highlights: ['Private purification ceremony at Tirta Empul', 'Guided by local priest Wayan Gede', 'Traditional blessing and Balinese prayer offering', 'Visit to the inner temple sanctum (restricted access)', 'Peaceful meditation in the sacred gardens'],
    includes: ['Temple entrance fee', 'Traditional sarong and sash', 'Ceremonial flower offerings', 'Bottled water and light snack', 'English-speaking temple guide'],
    excludes: ['Transport to temple', 'Photography services', 'Gratuities'],
    meetingPoint: 'Tirta Empul Temple Gate, Tampaksiring, Gianyar',
    images: [
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Sacred Bali Ceremonies', description: 'Led by Wayan Gede, a third-generation temple guide and priest offering authentic spiritual experiences at Bali\'s most sacred sites.', avatar: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=200&auto=format&fit=crop&q=80', rating: 4.8, totalReviews: 78, user: { name: 'Wayan Gede', image: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=200&auto=format&fit=crop&q=80' } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'A deeply moving experience. Wayan is wise, warm and gives you true access to the sacred nature of the ceremony. I felt genuinely changed afterwards.', createdAt: new Date('2024-04-30'), user: { name: 'Maria C.', image: null } },
      { id: 'r2', rating: 5, comment: 'Wayan brought so much meaning to every part of the ceremony. We accessed parts of the temple most tourists never see. Unforgettable.', createdAt: new Date('2024-03-22'), user: { name: 'Tom H.', image: null } },
    ],
  },
  'uluwatu-kecak-sunset': {
    slug: 'uluwatu-kecak-sunset', title: 'Uluwatu Sunset & Kecak Dance', area: 'Uluwatu',
    price: 450000, duration: '3 hours', level: 'All levels', language: 'English', maxGuests: 20,
    rating: 4.9, totalReviews: 312,
    description: 'Watch the sun melt into the Indian Ocean from the dramatic cliff-top Uluwatu Temple, then witness the ancient Kecak fire dance performed against the blazing sky. A bucket-list Bali experience that combines natural beauty, Hindu mythology and traditional performance art.',
    highlights: ['Sunset viewing from Uluwatu\'s 70-metre sea cliffs', 'Front-row seats to the legendary Kecak fire dance', 'Story of the Ramayana performed by 100 chanting dancers', 'Temple visit with traditional Balinese guide', 'Small group of max 20 for an intimate experience'],
    includes: ['Temple entrance fee', 'Kecak dance performance ticket', 'Traditional sarong for temple entry', 'Bottled water', 'English-speaking guide'],
    excludes: ['Transport to Uluwatu', 'Dinner', 'Photography services', 'Gratuities'],
    meetingPoint: 'Uluwatu Temple Car Park, Pecatu, Badung',
    images: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Bali Culture Tours', description: 'Specialist in Balinese cultural experiences, offering guided temple tours, dance performances and ceremony visits across the island.', avatar: null, rating: 4.9, totalReviews: 312, user: { name: 'I Nyoman Arta', image: null } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'The Kecak dance at sunset is genuinely one of the most spectacular things I have ever witnessed. The chanting, the fire, the ocean backdrop — absolutely extraordinary.', createdAt: new Date('2024-05-17'), user: { name: 'Giulia R.', image: null } },
      { id: 'r2', rating: 5, comment: 'Don\'t miss this if you\'re in Bali. The cliffs are dramatic and the performance is mesmerising. Our guide Nyoman made the whole experience so much richer.', createdAt: new Date('2024-04-28'), user: { name: 'Chris A.', image: null } },
      { id: 'r3', rating: 5, comment: 'A truly magical evening. We arrived early to explore the temple and stayed for the full sunset. The kecak performers are incredibly talented.', createdAt: new Date('2024-03-31'), user: { name: 'Lena V.', image: null } },
    ],
  },
  'balinese-cooking-class': {
    slug: 'balinese-cooking-class', title: 'Balinese Cooking Class', area: 'Seminyak',
    price: 480000, duration: '3.5 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.8, totalReviews: 156,
    description: 'Journey to a Seminyak market at dawn, hand-pick fresh spices and vegetables with your host, then return to a beautiful open kitchen to cook a full Balinese feast from scratch. Learn the secrets of bumbu (spice paste), satay, lawar and black rice pudding.',
    highlights: ['Morning market visit to Seminyak\'s local pasar', 'Pound your own spice paste using a traditional stone mortar', 'Cook 5–6 authentic Balinese dishes from scratch', 'Sit down and enjoy the full feast you\'ve prepared', 'Recipes and spice pack to take home'],
    includes: ['Market visit', 'All ingredients', 'Full 5–6 dish Balinese meal', 'Welcome coffee or tea', 'Printed recipe booklet', 'Spice blend to take home'],
    excludes: ['Transport to cooking school', 'Alcoholic beverages', 'Gratuities'],
    meetingPoint: 'Warung Dapur Bali, Jl. Kayu Aya, Seminyak',
    images: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Warung Dapur Bali', description: 'Family-run Balinese cooking school in Seminyak teaching the art of traditional island cuisine to food-loving travellers.', avatar: null, rating: 4.8, totalReviews: 156, user: { name: 'Putu Sari', image: null } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'Absolutely loved every moment. The market visit was a highlight and the food we cooked was genuinely delicious. I\'ve already cooked the nasi goreng recipe at home!', createdAt: new Date('2024-05-10'), user: { name: 'Holly B.', image: null } },
      { id: 'r2', rating: 5, comment: 'One of the best cooking classes I\'ve done anywhere in the world. Small group, generous portions and everything was fresh from the market. Highly recommend.', createdAt: new Date('2024-04-05'), user: { name: 'Kenji O.', image: null } },
    ],
  },
  'jimbaran-seafood-sunset': {
    slug: 'jimbaran-seafood-sunset', title: 'Jimbaran Seafood & Sunset', area: 'Jimbaran',
    price: 350000, duration: '2 hours', level: 'All levels', language: 'English', maxGuests: 10,
    rating: 4.6, totalReviews: 89,
    description: 'Dine barefoot on the famous white sands of Jimbaran Bay as the sun sinks below the horizon. Choose your seafood fresh from the ice display — grilled prawns, lobster, fish and clams — and enjoy with cold Bintang and stunning sunset views.',
    highlights: ['Barefoot dining on Jimbaran\'s famous white sand beach', 'Select your seafood fresh from the ice display', 'Grilled over coconut husk for authentic smoky flavour', 'Front-row sunset views over the Indian Ocean', 'Live traditional Balinese music during dinner'],
    includes: ['Reserved beach table', 'Mixed seafood platter for two (prawns, fish, clams)', 'Steamed rice and vegetable sides', 'Cold soft drinks (2 per person)', 'Candles and flower decoration'],
    excludes: ['Transport to Jimbaran', 'Lobster (available at additional cost)', 'Alcoholic beverages', 'Gratuities'],
    meetingPoint: 'Jimbaran Fish Market Beach, Jl. Bukit Permai, Jimbaran',
    images: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Jimbaran Bay Seafood', description: 'Beachfront dining experience on Jimbaran Bay, bringing the freshest local catch to your table as the sun sets over the Indian Ocean.', avatar: null, rating: 4.6, totalReviews: 89, user: { name: 'Made Widia', image: null } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'The sunset, the sand between your toes, the freshest grilled seafood — this is Bali at its absolute best. Don\'t miss it.', createdAt: new Date('2024-05-05'), user: { name: 'Pierre M.', image: null } },
      { id: 'r2', rating: 4, comment: 'Lovely experience. The seafood was fresh and the sunset was gorgeous. Gets busy on weekends so arrive on time for the best tables.', createdAt: new Date('2024-04-14'), user: { name: 'Nadia S.', image: null } },
    ],
  },
  'beginner-surf-lesson': {
    slug: 'beginner-surf-lesson', title: 'Beginner Surf Lesson', area: 'Kuta',
    price: 320000, duration: '2 hours', level: 'Beginner', language: 'English', maxGuests: 6,
    rating: 4.7, totalReviews: 428,
    description: 'Catch your first wave on the legendary breaks of Kuta Beach with a certified ISA surf instructor. Starting on the sand with theory and pop-up technique, you\'ll be riding whitewater waves within the first hour. Fun, safe, and unforgettable.',
    highlights: ['Learn to surf on Bali\'s most beginner-friendly beach', 'Certified ISA surf instructor with 1:2 student ratio', 'Sand lesson covering theory, pop-up and ocean safety', 'Ride your first whitewater waves within 60 minutes', 'Board and rash vest included — all ages and fitness levels welcome'],
    includes: ['Softboard surfboard rental', 'Rash vest and leg rope', 'Certified instructor (1:2 ratio)', 'Pre-surf theory and beach instruction', 'Post-surf fresh water rinse'],
    excludes: ['Transport to Kuta Beach', 'Wetsuit (available to hire)', 'Photos/video (available at extra cost)', 'Gratuities'],
    meetingPoint: 'Kuta Surf School Hut, in front of Hard Rock Hotel, Kuta Beach',
    images: [
      'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Kuta Surf Academy', description: 'Bali\'s most-reviewed surf school with certified ISA instructors, softboard lessons, and surf coaching for all levels on Kuta and Legian Beach.', avatar: null, rating: 4.7, totalReviews: 428, user: { name: 'Komang Surya', image: null } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'I had never surfed before and stood up on my third attempt! Komang is encouraging, patient and makes the whole thing feel safe. Best 2 hours of my trip.', createdAt: new Date('2024-05-19'), user: { name: 'Jake T.', image: null } },
      { id: 'r2', rating: 5, comment: 'Absolutely brilliant. Small group, attentive instructor and we all caught waves. The rash vest is provided so you\'re all set from the moment you arrive.', createdAt: new Date('2024-04-08'), user: { name: 'Mia O.', image: null } },
      { id: 'r3', rating: 4, comment: 'Great fun. Kuta is a perfect beach for beginners — the waves are gentle and the instructor kept us safe the whole time.', createdAt: new Date('2024-03-03'), user: { name: 'Sam D.', image: null } },
    ],
  },
  'snorkeling-amed': {
    slug: 'snorkeling-amed', title: 'Snorkeling at Amed Reef', area: 'Amed',
    price: 420000, duration: '3 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.8, totalReviews: 67,
    description: 'Explore the vibrant coral gardens and USAT Liberty shipwreck off the black-sand beaches of Amed, East Bali. Your guide Putu will take you to three snorkelling sites teeming with reef fish, sea turtles and (if you\'re lucky) mola-mola.',
    highlights: ['Three snorkelling sites including the USAT Liberty shipwreck', 'Chance to snorkel with sea turtles in their natural habitat', 'Vibrant coral gardens with hundreds of reef fish species', 'Remote East Bali setting far from the tourist crowds', 'Full equipment provided — no experience needed'],
    includes: ['Snorkel mask, fins and life vest', 'Boat transport to snorkel sites', 'Certified guide in the water with you', 'Fresh fruit and water on the boat', 'Snorkel briefing and safety talk'],
    excludes: ['Transport to Amed', 'Wetsuit (available to hire)', 'Underwater camera rental', 'Gratuities'],
    meetingPoint: 'Amed Dive Center pier, Jl. Raya Amed, Abang',
    images: [
      'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Amed Ocean Adventures', description: 'East Bali\'s premier snorkelling and dive operator, exploring the rich coral reefs and historic shipwrecks of the Amed coastline since 2010.', avatar: null, rating: 4.8, totalReviews: 67, user: { name: 'Putu Wirawan', image: null } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'The Liberty shipwreck is incredible — coral-encrusted and full of life. Putu found us a sea turtle almost immediately. Truly special.', createdAt: new Date('2024-04-22'), user: { name: 'Franziska M.', image: null } },
      { id: 'r2', rating: 5, comment: 'Worth every rupiah. We snorkelled with at least four turtles and the wreck was breathtaking. Amed itself is gorgeous — so far from the crowds of the south.', createdAt: new Date('2024-03-18'), user: { name: 'Josh C.', image: null } },
    ],
  },
  'rice-terrace-walk': {
    slug: 'rice-terrace-walk', title: 'Tegalalang Rice Terrace Walk', area: 'Ubud',
    price: 280000, duration: '2.5 hours', level: 'Easy', language: 'English', maxGuests: 8,
    rating: 4.8, totalReviews: 192,
    description: 'Walk through the legendary UNESCO-listed Tegalalang rice terraces with a local farmer guide, learning about the ancient Balinese subak irrigation system. Wind through emerald-green paddies, cross bamboo bridges, and pause at a hillside warung for fresh coconut as you soak in one of Bali\'s most iconic views.',
    highlights: ['Guided walk through UNESCO-listed Tegalalang terraces', 'Learn the ancient subak irrigation system from a local farmer', 'Cross hand-crafted bamboo bridges over the valley', 'Pause at a traditional hillside warung for fresh coconut', 'Golden hour light on the rice paddies (afternoon tours)'],
    includes: ['English-speaking farmer guide', 'Fresh coconut at midpoint warung', 'Bottled water', 'Entrance to private terrace sections'],
    excludes: ['Transport to Tegalalang', 'Lunch', 'Gratuities', 'Photography props'],
    meetingPoint: 'Tegalalang Rice Terrace main car park, Jl. Raya Tegalalang, Ubud',
    images: [
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Tegalalang Walking Tours', description: 'Local farmer-guides sharing the living landscape of Tegalalang\'s famous rice terraces and the ancient subak water system with curious travellers.', avatar: null, rating: 4.8, totalReviews: 192, user: { name: 'Gede Arnawa', image: null } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'Gede was wonderful — so knowledgeable about the history of the terraces and the subak system. The walk itself is stunning and we had sections of the terrace completely to ourselves.', createdAt: new Date('2024-05-16'), user: { name: 'Isabelle D.', image: null } },
      { id: 'r2', rating: 5, comment: 'A beautiful, gentle walk through an impossibly green landscape. The coconut stop was a perfect touch. Book the afternoon tour for the best light.', createdAt: new Date('2024-04-03'), user: { name: 'Marcus T.', image: null } },
      { id: 'r3', rating: 4, comment: 'Lovely guided experience. The private sections away from the tourist crowds make this worth it over going alone. Gede is knowledgeable and fun.', createdAt: new Date('2024-03-09'), user: { name: 'Priya S.', image: null } },
    ],
  },
  'natural-dye-workshop': {
    slug: 'natural-dye-workshop', title: 'Natural Dye Workshop', area: 'Sidemen',
    price: 380000, duration: '3 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.7, totalReviews: 31,
    description: 'Journey to the village of Sidemen in East Bali for an immersive natural dye workshop in a traditional weaving compound. Learn to extract colour from roots, bark and flowers, then dye a piece of silk or cotton using ancient techniques passed down through generations.',
    highlights: ['Forage for natural dye plants in the surrounding gardens', 'Extract vivid colours from turmeric, indigo, teak and morinda', 'Dye your own silk scarf using traditional bundle-tying techniques', 'Set in a working weaving compound in the village of Sidemen', 'Far from tourist crowds — a deeply authentic experience'],
    includes: ['All dye materials and fabric', 'Foraging walk with guide', 'Finished dyed silk scarf', 'Traditional Balinese snack and drink'],
    excludes: ['Transport to Sidemen (approx. 1.5 hrs from Ubud)', 'Gratuities', 'Additional fabric'],
    meetingPoint: 'Sidemen Weaving Village, Jl. Raya Sidemen, Karangasem',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1616627428492-37e14fac6e14?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Sidemen Weave & Dye', description: 'A family compound in Sidemen preserving the ancient art of natural dyeing and traditional weaving, welcoming visitors to learn and participate.', avatar: null, rating: 4.7, totalReviews: 31, user: { name: 'Ni Made Suari', image: null } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'A hidden gem. Sidemen is utterly beautiful and the workshop was unlike anything I\'ve done. My naturally dyed scarf is my favourite souvenir from Bali.', createdAt: new Date('2024-05-03'), user: { name: 'Clara W.', image: null } },
      { id: 'r2', rating: 4, comment: 'Magical experience in a stunning setting. The drive to Sidemen is part of the adventure. Highly recommend combining with a night or two in the village.', createdAt: new Date('2024-03-28'), user: { name: 'Oliver N.', image: null } },
    ],
  },
  'wood-carving-workshop': {
    slug: 'wood-carving-workshop', title: 'Wood Carving Workshop', area: 'Mas, Ubud',
    price: 500000, duration: '4 hours', level: 'Beginner-friendly', language: 'English', maxGuests: 6,
    rating: 4.6, totalReviews: 47,
    description: 'Learn the sacred art of Balinese wood carving in Mas — the most famous woodcarving village in Bali. Under the patient guidance of master carver I Nyoman Karsa, you\'ll chisel your own small deity or decorative panel from fragrant suar wood.',
    highlights: ['Learn Balinese carving from master carver I Nyoman Karsa', 'Chisel your own small decorative panel from suar wood', 'Set in the heart of Mas, Bali\'s most famous carving village', 'Visit the village workshop and see master carvers at work', 'Take home your finished carving — a true Bali heirloom'],
    includes: ['All carving tools and suar wood', 'Protective equipment', 'Finished carved piece', 'Welcome drink and snack'],
    excludes: ['Transport to Mas', 'Finishing oils and stains (available to purchase)', 'Gratuities'],
    meetingPoint: 'Karsa Wood Studio, Jl. Raya Mas, Mas Village, Ubud',
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1616627428492-37e14fac6e14?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Karsa Wood Studio', description: 'Third-generation wood carving family in Mas Village, Ubud, teaching traditional Balinese carving to visitors in their family studio.', avatar: null, rating: 4.6, totalReviews: 47, user: { name: 'I Nyoman Karsa', image: null } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'I Nyoman is a real master and an incredibly patient teacher. My carving is not perfect but I am incredibly proud of it. A truly special craft to learn.', createdAt: new Date('2024-04-16'), user: { name: 'Daniel R.', image: null } },
      { id: 'r2', rating: 4, comment: 'Wonderful 4 hours. The workshop is beautiful and the village itself is worth a wander. A unique experience that you won\'t find in any other country.', createdAt: new Date('2024-03-07'), user: { name: 'Amelia H.', image: null } },
    ],
  },
  'rattan-weaving-class': {
    slug: 'rattan-weaving-class', title: 'Rattan Weaving Class', area: 'Sidemen',
    price: 350000, duration: '2.5 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.8, totalReviews: 29,
    description: 'Sit with the women of Sidemen and learn the meditative art of rattan weaving. Guided by village artisan Ni Komang Ayu, you\'ll weave a small basket or decorative tray using dried rattan strips — a skill unchanged for centuries in this East Bali village.',
    highlights: ['Learn rattan weaving from village artisan Ni Komang Ayu', 'Weave a small basket or tray from natural rattan strips', 'Set in a traditional village compound in Sidemen, East Bali', 'Small group (max 8) for a truly personal experience', 'Surrounded by rice terraces and Mount Agung views'],
    includes: ['All rattan materials and tools', 'Finished woven piece to take home', 'Traditional Balinese snack and tea'],
    excludes: ['Transport to Sidemen', 'Gratuities', 'Additional materials'],
    meetingPoint: 'Ayu Weaving Village, Jl. Raya Sidemen, Karangasem (coordinates shared on booking)',
    images: [
      'https://images.unsplash.com/photo-1605522469906-3fe226b356bc?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Sidemen Village Crafts', description: 'A women\'s weaving collective in Sidemen, East Bali, preserving traditional rattan craft and welcoming visitors to learn and support their community.', avatar: null, rating: 4.8, totalReviews: 29, user: { name: 'Ni Komang Ayu', image: null } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'Sitting with the women of the village, weaving and laughing together — this was the most authentic experience of my entire trip to Bali. The scenery is spectacular.', createdAt: new Date('2024-05-12'), user: { name: 'Sarah B.', image: null } },
      { id: 'r2', rating: 5, comment: 'Quiet, meditative, beautiful. Ayu is warm and encouraging. My little basket is one of my most treasured possessions.', createdAt: new Date('2024-04-09'), user: { name: 'Elise G.', image: null } },
    ],
  },
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ExperienceDetailPage({ params }: { params: { slug: string } }) {
  let experience: ExpData | null = null
  let allOthers: {slug:string;title:string;category:string;area:string;price:number;rating:number;totalReviews:number;images:string[]}[] = []

  // Try DB first; gracefully fall back to static data if not yet connected
  try {
    const dbExp = await prisma.experience.findUnique({
      where: { slug: params.slug },
      include: {
        operator: { include: { user: true } },
        reviews: { include: { user: true }, orderBy: { createdAt: 'desc' }, take: 10 },
      },
    })

    if (dbExp) {
      experience = {
        slug: dbExp.slug, title: dbExp.title, area: dbExp.area,
        price: dbExp.price, duration: dbExp.duration, level: dbExp.level,
        language: dbExp.language, maxGuests: dbExp.maxGuests,
        rating: dbExp.rating, totalReviews: dbExp.totalReviews,
        description: dbExp.description, highlights: dbExp.highlights,
        includes: dbExp.includes, excludes: dbExp.excludes,
        meetingPoint: dbExp.meetingPoint, images: dbExp.images,
        operator: {
          businessName: dbExp.operator.businessName,
          description: dbExp.operator.description,
          avatar: dbExp.operator.avatar,
          rating: dbExp.operator.rating,
          totalReviews: dbExp.operator.totalReviews,
          user: { name: dbExp.operator.user.name, image: dbExp.operator.user.image },
        },
        reviews: dbExp.reviews.map((r: typeof dbExp.reviews[number]) => ({
          id: r.id, rating: r.rating, comment: r.comment, createdAt: r.createdAt,
          user: { name: r.user.name, image: r.user.image },
        })),
      }

      const others = await prisma.experience.findMany({
        where: { status: 'ACTIVE', NOT: { slug: params.slug } },
        select: { slug: true, title: true, category: true, area: true, price: true, rating: true, totalReviews: true, images: true },
      })
      allOthers = others.map((e: typeof others[number]) => ({ ...e, category: String(e.category), area: String(e.area) }))
    }
  } catch {
    // DB not connected — use static fallback
  }

  // Fall back to static data if DB returned nothing
  if (!experience) {
    experience = STATIC[params.slug] ?? null
  }
  if (!experience) notFound()

  const thumbPhotos = experience.images.slice(0, 4)
  while (thumbPhotos.length < 4) thumbPhotos.push(thumbPhotos[0])

  const currentForRec = {
    slug: experience.slug, title: experience.title,
    category: 'WELLNESS', area: experience.area,
    price: experience.price, rating: experience.rating,
    totalReviews: experience.totalReviews, images: experience.images,
  }

  return (
    <div style={{ fontFamily: 'var(--font-inter)' }}>

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-white" style={{ height: 64, borderBottom: '1px solid #E8E4DE' }}>
        <div className="flex items-center justify-between h-full px-6 lg:px-16 max-w-[1440px] mx-auto">
          <a href="/" className="flex flex-col leading-none">
            <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: '#111111' }}>BALIBLE</span>
            <span className="hidden sm:block" style={{ fontSize: 8, letterSpacing: '0.2em', color: '#6F675C', textTransform: 'uppercase' }}>CURATED EXPERIENCES IN BALI</span>
          </a>
          <div className="hidden lg:flex items-center gap-8">
            {['Experiences','Categories','Destinations','For Hosts','About Us'].map(l => (
              <a key={l} href="#" className="hover:text-gold transition-colors" style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#111111' }}>{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Heart size={20} className="cursor-pointer hidden sm:block hover:text-gold transition-colors" style={{ color: '#111111' }} />
            <ShoppingBag size={20} className="cursor-pointer hidden sm:block" style={{ color: '#111111' }} />
            <div className="w-8 h-8 rounded-full border hidden sm:flex items-center justify-center" style={{ borderColor: '#E8E4DE' }}>
              <User size={15} style={{ color: '#111111' }} />
            </div>
            <Menu size={22} className="lg:hidden cursor-pointer" style={{ color: '#111111' }} />
          </div>
        </div>
      </nav>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-8">

        {/* Back link */}
        <a href="/" className="inline-flex items-center gap-1 hover:opacity-70 transition-opacity mb-6 text-coconut" style={{ fontFamily: 'var(--font-inter)', fontSize: 13, textDecoration: 'none' }}>
          ← Back to all experiences
        </a>

        {/* ── PHOTO GALLERY ── */}
        <div className="hidden lg:flex gap-2 mb-8" style={{ height: 380 }}>
          {/* Main */}
          <div className="relative overflow-hidden flex-1" style={{ borderRadius: 12 }}>
            <img src={thumbPhotos[0]} alt={experience.title} className="w-full h-full object-cover" />
          </div>
          {/* 2×2 grid */}
          <div className="grid grid-cols-2 gap-2" style={{ width: '38%' }}>
            {thumbPhotos.slice(1, 5).map((src, i) => (
              <div key={i} className="relative overflow-hidden" style={{ borderRadius: 8 }}>
                <img src={src} alt={`View ${i+2}`} className="w-full h-full object-cover" />
                {i === 3 && (
                  <button className="absolute inset-0 flex items-center justify-center gap-1.5" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                    <Camera size={14} color="white" />
                    <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'white', fontWeight: 500 }}>View all photos</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: single image */}
        <div className="lg:hidden mb-6 overflow-hidden" style={{ height: 240, borderRadius: 12 }}>
          <img src={thumbPhotos[0]} alt={experience.title} className="w-full h-full object-cover" />
        </div>

        {/* ── TWO-COLUMN LAYOUT ── */}
        <div className="flex flex-col lg:flex-row gap-10">

          {/* LEFT */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <MapPin size={12} style={{ color: '#C8A97E' }} />
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>{experience.area}</span>
            </div>

            <h1 className="mt-2" style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700, color: '#111111' }}>
              {experience.title}
            </h1>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Star size={14} fill="#C8A97E" color="#C8A97E" />
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 700, color: '#C8A97E' }}>{experience.rating.toFixed(1)}</span>
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>({experience.totalReviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={12} style={{ color: '#6F675C' }} />
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: '#6F675C' }}>{experience.area}, Bali</span>
              </div>
            </div>

            <p className="mt-4 line-clamp-2" style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#6F675C', lineHeight: 1.7 }}>
              {experience.description}
            </p>
            <button className="mt-1 hover:opacity-70 transition-opacity" style={{ background: 'none', border: 'none', fontFamily: 'var(--font-inter)', fontSize: 14, color: '#C8A97E', cursor: 'pointer', padding: 0 }}>
              Read more →
            </button>

            {/* Info badges */}
            <div className="flex flex-wrap gap-5 mt-5">
              {[
                { Icon: Clock,  text: experience.duration },
                { Icon: Users,  text: experience.level },
                { Icon: Globe,  text: experience.language },
                { Icon: Users,  text: `Max ${experience.maxGuests} people` },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon size={15} strokeWidth={1.5} style={{ color: '#111111' }} />
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#111111' }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Tabs (client island) */}
            <ExperienceTabs exp={experience} />
          </div>

          {/* RIGHT — booking widget (client island) */}
          <div className="lg:w-[340px] flex-shrink-0">
            <BookingWidget price={experience.price} slug={experience.slug} />
          </div>
        </div>
      </div>

      {/* ── AI RECOMMENDATIONS ── */}
      <RecommendationsSection current={currentForRec} others={allOthers} />
    </div>
  )
}
