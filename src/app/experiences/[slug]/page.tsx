import { notFound } from 'next/navigation'
import { MapPin, Star, Clock, Users, Globe, Camera } from 'lucide-react'
import Navbar from '@/components/Navbar'
import BookingWidget from '@/components/BookingWidget'
import ExperienceTabs from '@/components/ExperienceTabs'
import RecommendationsSection from '@/components/RecommendationsSection'
import ReadMore from '@/components/ReadMore'
import WishlistHeart from '@/components/WishlistHeart'
import ShareButton from '@/components/ShareButton'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'
import MobileBookingModal from '@/components/MobileBookingModal'
import ExperienceGallery from '@/components/ExperienceGallery'
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
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&auto=format&fit=crop&q=80',
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
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&auto=format&fit=crop&q=85',
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
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&auto=format&fit=crop&q=80',
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
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&auto=format&fit=crop&q=80',
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
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&auto=format&fit=crop&q=80',
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
  'sound-healing-session': {
    slug: 'sound-healing-session', title: 'Sound Healing Journey', area: 'Ubud',
    price: 350000, duration: '90 minutes', level: 'All levels', language: 'English', maxGuests: 12,
    rating: 4.9, totalReviews: 212,
    description: 'Surrender to the ancient healing power of Tibetan singing bowls, gongs, and crystal resonators in a sacred group ceremony held in a bamboo pavilion deep in the Ubud jungle. Master healer Nina Putri guides you through breathwork and into a state of profound stillness.',
    highlights: ['Guided by certified sound healer Nina Putri', 'Tibetan bowls, crystal resonators, and gong bath', 'Sacred bamboo pavilion set in the Ubud jungle', 'Guided breathwork opening and integration closing', 'Leave feeling deeply restored and realigned'],
    includes: ['Welcome herbal tea', 'Yoga mat, bolster and blanket', 'Eye pillow', 'Post-session integration guide', 'Digital audio resources'],
    excludes: ['Transport to venue', 'Gratuities', 'Private session upgrade'],
    meetingPoint: 'Sukha Healing Space, Jl. Raya Penestanan, Ubud',
    images: [
      'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Sukha Healing Space', description: 'A sanctuary of stillness in the heart of Ubud offering sound healing, breathwork and somatic therapies with Bali\'s most experienced practitioners.', avatar: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=200&auto=format&fit=crop&q=80', rating: 4.9, totalReviews: 212, user: { name: 'Nina Putri', image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=200&auto=format&fit=crop&q=80' } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'One of the most profound experiences of my life. Nina holds the space with such grace. I left feeling like a completely new person.', createdAt: new Date('2024-05-08'), user: { name: 'Rachel T.', image: null } },
      { id: 'r2', rating: 5, comment: 'I was sceptical — not any more. The sound genuinely shifted something in me. The bamboo pavilion setting is magical. Totally transformative.', createdAt: new Date('2024-04-25'), user: { name: 'Lucas P.', image: null } },
      { id: 'r3', rating: 5, comment: 'Nina is extraordinary. I go every time I visit Bali — the experience deepens each time.', createdAt: new Date('2024-03-14'), user: { name: 'Hana S.', image: null } },
    ],
  },
  'jamu-wellness-ritual': {
    slug: 'jamu-wellness-ritual', title: 'Traditional Jamu Ritual', area: 'Ubud',
    price: 480000, duration: '2 hours', level: 'All levels', language: 'English', maxGuests: 6,
    rating: 4.8, totalReviews: 73,
    description: 'Experience the ancient Balinese healing tradition of jamu — herbal medicine made from roots, bark, flowers, and spices. With healer Ibu Wayan, you\'ll forage fresh ingredients from her garden, grind them by hand using a traditional batu giling, and prepare five classic jamu tonics to drink fresh.',
    highlights: ['Forage healing plants from a traditional Balinese garden', 'Grind spices by hand using an ancient stone batu giling', 'Prepare and drink five classic jamu tonics', 'Learn the Balinese understanding of hot and cold foods', 'Take home a printed recipe booklet and dried spice blend'],
    includes: ['All ingredients', 'Use of traditional tools', 'Five jamu tastings', 'Printed recipe booklet', 'Dried spice blend to take home', 'Herbal tea and light snack'],
    excludes: ['Transport to the garden compound', 'Gratuities'],
    meetingPoint: 'Ibu Wayan\'s Garden, Jl. Raya Sanggingan, Ubud (directions on booking confirmation)',
    images: [
      'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Jamu Bali by Ibu Wayan', description: 'Ibu Wayan has been practising traditional Balinese herbal medicine for over thirty years, teaching visitors the ancient art of jamu preparation in her family garden.', avatar: null, rating: 4.8, totalReviews: 73, user: { name: 'Ibu Wayan Sari', image: null } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'This was unlike any wellness experience I\'ve had. Ibu Wayan is a living encyclopedia of Balinese healing plants. The jamu tasted incredible — earthy, spicy, alive.', createdAt: new Date('2024-05-20'), user: { name: 'Petra V.', image: null } },
      { id: 'r2', rating: 5, comment: 'A beautiful two hours. Grinding spices by hand in a lush garden while Ibu Wayan explained every ingredient. Deeply calming and educational.', createdAt: new Date('2024-04-11'), user: { name: 'Tom B.', image: null } },
    ],
  },
  'sunrise-yoga-ubud': {
    slug: 'sunrise-yoga-ubud', title: 'Sunrise Yoga in the Rice Fields', area: 'Ubud',
    price: 280000, duration: '75 minutes', level: 'All levels', language: 'English', maxGuests: 10,
    rating: 4.9, totalReviews: 156,
    description: 'Greet the Balinese dawn with a flowing Hatha yoga practice on an open platform set directly among Ubud\'s famous rice paddies. As the sun rises over Mount Agung and the egrets circle the flooded terraces, your teacher Kadek guides you through breath, movement and stillness.',
    highlights: ['Sunrise yoga platform set directly in the rice fields', 'Views of Mount Agung from the mat', 'Mixed-level Hatha yoga — all welcome', 'Closing guided meditation and pranayama', 'Followed by fresh coconut and seasonal fruit'],
    includes: ['Yoga mat and props', 'Fresh coconut and fruit', 'Filtered water', 'Post-class herbal tea'],
    excludes: ['Transport to the rice field platform', 'Private instruction', 'Gratuities'],
    meetingPoint: 'Sawah Yoga Platform, Jl. Raya Campuhan, Ubud (look for the bamboo gate)',
    images: [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Sawah Yoga Ubud', description: 'Open-air yoga classes set among Ubud\'s living rice terraces, taught by experienced Balinese instructors who have practised here for over a decade.', avatar: null, rating: 4.9, totalReviews: 156, user: { name: 'Kadek Anom', image: null } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'The most beautiful way to start a day. Egrets landing in the paddies during shavasana — I still think about it months later.', createdAt: new Date('2024-05-14'), user: { name: 'Anna G.', image: null } },
      { id: 'r2', rating: 5, comment: 'Went three mornings in a row. The setting is incomparable. Kadek is patient and creates a genuinely welcoming space for all levels.', createdAt: new Date('2024-04-20'), user: { name: 'Ben R.', image: null } },
    ],
  },
  'meditation-temple': {
    slug: 'meditation-temple', title: 'Guided Meditation at Tirta Empul', area: 'Gianyar',
    price: 320000, duration: '2 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.7, totalReviews: 88,
    description: 'Begin the day with a private guided meditation in the sacred gardens of Tirta Empul, one of Bali\'s most spiritually powerful temples. Before the crowds arrive, sit with guide Wayan Gede among the ancient frangipani trees and let the sound of the holy spring carry your practice.',
    highlights: ['Arrive at dawn before the temple opens to the public', 'Seated meditation in the inner sacred garden', 'Guided by temple guide Wayan Gede', 'Introduction to Balinese Hindu meditation philosophy', 'Witness morning ceremonies performed by local priests'],
    includes: ['Temple entrance fee', 'Traditional sarong and sash', 'Guided meditation (45 min)', 'Bottled water', 'Post-session herbal tea'],
    excludes: ['Transport to Tampaksiring', 'Water purification ceremony (available as add-on)', 'Gratuities'],
    meetingPoint: 'Tirta Empul Temple Gate, Tampaksiring, Gianyar (meet at 6:00am)',
    images: [
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Sacred Bali Ceremonies', description: 'Led by Wayan Gede, a third-generation temple guide offering authentic spiritual experiences at Bali\'s most sacred sites.', avatar: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=200&auto=format&fit=crop&q=80', rating: 4.7, totalReviews: 88, user: { name: 'Wayan Gede', image: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=200&auto=format&fit=crop&q=80' } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'The temple at dawn with no one else there — one of the most peaceful experiences I have ever had. Wayan brings such calm and wisdom to the session.', createdAt: new Date('2024-05-01'), user: { name: 'Claire M.', image: null } },
      { id: 'r2', rating: 4, comment: 'A beautiful and unusual way to start a day in Bali. Highly recommend the early start — you have the gardens almost to yourself.', createdAt: new Date('2024-03-22'), user: { name: 'Tom H.', image: null } },
    ],
  },
  'water-temple-ceremony': {
    slug: 'water-temple-ceremony', title: 'Water Temple Purification', area: 'Gianyar',
    price: 420000, duration: '3 hours', level: 'All levels', language: 'English', maxGuests: 10,
    rating: 4.7, totalReviews: 84,
    description: 'Participate in a traditional purification ceremony at Tirta Empul — Bali\'s most sacred water temple — with local priest Wayan Gede as your guide. Wade into the holy spring pools, receive blessings at each of the twenty-two waterspouts, and emerge cleansed, centred and deeply connected to the living faith of Bali.',
    highlights: ['Participate (not just observe) in a real purification ceremony', 'Receive blessings at all twenty-two sacred waterspouts', 'Guided by temple priest Wayan Gede', 'Traditional Balinese prayer offering included', 'Access to the inner temple sanctum'],
    includes: ['Temple entrance fee', 'Traditional sarong and sash for the ceremony', 'Ceremonial flower offerings', 'Bottled water and light snack', 'English-speaking temple priest guide'],
    excludes: ['Transport to Tampaksiring', 'Photography services', 'Gratuities'],
    meetingPoint: 'Tirta Empul Temple Gate, Tampaksiring, Gianyar',
    images: [
      'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Sacred Bali Ceremonies', description: 'Led by Wayan Gede, a third-generation temple guide and priest offering authentic spiritual experiences at Bali\'s most sacred sites.', avatar: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=200&auto=format&fit=crop&q=80', rating: 4.7, totalReviews: 84, user: { name: 'Wayan Gede', image: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=200&auto=format&fit=crop&q=80' } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'Deeply moving. Wayan made sure we understood the meaning of every step. Standing in the holy spring with water streaming over your head — it cleanses something you didn\'t know needed cleansing.', createdAt: new Date('2024-04-30'), user: { name: 'Maria C.', image: null } },
      { id: 'r2', rating: 4, comment: 'A genuinely spiritual experience — not a tourist show. Wayan is deeply knowledgeable and deeply kind. Worth the early morning drive.', createdAt: new Date('2024-03-10'), user: { name: 'James F.', image: null } },
    ],
  },
  'traditional-dance-class': {
    slug: 'traditional-dance-class', title: 'Legong Dance Masterclass', area: 'Ubud',
    price: 390000, duration: '2 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.8, totalReviews: 61,
    description: 'Learn the exquisite Legong — Bali\'s most refined classical dance form — in a hands-on masterclass at Ubud\'s most respected dance studio. Ni Nyoman Sari, a dancer who has performed at the Ubud Palace for twenty years, teaches you the language of eyes, fingers, and flowing headdress.',
    highlights: ['Learn Legong from palace dancer Ni Nyoman Sari', 'Master the precise hand gestures (mudra) and eye movements', 'Dress in a traditional Legong costume for photos', 'Understand the story and mythology of the Legong Keraton', 'Small class of max 8 for personal attention'],
    includes: ['All costumes and accessories for class', 'Printed guide to Balinese mudra gestures', 'Post-class costume photo session', 'Welcome drink'],
    excludes: ['Transport to studio', 'Private session upgrade', 'Gratuities'],
    meetingPoint: 'Semara Ratih Dance Studio, Jl. Raya Lodtunduh, Ubud',
    images: [
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Semara Ratih Dance Studio', description: 'Ubud\'s most respected classical dance school, training Balinese dancers and welcoming visitors to learn the art of Legong, Kecak, and Barong dance.', avatar: null, rating: 4.8, totalReviews: 61, user: { name: 'Ni Nyoman Sari', image: null } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'Ni Nyoman is patient, precise, and deeply passionate. Even with two left feet, I learned enough to understand and truly appreciate the Legong performances I watched afterwards.', createdAt: new Date('2024-05-06'), user: { name: 'Olivia S.', image: null } },
      { id: 'r2', rating: 5, comment: 'The costume session alone was worth it! But the teaching is the real gift. A completely unique experience.', createdAt: new Date('2024-04-01'), user: { name: 'Yuki H.', image: null } },
    ],
  },
  'kecak-fire-dance': {
    slug: 'kecak-fire-dance', title: 'Kecak Fire Dance at Uluwatu', area: 'Uluwatu',
    price: 250000, duration: '1.5 hours', level: 'All levels', language: 'English', maxGuests: 20,
    rating: 4.9, totalReviews: 318,
    description: 'Watch the legendary Kecak fire dance performed at the clifftop Uluwatu Temple as the sun sets behind the performers into the Indian Ocean. A hundred men in concentric circles chant the ancient Ramayana while a fire dancer walks barefoot through blazing coconut husks. One of the great performances on earth.',
    highlights: ['Front-row tickets to the Kecak fire dance at sunset', 'Dramatic clifftop temple setting above the Indian Ocean', 'Guided temple walk before the performance', 'Story of the Ramayana explained by your English-speaking guide', 'Small group for the best viewing position'],
    includes: ['Kecak performance ticket', 'Temple entrance fee', 'Traditional sarong', 'English-speaking guide', 'Bottled water'],
    excludes: ['Transport to Uluwatu', 'Dinner', 'Gratuities'],
    meetingPoint: 'Uluwatu Temple Car Park, Pecatu, Badung (meet 45 min before sunset)',
    images: [
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Bali Culture Tours', description: 'Specialist cultural experiences across Bali — temple tours, dance performances, and ceremony visits led by local guides with deep knowledge of Balinese tradition.', avatar: null, rating: 4.9, totalReviews: 318, user: { name: 'I Nyoman Arta', image: null } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'Absolutely extraordinary. The chanting builds into something overwhelming — one hundred voices becoming one sound. The fire walking finished me off completely.', createdAt: new Date('2024-05-17'), user: { name: 'Giulia R.', image: null } },
      { id: 'r2', rating: 5, comment: 'Don\'t miss this if you\'re in Bali. The cliffs are dramatic, the performance is mesmerising. Our guide made the whole experience so much richer.', createdAt: new Date('2024-04-28'), user: { name: 'Chris A.', image: null } },
      { id: 'r3', rating: 5, comment: 'A truly magical evening. We arrived early, explored the temple, watched the full sunset — the kecak was the crescendo of a perfect afternoon.', createdAt: new Date('2024-03-31'), user: { name: 'Lena V.', image: null } },
    ],
  },
  'balinese-history-tour': {
    slug: 'balinese-history-tour', title: 'Old Bali Heritage Walk', area: 'Klungkung',
    price: 350000, duration: '3 hours', level: 'Easy', language: 'English', maxGuests: 8,
    rating: 4.7, totalReviews: 42,
    description: 'Walk through Klungkung — the seat of Bali\'s last royal dynasty — with historian and guide I Wayan Sudira. Visit the Kerta Gosa justice pavilion with its extraordinary ceiling of Kamasan paintings, the floating pavilion, and the royal cremation site, learning the story of Bali\'s Puputan resistance against Dutch colonisation.',
    highlights: ['Visit the Kerta Gosa ceiling — 267 Kamasan paintings depicting Hindu cosmology', 'See the Bale Kambang floating pavilion', 'Learn the story of the 1908 Puputan battle', 'Walk the royal market and craftspeople\'s quarter', 'Small group for personal access and conversation'],
    includes: ['Kerta Gosa entrance fee', 'English-speaking historian guide', 'Bottled water', 'Traditional Balinese snack at local warung'],
    excludes: ['Transport to Klungkung', 'Lunch', 'Gratuities'],
    meetingPoint: 'Kerta Gosa main gate, Jl. Untung Surapati, Klungkung town centre',
    images: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Bali Heritage Walks', description: 'Historian-guided walks through Bali\'s most historically significant sites, led by I Wayan Sudira who holds a doctorate in Balinese history from Udayana University.', avatar: null, rating: 4.7, totalReviews: 42, user: { name: 'I Wayan Sudira', image: null } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'Wayan\'s depth of knowledge is astonishing. I have been coming to Bali for ten years and learned more in three hours than in all my previous visits combined.', createdAt: new Date('2024-05-03'), user: { name: 'Robert K.', image: null } },
      { id: 'r2', rating: 4, comment: 'Fascinating tour. Klungkung is the most undervisited historical site in Bali. The Kerta Gosa ceiling alone justifies the trip.', createdAt: new Date('2024-03-19'), user: { name: 'Sophie L.', image: null } },
    ],
  },
  'coffee-plantation-tour': {
    slug: 'coffee-plantation-tour', title: 'Coffee Plantation & Tasting Tour', area: 'Kintamani',
    price: 320000, duration: '3 hours', level: 'Easy', language: 'English', maxGuests: 12,
    rating: 4.8, totalReviews: 143,
    description: 'Visit a working Arabica coffee plantation on the slopes of Mount Batur, where the volcanic soil and altitude produce some of Indonesia\'s finest coffee. With plantation owner Ketut Wirawan, you\'ll pick cherries, learn the wet-process method, roast beans on a traditional clay pot, and taste eight varieties including the infamous kopi luwak.',
    highlights: ['Pick ripe coffee cherries from high-altitude Arabica plants', 'Learn the full wet-process journey from cherry to cup', 'Roast and grind your own beans using traditional methods', 'Taste eight varieties of Balinese coffee and herbal tea', 'Stunning views across Lake Batur and the volcano'],
    includes: ['Full plantation tour with Ketut', 'Coffee tasting (8 varieties)', 'Herbal tea tasting', 'Roasting demonstration', '250g bag of freshly roasted beans to take home'],
    excludes: ['Transport to Kintamani', 'Lunch', 'Additional coffee purchases', 'Gratuities'],
    meetingPoint: 'Batur Arabica Plantation, Jl. Raya Kintamani, Batur village',
    images: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Batur Arabica Estate', description: 'A family-run plantation on Mount Batur\'s volcanic slopes, producing specialty Arabica coffee at 1,200m altitude and welcoming visitors to experience the full journey from tree to cup.', avatar: null, rating: 4.8, totalReviews: 143, user: { name: 'Ketut Wirawan', image: null } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'Ketut is a wonderful host with encyclopedic knowledge of coffee. The plantation views over Lake Batur are stunning and the coffee is genuinely excellent.', createdAt: new Date('2024-05-11'), user: { name: 'David C.', image: null } },
      { id: 'r2', rating: 5, comment: 'The beans we roasted on the clay pot and then drank immediately were the best coffee of my life. Not an exaggeration. The fresh roast is extraordinary.', createdAt: new Date('2024-04-02'), user: { name: 'Emma J.', image: null } },
    ],
  },
  'ubud-market-food-tour': {
    slug: 'ubud-market-food-tour', title: 'Ubud Market Food Tour', area: 'Ubud',
    price: 280000, duration: '3 hours', level: 'Easy', language: 'English', maxGuests: 8,
    rating: 4.8, totalReviews: 97,
    description: 'Start before sunrise at Ubud\'s bustling Pasar Ubud to see the market at its most alive, then wind through the food stalls of Jl. Monkey Forest with guide Putu Ayu, tasting twelve dishes that form the backbone of Balinese home cooking — from fragrant nasi campur to crispy babi guling and sweet jaje Bali.',
    highlights: ['Pre-dawn Pasar Ubud market walk before tourists arrive', 'Taste twelve iconic Balinese dishes at local warungs', 'Learn the story behind each dish and its cultural significance', 'Try jamu health tonics at a traditional street stall', 'Finish with Balinese coffee and black rice pudding'],
    includes: ['All food tastings (twelve dishes)', 'Jamu tasting', 'Balinese coffee', 'Guide Putu Ayu throughout', 'Printed guide to Ubud\'s best local warungs'],
    excludes: ['Transport to Ubud market', 'Additional purchases', 'Gratuities'],
    meetingPoint: 'Main entrance, Pasar Ubud (Ubud Market), Jl. Raya Ubud (meet at 6:00am)',
    images: [
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Ubud Food Stories', description: 'Morning food tours through Ubud\'s markets and warungs led by Putu Ayu, a Balinese food writer who has been documenting the island\'s culinary culture for twelve years.', avatar: null, rating: 4.8, totalReviews: 97, user: { name: 'Putu Ayu', image: null } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'Putu is a superb guide and clearly loves every bite. The pre-dawn market is spectacular — so much colour and noise and wonderful smells. The nasi campur alone was worth waking up for.', createdAt: new Date('2024-05-09'), user: { name: 'Charlotte B.', image: null } },
      { id: 'r2', rating: 5, comment: 'I have done food tours in ten countries and this is in my top three. Putu\'s knowledge of Balinese food culture is extraordinary. Book the early slot.', createdAt: new Date('2024-04-16'), user: { name: 'Mark S.', image: null } },
    ],
  },
  'mount-batur-sunrise': {
    slug: 'mount-batur-sunrise', title: 'Mount Batur Sunrise Trek', area: 'Kintamani',
    price: 650000, duration: '6 hours', level: 'Moderate', language: 'English', maxGuests: 10,
    rating: 4.8, totalReviews: 241,
    description: 'Trek to the summit of Mount Batur — Bali\'s most active volcano at 1717m — in the dark, arriving at the crater rim just as the sun rises over Mount Agung and Lake Batur below. With certified guide Wayan Surya, you\'ll see the volcanic fumaroles, eat banana sandwiches warmed by volcanic steam, and descend through black lava fields.',
    highlights: ['Summit (1717m) for a 360° sunrise above the clouds', 'Watch dawn break over Mount Agung and Lake Batur', 'Cook your breakfast over active volcanic steam vents', 'Trek through black 1963 lava fields on the descent', 'Small group of max 10 for a personal experience'],
    includes: ['Certified volcano guide Wayan Surya', 'Torch and hiking poles', 'Breakfast at the summit (banana toast, egg, fruit)', 'Bottled water (2 litres)', 'Post-trek transfer back to trailhead'],
    excludes: ['Transport to Kintamani trailhead', 'Gratuities', 'Personal travel insurance'],
    meetingPoint: 'Toya Bungkah village, Kintamani (pick up from your accommodation available — ask on booking)',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Batur Volcano Guides', description: 'Licensed local guides from the Kintamani Batur Volcano Association, certified by the Indonesian Volcano Management Authority with over fifteen years of Batur treks.', avatar: null, rating: 4.8, totalReviews: 241, user: { name: 'Wayan Surya', image: null } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'The sunrise from the summit is genuinely one of the most beautiful things I\'ve seen. Wayan is funny, safe, and knows the mountain perfectly. Do not skip the banana toast warmed on the volcano — surreal and delicious.', createdAt: new Date('2024-05-18'), user: { name: 'Felix W.', image: null } },
      { id: 'r2', rating: 5, comment: 'Tough trek but every step worth it. We summited just as the light hit Mount Agung across the lake. Wayan\'s safety briefing was thorough and his stories about the volcano kept us going on the dark climb.', createdAt: new Date('2024-04-07'), user: { name: 'Natalia S.', image: null } },
      { id: 'r3', rating: 4, comment: 'Extraordinary experience. Bring warm layers — the summit is cold. The descent through the lava fields is almost as impressive as the sunrise.', createdAt: new Date('2024-03-24'), user: { name: 'Jack O.', image: null } },
    ],
  },
  'rice-terrace-trek': {
    slug: 'rice-terrace-trek', title: 'Tegalalang Rice Terrace Trek', area: 'Ubud',
    price: 320000, duration: '3 hours', level: 'Easy', language: 'English', maxGuests: 8,
    rating: 4.7, totalReviews: 103,
    description: 'Trek through the legendary UNESCO-listed Tegalalang terraces and into the less-visited valley below, where the real farming life of Bali continues unchanged. With local farmer Gede, you\'ll learn about the ancient subak irrigation system, plant a rice seedling, and see the terraces from angles no tourist path reaches.',
    highlights: ['Descend into the private valley sections closed to solo visitors', 'Plant your own rice seedling in a working paddy', 'Learn about the UNESCO-listed subak irrigation system', 'Cross hand-made bamboo bridges over the river', 'Finish with fresh coconut at a local farmer\'s warung'],
    includes: ['English-speaking farmer guide', 'Rice planting experience', 'Fresh coconut at midpoint', 'Bottled water', 'Access to private terrace sections'],
    excludes: ['Transport to Tegalalang', 'Lunch', 'Photography props or swings', 'Gratuities'],
    meetingPoint: 'Tegalalang main car park, Jl. Raya Tegalalang (north of Ubud — 20 min drive)',
    images: [
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Tegalalang Farmer Walks', description: 'Working farmer guides sharing the living agricultural landscape of Tegalalang and the ancient subak system — a UNESCO-recognised irrigation tradition over a thousand years old.', avatar: null, rating: 4.7, totalReviews: 103, user: { name: 'Gede Arnawa', image: null } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'Going into the valley below the tourist path changes everything. Gede showed us parts of the terrace that were stunning precisely because no one else was there.', createdAt: new Date('2024-05-16'), user: { name: 'Isabelle D.', image: null } },
      { id: 'r2', rating: 4, comment: 'Planting a rice seedling sounds gimmicky but was surprisingly moving. These farmers do this every day. Gede explained the subak in a way I will never forget.', createdAt: new Date('2024-04-03'), user: { name: 'Marcus T.', image: null } },
    ],
  },
  'waterfall-hidden-canyon': {
    slug: 'waterfall-hidden-canyon', title: 'Hidden Waterfall Canyon Hike', area: 'Aling-Aling',
    price: 450000, duration: '5 hours', level: 'Moderate', language: 'English', maxGuests: 8,
    rating: 4.9, totalReviews: 89,
    description: 'Trek to the spectacular Aling-Aling waterfall complex in North Bali, where four waterfalls cascade into natural pools hidden deep in a jungle canyon. With guide Putu, you\'ll slide down natural rock slides, jump from clifftop platforms into emerald pools, and swim under the 35-metre Kroya waterfall.',
    highlights: ['Slide down natural rock slides into jungle pools', 'Cliff jump from platforms at 5, 8 and 12 metres (optional)', 'Swim under the 35-metre Kroya waterfall', 'Trek through dense North Bali jungle canyon', 'Far fewer visitors than South Bali waterfalls'],
    includes: ['Certified guide Putu throughout', 'Safety equipment (life vest, helmet)', 'Entrance fees to all four waterfalls', 'Light lunch at local warung', 'Bottled water and fruit'],
    excludes: ['Transport to Aling-Aling (approx 1.5 hrs from Ubud)', 'Gratuities', 'Personal travel insurance'],
    meetingPoint: 'Aling-Aling Waterfall car park, Sukasada, Buleleng',
    images: [
      'https://images.unsplash.com/photo-1552083375-1447ce886485?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'North Bali Adventure', description: 'Local adventure guides from the Aling-Aling village offering waterfall treks, canyon hikes, and white-water experiences in North Bali\'s least-visited landscapes.', avatar: null, rating: 4.9, totalReviews: 89, user: { name: 'Putu Wirawan', image: null } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'The cliff jump at 12 metres was the most exhilarating thing I\'ve done in years. Putu\'s safety briefing was thorough and he made us feel completely confident. The waterfall itself is extraordinary.', createdAt: new Date('2024-05-22'), user: { name: 'Noah F.', image: null } },
      { id: 'r2', rating: 5, comment: 'If you\'re after the adventurous side of Bali away from the crowds — this is it. Four waterfalls, jungle, natural pools, rock slides. Perfect day.', createdAt: new Date('2024-04-15'), user: { name: 'Camille D.', image: null } },
      { id: 'r3', rating: 5, comment: 'The drive to North Bali already feels like a different country. The waterfall canyon is breathtaking and the jumping was terrifying and brilliant.', createdAt: new Date('2024-03-28'), user: { name: 'Leo B.', image: null } },
    ],
  },
  'surfing-lesson-canggu': {
    slug: 'surfing-lesson-canggu', title: 'Surfing Lesson for Beginners', area: 'Canggu',
    price: 400000, duration: '2 hours', level: 'Beginner', language: 'English', maxGuests: 6,
    rating: 4.8, totalReviews: 176,
    description: 'Learn to surf at Canggu\'s beginner-friendly Batu Bolong beach with certified instructor Komang — one of the most patient, encouraging surf teachers on the island. After a land lesson covering technique and ocean safety, you\'ll be riding whitewater waves in the first hour. Small groups of max 6 mean you get real attention.',
    highlights: ['Beach lesson on technique, pop-up and ocean safety first', 'Beginner-friendly Batu Bolong beach break', 'Max 6 students per instructor for personalised coaching', 'Stand up and ride waves in your first session', 'Post-surf fresh coconut and photos of your waves'],
    includes: ['Softboard and leash', 'Rash vest', 'Certified instructor (1:3 ratio or better)', 'Post-surf fresh coconut', 'Surf photos via WhatsApp'],
    excludes: ['Transport to Canggu', 'Wetsuit (available to borrow)', 'Gratuities'],
    meetingPoint: 'Komang Surf School, Jl. Pantai Batu Bolong, Canggu (on the beach)',
    images: [
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Komang Surf Canggu', description: 'Canggu\'s most loved surf school — small groups, certified instructors, and a beach that has produced first-time surfers for fifteen years running.', avatar: null, rating: 4.8, totalReviews: 176, user: { name: 'Komang Surya', image: null } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'Komang is the perfect teacher — calm, funny, and incredibly good at reading what each student needs. I stood up on my second attempt. Couldn\'t believe it.', createdAt: new Date('2024-05-19'), user: { name: 'Jake T.', image: null } },
      { id: 'r2', rating: 5, comment: 'The WhatsApp photos of me riding waves are my favourite photos from the entire trip. Such a brilliant morning. Small group made all the difference.', createdAt: new Date('2024-04-08'), user: { name: 'Mia O.', image: null } },
    ],
  },
  // ── Spiritual ──────────────────────────────────────────────────────────────
  'holy-water-ceremony': {
    slug: 'holy-water-ceremony', title: 'Holy Water Purification Ceremony', area: 'Gianyar',
    price: 550000, duration: '3 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.9, totalReviews: 148,
    description: 'Step into the sacred spring pools of Tirta Empul — Bali\'s most revered holy water temple — and participate in a traditional melukat purification ceremony led by priest Wayan Gede. Each of the twenty-two waterspouts carries a specific blessing. You will emerge cleansed, centred and deeply connected to Balinese spiritual life.',
    highlights: ['Full melukat purification at all twenty-two sacred waterspouts', 'Guided by third-generation temple priest Wayan Gede', 'Access to restricted inner sanctum', 'Traditional flower offering and prayer ritual', 'Ceremonial sarong and sash provided'],
    includes: ['Temple entrance', 'Traditional sarong and sash', 'Ceremonial offerings', 'Water and light snack', 'English-speaking guide'],
    excludes: ['Transport to Tampaksiring', 'Photography services', 'Gratuities'],
    meetingPoint: 'Tirta Empul Temple Gate, Tampaksiring, Gianyar',
    images: ['https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Sacred Bali Ceremonies', description: 'Led by Wayan Gede, a third-generation temple guide and priest offering authentic spiritual experiences at Bali\'s most sacred sites.', avatar: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=200&auto=format&fit=crop&q=80', rating: 4.9, totalReviews: 148, user: { name: 'Wayan Gede', image: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=200&auto=format&fit=crop&q=80' } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Deeply moving. Standing in the holy spring, water streaming over your head — it cleanses something you didn\'t know needed cleansing.', createdAt: new Date('2024-04-30'), user: { name: 'Maria C.', image: null } },{ id: 'r2', rating: 5, comment: 'Wayan is wise, warm and gives you true access to the sacred nature of the ceremony. I felt genuinely changed afterwards.', createdAt: new Date('2024-03-22'), user: { name: 'Tom H.', image: null } }],
  },
  'manku-energy-healing': {
    slug: 'manku-energy-healing', title: 'Balinese Energy Healing with Manku', area: 'Ubud',
    price: 750000, duration: '90 minutes', level: 'All levels', language: 'English', maxGuests: 2,
    rating: 4.8, totalReviews: 86,
    description: 'A deeply personal one-on-one session with Balinese energy healer Pak Manku — a fourth-generation practitioner of traditional Balinese healing arts. Drawing on ancient lontar manuscript knowledge, Pak Manku reads your energy body, identifies imbalances, and restores flow through prayer, touch, and sacred water blessing.',
    highlights: ['Private session with fourth-generation healer Pak Manku', 'Energy body reading and diagnosis', 'Traditional Balinese healing through prayer and sacred touch', 'Blessing with holy water from Mount Agung', 'Set in Pak Manku\'s private compound in Ubud'],
    includes: ['Full healing session (90 min)', 'Sacred water blessing', 'Ceremonial flower offering', 'Herbal tea post-session'],
    excludes: ['Transport', 'Gratuities'],
    meetingPoint: 'Manku Healing Compound, Jl. Raya Pengosekan, Ubud (directions on booking)',
    images: ['https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Manku Healing Arts', description: 'Fourth-generation Balinese healer Pak Manku offers traditional energy healing, balian readings, and sacred blessing ceremonies from his family compound in Ubud.', avatar: null, rating: 4.8, totalReviews: 86, user: { name: 'Pak Manku', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Pak Manku identified tension I hadn\'t even acknowledged. By the end I felt lighter, clearer, and deeply calm. Extraordinary gift.', createdAt: new Date('2024-05-10'), user: { name: 'Sophie R.', image: null } },{ id: 'r2', rating: 5, comment: 'Life-changing 90 minutes. He barely speaks English but communicates everything through presence and touch. The most genuine healer I\'ve encountered anywhere.', createdAt: new Date('2024-04-02'), user: { name: 'Luke P.', image: null } }],
  },
  'temple-ceremony-blessing': {
    slug: 'temple-ceremony-blessing', title: 'Temple Ceremony & Blessing', area: 'Gianyar',
    price: 480000, duration: '2.5 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.9, totalReviews: 122,
    description: 'Join a real Balinese temple ceremony — not a performance staged for tourists — guided by Wayan Gede at one of Gianyar\'s most active village temples. Watch the offerings being presented, participate in the blessing ritual, and leave with a deeper understanding of why ceremony is at the heart of Balinese life.',
    highlights: ['Attend a real village temple ceremony (not a tourist show)', 'Receive traditional blessing from the temple priest', 'Learn the meaning of each offering and ritual step', 'Dress in ceremonial sarong and kebaya', 'Small group for genuine access and conversation'],
    includes: ['Temple entrance', 'Ceremonial sarong and sash', 'Ceremonial offerings', 'Water and snack', 'Guide throughout'],
    excludes: ['Transport to Gianyar', 'Gratuities'],
    meetingPoint: 'Pura Dalem, Desa Adat Batuan, Gianyar (exact address on confirmation)',
    images: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Sacred Bali Ceremonies', description: 'Led by Wayan Gede, a third-generation temple guide offering authentic spiritual experiences at Bali\'s most sacred sites.', avatar: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=200&auto=format&fit=crop&q=80', rating: 4.9, totalReviews: 122, user: { name: 'Wayan Gede', image: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=200&auto=format&fit=crop&q=80' } },
    reviews: [{ id: 'r1', rating: 5, comment: 'The real ceremony experience — not staged. You feel the devotion of the people around you. Wayan explains every step with such reverence.', createdAt: new Date('2024-05-08'), user: { name: 'Claire M.', image: null } }],
  },
  'melukat-river-ritual': {
    slug: 'melukat-river-ritual', title: 'Melukat River Cleansing Ritual', area: 'Ubud',
    price: 650000, duration: '2 hours', level: 'All levels', language: 'English', maxGuests: 6,
    rating: 4.8, totalReviews: 74,
    description: 'Descend into a sacred river gorge near Ubud for the ancient melukat — a Balinese water cleansing ritual performed at a natural spring altar. Guided by healer Ibu Rini, you will wade into the river, receive blessings at seven sacred water points, and emerge feeling deeply purified and spiritually renewed.',
    highlights: ['Melukat ritual at seven sacred river water points', 'Guided by healer Ibu Rini in a stunning gorge setting', 'Completely off the tourist trail', 'Full ritual attire provided', 'Integration tea and reflection time after'],
    includes: ['Ritual attire (sarong, sash, flower crown)', 'Ceremonial offerings', 'Guide and healer Ibu Rini', 'Herbal tea and snack after'],
    excludes: ['Transport (approx 20 min from central Ubud)', 'Gratuities'],
    meetingPoint: 'Pura Tirta Sari, Jl. Suweta, Ubud (meet at the bamboo gate)',
    images: ['https://images.unsplash.com/photo-1520209759809-a9bcb6cb3241?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Ubud Sacred Waters', description: 'Ibu Rini leads traditional melukat and river cleansing rituals in the sacred gorges around Ubud, offering a deeply personal spiritual experience rooted in Balinese healing tradition.', avatar: null, rating: 4.8, totalReviews: 74, user: { name: 'Ibu Rini', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'The gorge setting alone would be worth it — but the ritual with Ibu Rini took it to another level. Deeply moving and completely authentic.', createdAt: new Date('2024-05-04'), user: { name: 'Emma B.', image: null } }],
  },
  // ── Nature & Outdoors ───────────────────────────────────────────────────────
  'mount-batur-sunrise-trek': {
    slug: 'mount-batur-sunrise-trek', title: 'Mount Batur Sunrise Trek', area: 'Kintamani',
    price: 750000, duration: '6 hours', level: 'Moderate', language: 'English', maxGuests: 10,
    rating: 4.9, totalReviews: 284,
    description: 'Trek to the summit of Mount Batur — Bali\'s most active volcano at 1717m — in darkness, arriving at the crater rim just as the sun rises over Mount Agung and Lake Batur below. Cook breakfast over active volcanic steam vents, descend through black lava fields, and return with one of the great experiences Bali has to offer.',
    highlights: ['360° sunrise above the clouds from the 1717m summit', 'Dawn breaking over Mount Agung and Lake Batur', 'Breakfast cooked over active volcanic steam vents', 'Black 1963 lava field descent', 'Small group of max 10'],
    includes: ['Certified guide', 'Torch and hiking poles', 'Summit breakfast', 'Bottled water (2L)', 'Post-trek transfer to trailhead'],
    excludes: ['Transport to Kintamani', 'Gratuities', 'Travel insurance'],
    meetingPoint: 'Toya Bungkah village, Kintamani (hotel pick-up available — ask on booking)',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Batur Volcano Guides', description: 'Licensed local guides from the Kintamani Batur Volcano Association with over fifteen years of experience on the mountain.', avatar: null, rating: 4.9, totalReviews: 284, user: { name: 'Wayan Surya', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'The sunrise from the summit is genuinely one of the most beautiful things I\'ve seen. Don\'t skip the banana toast warmed on the volcano.', createdAt: new Date('2024-05-18'), user: { name: 'Felix W.', image: null } },{ id: 'r2', rating: 5, comment: 'Every step was worth it. We summited just as the light hit Mount Agung across the lake. Unforgettable.', createdAt: new Date('2024-04-07'), user: { name: 'Natalia S.', image: null } }],
  },
  'sekumpul-waterfall-hike': {
    slug: 'sekumpul-waterfall-hike', title: 'Sekumpul Waterfall Hike', area: 'Gianyar',
    price: 480000, duration: '5 hours', level: 'Moderate', language: 'English', maxGuests: 8,
    rating: 4.8, totalReviews: 98,
    description: 'Hike to Sekumpul — Bali\'s most spectacular waterfall cluster — deep in the jungle of North Bali. Seven waterfalls cascade into natural pools hidden in a lush canyon. With guide Putu, you\'ll descend 300+ steps through coffee and clove plantations, swim under the main 80-metre fall, and discover a corner of Bali few tourists reach.',
    highlights: ['Seven waterfalls including the 80-metre main cascade', 'Swim in natural jungle pools', 'Trek through coffee and clove plantation', 'Far from the tourist south — genuinely off the beaten path', 'Small group for private access to the pools'],
    includes: ['Certified guide throughout', 'Entrance fees', 'Light lunch at local warung', 'Water and fruit'],
    excludes: ['Transport to North Bali (approx 1.5 hrs from Ubud)', 'Gratuities', 'Travel insurance'],
    meetingPoint: 'Sekumpul village car park, Sawan, Buleleng',
    images: ['https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'North Bali Treks', description: 'Local guides from Sawan village leading hikes to Sekumpul and the North Bali highlands since 2012.', avatar: null, rating: 4.8, totalReviews: 98, user: { name: 'Putu Wirawan', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Sekumpul is the most beautiful waterfall I have ever seen. The hike is worth every step. Swimming under the main fall is pure joy.', createdAt: new Date('2024-05-12'), user: { name: 'Isabelle D.', image: null } }],
  },
  // ── Water Activities ────────────────────────────────────────────────────────
  'freediving-nusa-penida': {
    slug: 'freediving-nusa-penida', title: 'Freediving at Nusa Penida', area: 'Nusa Dua',
    price: 1200000, duration: '6 hours', level: 'Intermediate', language: 'English', maxGuests: 4,
    rating: 4.9, totalReviews: 55,
    description: 'Explore the extraordinary underwater world of Nusa Penida — home to Mola mola sunfish, manta rays, and some of the richest coral in Indonesia — with certified freediving instructor Agus. Starting with a breathwork and technique session, you\'ll build the skills to dive to 15–20m on a single breath and experience the reef in complete silence.',
    highlights: ['Freedive to 15–20m on a single breath', 'Chance to encounter Mola mola and manta rays', 'Crystal Bay and Gamat Bay dive sites', 'Certified SSI freediving instructor Agus', 'Max 4 participants for personal coaching'],
    includes: ['Full freediving equipment', 'Boat to Nusa Penida', 'Certified instructor', 'Underwater safety diver', 'Lunch and water on the boat'],
    excludes: ['Transport from Bali to Sanur pier', 'Wetsuit rental', 'Gratuities', 'Travel insurance'],
    meetingPoint: 'Sanur Beach Pier, Jl. Hang Tuah, Sanur (early departure — confirm time on booking)',
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Nusa Freedive', description: 'SSI-certified freediving school operating out of Sanur and Nusa Penida, with expert instructors who know the Crystal Bay currents and wildlife patterns intimately.', avatar: null, rating: 4.9, totalReviews: 55, user: { name: 'Agus Prasetyo', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Seeing a Mola mola on a single breath at 18 metres — I can\'t even describe it. Agus is a superb instructor and makes you feel safe the whole time.', createdAt: new Date('2024-05-14'), user: { name: 'Noah K.', image: null } }],
  },
  'sup-sanur-sunrise': {
    slug: 'sup-sanur-sunrise', title: 'Stand-Up Paddle at Sanur', area: 'Sanur',
    price: 280000, duration: '90 minutes', level: 'All levels', language: 'English', maxGuests: 6,
    rating: 4.6, totalReviews: 43,
    description: 'Glide across the mirror-calm morning waters of Sanur Beach on a stand-up paddleboard, with the dawn light painting Mount Agung across the bay. Instructor Wayan guides you from your first wobbly step through to confident paddling, with views across to Nusa Penida on clear mornings.',
    highlights: ['Early morning session on Sanur\'s legendary flat water', 'Sunrise views over Mount Agung', 'Full instruction — zero experience needed', 'Views across to Nusa Penida on clear days', 'Post-session fresh coconut on the beach'],
    includes: ['SUP board and paddle', 'Life vest and leash', 'Certified instructor', 'Post-session coconut'],
    excludes: ['Transport to Sanur', 'Wetsuit', 'Gratuities'],
    meetingPoint: 'Sanur Beach SUP point, Jl. Danau Tamblingan, Sanur (meet at 6:30am)',
    images: ['https://images.unsplash.com/photo-1565992441121-4367c2967103?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Sanur SUP Co.', description: 'Early morning stand-up paddleboard sessions on Sanur\'s famous flat water, run by certified instructors who have been on these waters for over a decade.', avatar: null, rating: 4.6, totalReviews: 43, user: { name: 'Wayan Putra', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Sanur at 6:30am is pure magic. Calm water, beautiful light, Agung in the distance. Wayan had me paddling confidently within twenty minutes.', createdAt: new Date('2024-04-20'), user: { name: 'Fiona A.', image: null } }],
  },
  // ── Local Experts ───────────────────────────────────────────────────────────
  'bali-photography-guide': {
    slug: 'bali-photography-guide', title: 'Bali Photography Guide', area: 'Ubud',
    price: 850000, duration: '4 hours', level: 'All levels', language: 'English', maxGuests: 2,
    rating: 4.9, totalReviews: 78,
    description: 'Spend a morning with Bali\'s most sought-after local photography guide, visiting the island\'s most photogenic locations at the perfect light — rice terraces, temples, jungle paths, and local markets — and learning to capture them as a photographer rather than a tourist.',
    highlights: ['Four locations chosen for your style and the day\'s light', 'Guidance on composition, light and storytelling', 'Access to locations most tourists never find', 'Private — just you and the guide', 'All images belong to you (RAW files available on request)'],
    includes: ['4-hour private guided shoot', 'Location scouting', 'Composition and light coaching', 'Image selection guidance', 'Transport between locations'],
    excludes: ['Camera equipment', 'Post-processing', 'Gratuities'],
    meetingPoint: 'Your accommodation in Ubud (guide picks you up)',
    images: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Bali Lens Stories', description: 'Ketut Budiari is Ubud\'s leading photography guide — a former photojournalist who has spent fifteen years documenting the living culture of Bali and now shares that access with visiting photographers.', avatar: null, rating: 4.9, totalReviews: 78, user: { name: 'Ketut Budiari', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Ketut took me to a temple ceremony most tourists will never see. The photos I came home with are the best I\'ve ever taken. Extraordinary guide.', createdAt: new Date('2024-05-11'), user: { name: 'Clara J.', image: null } }],
  },
  'private-bali-guide': {
    slug: 'private-bali-guide', title: 'Private Bali Island Guide', area: 'Seminyak',
    price: 750000, duration: '8 hours', level: 'All levels', language: 'English', maxGuests: 6,
    rating: 4.8, totalReviews: 112,
    description: 'Explore Bali on your own terms with a knowledgeable private guide who speaks fluent English and knows the island inside out. From temple access to hidden warungs, rice terrace walks to sunset spots — your guide builds the day around your interests and moves at your pace.',
    highlights: ['Fully personalised day — your itinerary, your pace', 'Access to sites, people and places most tourists miss', 'Fluent English-speaking Balinese guide', 'Includes comfortable private vehicle', 'Flexible start time and locations'],
    includes: ['Private guide (8 hours)', 'Air-conditioned vehicle', 'All entrance fees', 'Bottled water', 'Flexible itinerary'],
    excludes: ['Lunch and meals', 'Gratuities', 'Personal shopping'],
    meetingPoint: 'Your accommodation (guide and driver collect you)',
    images: ['https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Bali Private Tours', description: 'A team of certified Balinese guides offering fully bespoke private day tours across the island — from cultural deep-dives to adventure days.', avatar: null, rating: 4.8, totalReviews: 112, user: { name: 'Nyoman Darta', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Nyoman took us to places we\'d never have found alone. His knowledge of Balinese culture and history is extraordinary. Worth every rupiah.', createdAt: new Date('2024-05-09'), user: { name: 'Robert K.', image: null } }],
  },
  'family-childcare-bali': {
    slug: 'family-childcare-bali', title: 'Professional Childcare for Families', area: 'Canggu',
    price: 400000, duration: '8 hours', level: 'All levels', language: 'English', maxGuests: 4,
    rating: 4.9, totalReviews: 64,
    description: 'Trusted, professional childcare from experienced Balinese nannies who love working with children. Whether you need a few hours for a sunset dinner or a full day so you can explore freely, our nannies bring activities, games, and genuine warmth to your children\'s Bali experience.',
    highlights: ['Experienced, vetted Balinese nannies', 'Activities and games tailored to your children\'s ages', 'Flexible hours — half day or full day', 'Can travel with your family or stay at your villa', 'Regular WhatsApp updates with photos'],
    includes: ['Experienced nanny (full day 8 hrs)', 'Age-appropriate activities and craft supplies', 'Regular photo updates via WhatsApp', 'Full first-aid trained'],
    excludes: ['Meals for children', 'Transport if travelling out', 'Gratuities'],
    meetingPoint: 'Your villa or accommodation in Canggu',
    images: ['https://images.unsplash.com/photo-1540479859555-17af45c78602?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Bali Family Care', description: 'Professional childcare and nanny services for travelling families in Bali, with fully vetted, first-aid trained nannies experienced with children of all ages.', avatar: null, rating: 4.9, totalReviews: 64, user: { name: 'Ni Made Artini', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Made was wonderful with our two kids. They were sad to say goodbye. We finally got a whole day to ourselves knowing they were in great hands.', createdAt: new Date('2024-05-08'), user: { name: 'Jessica T.', image: null } }],
  },
  'dog-walker-canggu': {
    slug: 'dog-walker-canggu', title: 'Dog Walking & Pet Care', area: 'Canggu',
    price: 250000, duration: '2 hours', level: 'All levels', language: 'English', maxGuests: 1,
    rating: 4.8, totalReviews: 47,
    description: 'Reliable, loving pet care for your dog while you explore Bali. Our experienced dog walkers take your furry companion on scenic walks through Canggu\'s rice fields and back streets, with photo updates so you\'re always in the loop.',
    highlights: ['Scenic walks through Canggu rice fields', 'Photo updates every 30 minutes', 'Experienced, animal-loving care team', 'Available for walks, boarding, or villa visits', 'Reliable and punctual — your pet\'s happiness is our priority'],
    includes: ['2-hour walk with experienced handler', 'Photo updates via WhatsApp', 'Post-walk water and settle'],
    excludes: ['Food (unless provided by you)', 'Veterinary care', 'Gratuities'],
    meetingPoint: 'Your villa or accommodation in Canggu (we come to you)',
    images: ['https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Canggu Pet Walkers', description: 'Passionate dog lovers offering reliable walking, boarding and villa visit services for pets in Canggu and surrounding areas.', avatar: null, rating: 4.8, totalReviews: 47, user: { name: 'Komang Santi', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Komang is so loving with our dog. The photo updates made us feel completely at ease. We booked her every day for a week.', createdAt: new Date('2024-04-25'), user: { name: 'Sophie L.', image: null } }],
  },
  'personal-driver-bali': {
    slug: 'personal-driver-bali', title: 'Personal Driver — Full Day', area: 'Ubud',
    price: 500000, duration: '8 hours', level: 'All levels', language: 'English', maxGuests: 6,
    rating: 4.9, totalReviews: 189,
    description: 'Explore Bali in comfort with a dedicated personal driver for the full day. Your driver knows every road, every shortcut, and every worthwhile stop on the island. Whether you have a set plan or just a direction, they\'ll make the day seamless — no parking stress, no getting lost, no hassle.',
    highlights: ['Air-conditioned private vehicle for the full day', 'Fluent English-speaking driver with deep local knowledge', 'Complete flexibility — change plans at any time', 'Knows the best local stops, warungs and hidden gems', 'Available island-wide including North and East Bali'],
    includes: ['Private driver and vehicle (8 hours)', 'Petrol and toll fees', 'Air conditioning', 'Bottled water'],
    excludes: ['Entrance fees', 'Meals', 'Parking fees beyond standard', 'Gratuities'],
    meetingPoint: 'Your accommodation (driver collects you)',
    images: ['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Bali Private Drivers', description: 'Trusted Balinese drivers with years of experience on the island\'s roads — professional, punctual, and always willing to share their favourite local spots.', avatar: null, rating: 4.9, totalReviews: 189, user: { name: 'Wayan Sujana', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Wayan made the day so easy. He had great suggestions, knew every shortcut, and waited patiently at every stop. Will book him every time I\'m in Bali.', createdAt: new Date('2024-05-15'), user: { name: 'Mark D.', image: null } }],
  },
  // ── Rentals ─────────────────────────────────────────────────────────────────
  'scooter-rental-canggu': {
    slug: 'scooter-rental-canggu', title: 'Scooter Rental — Daily', area: 'Canggu',
    price: 80000, duration: '1440 minutes', level: 'All levels', language: 'English', maxGuests: 2,
    rating: 4.7, totalReviews: 342,
    description: 'Rent a well-maintained automatic scooter from our Canggu depot and explore Bali at your own pace. All scooters are serviced weekly, helmets are included, and we offer free roadside assistance if you need it. Perfect for navigating Canggu\'s lanes or cruising the coastal road to Uluwatu.',
    highlights: ['Well-maintained automatic scooters', 'Helmets and lock included', 'Free roadside assistance', 'Flexible rental period (daily, weekly)', 'Delivery to your villa available (small fee)'],
    includes: ['Scooter (automatic)', 'Two helmets', 'Lock', 'Basic insurance'],
    excludes: ['Petrol', 'Damage beyond basic cover', 'International driving permit if required'],
    meetingPoint: 'Bali Scooter Hub, Jl. Batu Mejan, Canggu (or villa delivery)',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1437796741086-22e3c0e38f12?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Bali Scooter Hub', description: 'Canggu\'s most trusted scooter rental — weekly servicing, modern fleet, and free roadside assistance across the island.', avatar: null, rating: 4.7, totalReviews: 342, user: { name: 'Nyoman Putra', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Scooter was in perfect condition, helmets were clean, and the process was super easy. Best way to explore Bali. Book these guys.', createdAt: new Date('2024-05-10'), user: { name: 'Jake M.', image: null } }],
  },
  'motorbike-rental-ubud': {
    slug: 'motorbike-rental-ubud', title: 'Motorbike Rental — Semi-auto', area: 'Ubud',
    price: 100000, duration: '1440 minutes', level: 'Intermediate', language: 'English', maxGuests: 2,
    rating: 4.6, totalReviews: 218,
    description: 'Rent a reliable semi-automatic motorbike from our Ubud depot and ride the scenic back roads of central Bali at your own pace. Ideal for experienced riders who want to explore the rice terrace roads, mountain passes, and village tracks that are inaccessible by car.',
    highlights: ['Semi-automatic motorbike (Honda Supra / Yamaha Vega)', 'Helmets and lock included', 'Ubud\'s best access point for back-road riding', 'Free roadside assistance', 'Daily or weekly rates available'],
    includes: ['Motorbike (semi-auto)', 'Two helmets', 'Lock', 'Basic insurance'],
    excludes: ['Petrol', 'Damage beyond basic cover', 'International driving permit'],
    meetingPoint: 'Ubud Motorbike Rental, Jl. Raya Ubud, Ubud (villa delivery available)',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1437796741086-22e3c0e38f12?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Ubud Ride Rentals', description: 'Ubud\'s go-to motorbike rental for riders who want to explore the highland roads and rice terrace tracks of central Bali.', avatar: null, rating: 4.6, totalReviews: 218, user: { name: 'Made Arta', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Bike was in great shape and the guys were super helpful with route suggestions. The mountain road to Kintamani on this bike was incredible.', createdAt: new Date('2024-04-18'), user: { name: 'Tom B.', image: null } }],
  },
  'villa-rental-seminyak': {
    slug: 'villa-rental-seminyak', title: 'Private Pool Villa — 3BR', area: 'Seminyak',
    price: 2200000, duration: '1440 minutes', level: 'All levels', language: 'English', maxGuests: 6,
    rating: 4.9, totalReviews: 87,
    description: 'A stunning three-bedroom private pool villa in the heart of Seminyak, with a 12-metre pool, fully equipped kitchen, and daily housekeeping. Set on a quiet gang just five minutes walk from Seminyak\'s best beach, restaurants, and nightlife.',
    highlights: ['12-metre private pool with sun loungers', 'Three spacious air-conditioned bedrooms', 'Fully equipped kitchen and outdoor dining', 'Daily housekeeping and welcome basket', '5-minute walk from Seminyak Beach'],
    includes: ['Private pool villa (3 bedrooms)', 'Daily housekeeping', 'Welcome basket (coffee, tea, fruit)', 'Wi-Fi and streaming TV', 'Airport transfer on arrival'],
    excludes: ['Meals beyond welcome basket', 'Electricity surcharge if applicable', 'Extra guests beyond 6'],
    meetingPoint: 'Villa address sent on booking confirmation',
    images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Seminyak Villas Collection', description: 'Curated private pool villas in Seminyak, Canggu and Uluwatu — managed by a local team with 24/7 guest support.', avatar: null, rating: 4.9, totalReviews: 87, user: { name: 'Putu Astawa', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Perfect villa — immaculate, beautiful pool, incredible location. The welcome basket and housekeeping were lovely touches. Would stay again without hesitation.', createdAt: new Date('2024-05-06'), user: { name: 'Julia R.', image: null } }],
  },
  'surfboard-rental-kuta': {
    slug: 'surfboard-rental-kuta', title: 'Surfboard Rental', area: 'Kuta',
    price: 75000, duration: '360 minutes', level: 'All levels', language: 'English', maxGuests: 1,
    rating: 4.5, totalReviews: 156,
    description: 'Rent a quality surfboard from our Kuta Beach shack — longboards, shortboards, and softboards available by the hour or the day. All boards are waxed and ready, leashes included. The perfect setup for a morning surf session on Kuta\'s famous beginner-friendly break.',
    highlights: ['Longboards, shortboards and softboards available', 'Hourly or daily rates', 'Leash and wax included', 'Storage available while you\'re not surfing', 'Friendly team who know the local breaks'],
    includes: ['Surfboard of your choice', 'Leash', 'Wax'],
    excludes: ['Surf lessons (book separately)', 'Rash vest', 'Wetsuit'],
    meetingPoint: 'Kuta Wave Rentals, Jl. Pantai Kuta, in front of the lifeguard tower',
    images: ['https://images.unsplash.com/photo-1509914398892-963f53e6e2f1?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Kuta Wave Rentals', description: 'Kuta Beach\'s friendliest surf rental shack — quality boards, helpful team, and the best spot on the beach.', avatar: null, rating: 4.5, totalReviews: 156, user: { name: 'Komang Surya', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Great boards in good condition. Super easy pickup and drop-off. The longboard I rented was perfect for the morning session.', createdAt: new Date('2024-04-22'), user: { name: 'Ben H.', image: null } }],
  },
  'ebike-rental-canggu': {
    slug: 'ebike-rental-canggu', title: 'E-Bike Rental — Full Day', area: 'Canggu',
    price: 150000, duration: '1440 minutes', level: 'All levels', language: 'English', maxGuests: 1,
    rating: 4.8, totalReviews: 93,
    description: 'Explore Canggu and its beautiful surroundings on a fully charged electric bike — the perfect combination of exercise and ease. Cruise the rice terrace paths, coast roads, and village lanes without breaking a sweat, and return the bike at the end of the day fully re-charged.',
    highlights: ['Full day on a high-quality e-bike with 60km range', 'Explore rice terraces, coast roads and village lanes', 'No sweat required — pedal-assist does the work on hills', 'Helmet and lock included', 'Charging cable for mid-day top-up available'],
    includes: ['E-bike (full charge, 60km range)', 'Helmet', 'Lock', 'Charging cable', 'Basic route map'],
    excludes: ['Petrol (electric only)', 'Damage beyond normal wear', 'Gratuities'],
    meetingPoint: 'Canggu E-Bike Co., Jl. Raya Semat, Canggu (villa delivery available)',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1437796741086-22e3c0e38f12?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Canggu E-Bike Co.', description: 'The first dedicated e-bike rental in Canggu, offering high-quality electric bikes for eco-friendly exploration of Bali\'s most scenic areas.', avatar: null, rating: 4.8, totalReviews: 93, user: { name: 'Made Sudiana', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Changed how I explored Bali. I covered so much more ground than on a scooter, discovered so many quiet paths, and arrived everywhere fresh. Brilliant.', createdAt: new Date('2024-05-03'), user: { name: 'Anna L.', image: null } }],
  },
  'coworking-space-canggu': {
    slug: 'coworking-space-canggu', title: 'Coworking Day Pass', area: 'Canggu',
    price: 120000, duration: '480 minutes', level: 'All levels', language: 'English', maxGuests: 1,
    rating: 4.7, totalReviews: 74,
    description: 'Spend the day working from one of Canggu\'s best coworking spaces — fast fiber internet, ergonomic desks, air conditioning, great coffee, and a community of like-minded digital nomads. Day pass includes unlimited coffee and tea, a dedicated desk, and use of meeting rooms.',
    highlights: ['100 Mbps fiber internet with redundant backup', 'Ergonomic height-adjustable desks', 'Air-conditioned and open-air sections', 'Unlimited coffee, tea and cold water', 'Access to meeting room (book in advance)'],
    includes: ['Full day desk access (8 hours)', 'Unlimited coffee and tea', 'High-speed Wi-Fi', 'Printing (10 pages)', 'Locker'],
    excludes: ['Meals (café on site)', 'Meeting room beyond 1 hour', 'Private office'],
    meetingPoint: 'Bali Nomad Hub, Jl. Batu Bolong, Canggu',
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Bali Nomad Hub', description: 'Canggu\'s most-loved coworking space — fast internet, great coffee, and a welcoming community of remote workers, freelancers and founders from around the world.', avatar: null, rating: 4.7, totalReviews: 74, user: { name: 'Kadek Artha', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Best coworking in Canggu. Internet never dropped once. The coffee is great and the vibe is friendly and productive. Day pass is excellent value.', createdAt: new Date('2024-05-01'), user: { name: 'Alex P.', image: null } }],
  },
  // ── Culinary (new) ──────────────────────────────────────────────────────────
  'spice-garden-cooking': {
    slug: 'spice-garden-cooking', title: 'Spice Garden & Farm-to-Table', area: 'Ubud',
    price: 520000, duration: '4 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.9, totalReviews: 112,
    description: 'Begin your morning among the fragrant spice plants of a working Ubud garden — picking lemongrass, galangal, turmeric, and kaffir lime — before heading to an open kitchen to prepare a full Balinese feast using only what you\'ve just harvested. A true farm-to-table experience in the heart of the island.',
    highlights: ['Guided foraging walk through the working spice garden', 'Cook a full feast from only what you harvest', 'Learn the role of each spice in Balinese cooking', 'Sit down to enjoy your creation with fresh juice', 'Take home a bundle of fresh herbs and a recipe booklet'],
    includes: ['Garden walk with guide', 'All cooking ingredients', 'Full meal you prepare', 'Welcome drink', 'Recipe booklet and fresh herb bundle'],
    excludes: ['Transport to the garden compound', 'Alcoholic beverages', 'Gratuities'],
    meetingPoint: 'Bambu Indah Spice Garden, Jl. Sayan, Ubud',
    images: ['https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Ubud Spice Kitchen', description: 'A farm-to-table cooking school set in a working spice garden near the Ayung River, teaching the ancient connections between Balinese land, spice, and cuisine.', avatar: null, rating: 4.9, totalReviews: 112, user: { name: 'Putu Ayu', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Foraging our own spices and then cooking them was genuinely magical. The garden smells incredible. Best cooking class I\'ve done anywhere.', createdAt: new Date('2024-05-09'), user: { name: 'Charlotte B.', image: null } }],
  },
  'bali-coffee-tour': {
    slug: 'bali-coffee-tour', title: 'Kintamani Coffee & Tea Tour', area: 'Kintamani',
    price: 350000, duration: '3 hours', level: 'Easy', language: 'English', maxGuests: 12,
    rating: 4.7, totalReviews: 67,
    description: 'Visit a working Arabica plantation on the volcanic slopes of Mount Batur, where you\'ll pick coffee cherries, learn the full wet-process journey, roast beans on a traditional clay pot, and taste eight varieties — including the legendary kopi luwak. Stunning views across Lake Batur included.',
    highlights: ['Pick ripe cherries from high-altitude Arabica plants', 'Learn the full coffee journey from cherry to cup', 'Roast and grind beans using traditional clay pot', 'Taste eight varieties of Balinese coffee and herbal tea', 'Volcano and lake views throughout'],
    includes: ['Plantation tour', 'Coffee tasting (8 varieties)', 'Herbal tea tasting', 'Roasting demo', '250g freshly roasted beans to take home'],
    excludes: ['Transport to Kintamani', 'Lunch', 'Additional coffee purchases', 'Gratuities'],
    meetingPoint: 'Batur Arabica Plantation, Jl. Raya Kintamani, Batur village',
    images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Batur Arabica Estate', description: 'Family-run plantation on Mount Batur\'s volcanic slopes, producing specialty Arabica at 1,200m altitude and welcoming visitors to experience the full journey from tree to cup.', avatar: null, rating: 4.7, totalReviews: 67, user: { name: 'Ketut Wirawan', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'The beans we roasted on the clay pot were the best coffee of my life. Not an exaggeration. The plantation views are breathtaking too.', createdAt: new Date('2024-04-02'), user: { name: 'Emma J.', image: null } }],
  },
  // ── Culture (new) ───────────────────────────────────────────────────────────
  'balinese-dance-workshop': {
    slug: 'balinese-dance-workshop', title: 'Balinese Dance Workshop', area: 'Ubud',
    price: 380000, duration: '2 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.7, totalReviews: 84,
    description: 'Learn the expressive language of Balinese dance — the precise eye movements, hand gestures (mudra), and flowing body sequences — in a hands-on masterclass at Ubud\'s most respected dance studio. No dance experience is required. All levels leave with a new appreciation for one of the world\'s most beautiful art forms.',
    highlights: ['Learn the core mudra hand gestures and eye movements', 'Guided by a professional Balinese dancer', 'Try on a traditional costume for photos', 'Small group (max 8) for personal attention', 'Set in an authentic dance studio in Ubud'],
    includes: ['2-hour dance workshop', 'All costume accessories for class', 'Post-class costume photo session', 'Welcome drink'],
    excludes: ['Transport to studio', 'Private session upgrade', 'Gratuities'],
    meetingPoint: 'Semara Ratih Dance Studio, Jl. Raya Lodtunduh, Ubud',
    images: ['https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Semara Ratih Dance Studio', description: 'Ubud\'s most respected classical dance school, welcoming visitors to learn the art of Legong, Kecak and Barong dance.', avatar: null, rating: 4.7, totalReviews: 84, user: { name: 'Ni Nyoman Sari', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Even with two left feet I left feeling like I understood Balinese dance on a completely new level. The teacher was patient and inspiring.', createdAt: new Date('2024-05-06'), user: { name: 'Olivia S.', image: null } }],
  },
  'bali-language-class': {
    slug: 'bali-language-class', title: 'Balinese Language & Culture Class', area: 'Ubud',
    price: 280000, duration: '2 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.6, totalReviews: 32,
    description: 'Learn to greet, thank and converse in Balinese — and understand the cultural context that makes the language so deeply meaningful. In this warm, interactive class, local teacher Wayan shares the everyday phrases that will transform how Balinese people receive you for the rest of your trip.',
    highlights: ['Learn 30+ essential Balinese phrases with correct pronunciation', 'Understand the cultural context behind greetings and expressions', 'Practice with your teacher in real conversation', 'Leave with a printed phrase card for the rest of your trip', 'Small group (max 8) for real interaction'],
    includes: ['2-hour class with Wayan', 'Printed Balinese phrase card', 'Welcome tea'],
    excludes: ['Transport to class location', 'Gratuities'],
    meetingPoint: 'Rumah Bahasa Bali, Jl. Hanoman, Ubud',
    images: ['https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Rumah Bahasa Bali', description: 'Wayan teaches Balinese language and culture to curious visitors, helping travellers connect more deeply with the island and its people.', avatar: null, rating: 4.6, totalReviews: 32, user: { name: 'Wayan Suwita', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Balinese people lit up when we used even a few phrases. Wayan\'s class completely changed how our trip felt. Worth every minute.', createdAt: new Date('2024-04-28'), user: { name: 'Sophie M.', image: null } }],
  },
  // ── Wellness & Healing (new) ────────────────────────────────────────────────
  'balinese-spa-ritual': {
    slug: 'balinese-spa-ritual', title: 'Balinese Spa & Flower Ritual', area: 'Seminyak',
    price: 480000, duration: '2 hours', level: 'All levels', language: 'English', maxGuests: 4,
    rating: 4.8, totalReviews: 141,
    description: 'Surrender to the full Balinese spa ritual — starting with a traditional full-body massage using warm coconut oil and jasmine essence, followed by a healing lulur body scrub, a floral milk bath, and a closing facial. Performed by trained Balinese therapists in a garden spa setting.',
    highlights: ['Full-body Balinese massage with warm coconut oil', 'Traditional lulur spice and rice body scrub', 'Petal-strewn floral milk bath', 'Healing facial with local plant extracts', 'Garden spa setting with tropical privacy'],
    includes: ['Full Balinese massage (60 min)', 'Lulur body scrub (20 min)', 'Floral milk bath (20 min)', 'Closing facial (20 min)', 'Welcome jamu tonic'],
    excludes: ['Transport to spa', 'Gratuities', 'Product purchases'],
    meetingPoint: 'Tirta Spa, Jl. Kayu Aya, Seminyak (free parking available)',
    images: ['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Tirta Spa Seminyak', description: 'A garden spa in Seminyak offering the full spectrum of traditional Balinese wellness treatments using locally sourced ingredients and ancient healing techniques.', avatar: null, rating: 4.8, totalReviews: 141, user: { name: 'Ni Luh Putu', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'The floral bath alone is worth the trip. The therapists are incredibly skilled and the garden setting is so beautiful and private. Total bliss.', createdAt: new Date('2024-05-14'), user: { name: 'Isabelle C.', image: null } }],
  },
  'breathwork-retreat-ubud': {
    slug: 'breathwork-retreat-ubud', title: 'Breathwork & Ice Bath Session', area: 'Ubud',
    price: 420000, duration: '90 minutes', level: 'All levels', language: 'English', maxGuests: 10,
    rating: 4.7, totalReviews: 56,
    description: 'Experience the transformative power of conscious breathwork combined with a guided cold water immersion — inspired by the Wim Hof method and adapted for the Balinese jungle setting. Facilitator Gede guides you through breathing cycles that activate the nervous system, followed by a 3-minute ice bath for deep physical and mental reset.',
    highlights: ['Guided breathwork cycles (3 rounds)', 'Cold water immersion (ice bath, 3 minutes)', 'Scientific explanation of the physiological effects', 'Set in an open-air jungle pavilion near Ubud', 'Integration breathwork and reflection time after'],
    includes: ['Breathwork guide Gede throughout', 'Ice bath (ice provided)', 'Yoga mat, blanket and eye pillow', 'Herbal tea and snack post-session', 'Digital breathwork resource guide'],
    excludes: ['Transport to the pavilion', 'Gratuities', 'Medical clearance (required — form sent on booking)'],
    meetingPoint: 'Jungle Breath Pavilion, Jl. Raya Kedewatan, Ubud',
    images: ['https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Ubud Breathwork', description: 'Gede leads transformative breathwork and cold immersion sessions in the Ubud jungle, helping guests reset body and mind using evidence-based techniques rooted in ancient breath traditions.', avatar: null, rating: 4.7, totalReviews: 56, user: { name: 'Gede Sunarya', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'The ice bath was terrifying and then extraordinary. I felt completely clear-headed for the rest of the day. Gede explains the science which makes it much less scary.', createdAt: new Date('2024-05-07'), user: { name: 'Lucas P.', image: null } }],
  },
  'ceramic-bowl-workshop': {
    slug: 'ceramic-bowl-workshop', title: 'Ceramic Bowl & Glaze Workshop', area: 'Ubud',
    price: 420000, duration: '3 hours', level: 'All levels', language: 'English', maxGuests: 6,
    rating: 4.8, totalReviews: 76,
    description: 'Learn the meditative art of pottery in a bamboo studio nestled in Ubud\'s rice fields. Master potter Nyoman guides you from wedging raw clay through wheel throwing, trimming, and glazing — your finished bowl is kiln-fired and shipped worldwide within three weeks.',
    highlights: ['Wheel throwing with a certified Ubud master potter', 'Choose from 20+ traditional Balinese glaze colours', 'Finished bowl kiln-fired and shipped to your home country', 'Small group of max 6 — personal guidance throughout', 'Rice-field setting with complimentary tea and snacks'],
    includes: ['All clay, tools, and glazes', 'Apron and protective gear', 'Tea and light snacks', 'Worldwide shipping of finished piece'],
    excludes: ['Transport to the studio', 'Additional pieces (IDR 150,000 each)', 'Gratuities'],
    meetingPoint: 'Nyoman\'s Clay Studio, Jl. Raya Mas, Ubud (5-min walk south of Ubud Palace)',
    images: ['https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Nyoman\'s Clay Studio', description: 'Family-run pottery studio in Ubud\'s art village of Mas, led by third-generation potter Nyoman Suwira who blends traditional Balinese technique with contemporary form.', avatar: null, rating: 4.8, totalReviews: 76, user: { name: 'Nyoman Suwira', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'One of the best things I did in Bali. Nyoman is so patient and the rice-field setting is magical. My bowl arrived home in perfect condition three weeks later.', createdAt: new Date('2024-03-20'), user: { name: 'Emma R.', image: null } }],
  },
  'gold-leaf-painting-class': {
    slug: 'gold-leaf-painting-class', title: 'Traditional Gold Leaf Painting', area: 'Ubud',
    price: 450000, duration: '3 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.9, totalReviews: 55,
    description: 'Discover the centuries-old Balinese art of gold leaf painting in a traditional studio near Ubud\'s art market. Artist Kadek teaches you how to sketch, ink, and apply 24K gold leaf to create your own panel of a Balinese deity or nature motif to take home.',
    highlights: ['Learn the full process — sketch, ink, and genuine 24K gold leaf application', 'Choose your motif: deity, lotus, barong, or custom design', 'Finished artwork yours to keep — framed on request', 'Intimate studio with max 8 students', 'Herbal tea and Balinese snacks served midway'],
    includes: ['All materials — canvas, inks, gold leaf', 'Artist-led instruction throughout', 'Finished artwork to take home', 'Herbal tea and snacks'],
    excludes: ['Framing (IDR 80,000 optional)', 'Transport to studio', 'Gratuities'],
    meetingPoint: 'Kadek\'s Art Studio, Jl. Hanoman 12, Ubud (opposite the Monkey Forest road)',
    images: ['https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Kadek Gold Leaf Art', description: 'Kadek Arisana has been painting in the traditional Kamasan style for 20 years, teaching visitors the fine art of gold leaf on natural canvas in his family studio.', avatar: null, rating: 4.9, totalReviews: 55, user: { name: 'Kadek Arisana', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Absolutely stunning experience. Kadek is a wonderful teacher and so passionate about preserving this art form. My painting is now framed at home — it\'s a treasure.', createdAt: new Date('2024-04-12'), user: { name: 'Sophie M.', image: null } }],
  },
  'ikat-weaving-sidemen': {
    slug: 'ikat-weaving-sidemen', title: 'Traditional Ikat Weaving — Sidemen', area: 'Sidemen',
    price: 400000, duration: '3.5 hours', level: 'All levels', language: 'English', maxGuests: 6,
    rating: 4.7, totalReviews: 33,
    description: 'Visit a traditional weaving family in Sidemen valley and learn the intricate process of ikat — a dyeing and weaving technique that predates Bali\'s Hindu era. You\'ll tie and dye yarn, then weave your own small swatch on a backstrap loom while surrounded by terraced rice fields and volcano views.',
    highlights: ['Learn traditional ikat tie-dye technique from a weaving family', 'Hands-on backstrap loom weaving — take your swatch home', 'Stunning Sidemen valley and Mount Agung backdrop', 'Small group ensures personal attention from the artisans', 'Visit the family\'s complete workshop and see finished textiles'],
    includes: ['All materials and tools', 'Guided demonstration and hands-on instruction', 'Take-home woven swatch', 'Refreshments and local fruit'],
    excludes: ['Transport from Ubud or Seminyak (arrange privately or ask us)', 'Full sarong weaving (separate 2-day class available)', 'Gratuities'],
    meetingPoint: 'Sidemen Weaving Cooperative, Jl. Raya Sidemen, Sidemen village (GPS: -8.4673, 115.4245)',
    images: ['https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Sidemen Weaving Family', description: 'The Suardana family has practised ikat weaving for four generations in the cool highland village of Sidemen, preserving one of Bali\'s most labour-intensive textile traditions.', avatar: null, rating: 4.7, totalReviews: 33, user: { name: 'Made Suardana', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'An extraordinary window into Balinese craft tradition. Made\'s family is warm and generous. The valley views are breathtaking and the weaving itself is deeply meditative.', createdAt: new Date('2024-02-18'), user: { name: 'Lena K.', image: null } }],
  },
  'lontar-leaf-engraving': {
    slug: 'lontar-leaf-engraving', title: 'Lontar Leaf Manuscript Engraving', area: 'Klungkung',
    price: 480000, duration: '2.5 hours', level: 'All levels', language: 'English', maxGuests: 6,
    rating: 4.8, totalReviews: 28,
    description: 'Lontar manuscripts are Bali\'s ancient books — palm leaves inscribed with prayers, stories, and astronomical charts that have preserved Balinese culture for centuries. In this hands-on workshop in royal Klungkung, a lontar scholar teaches you the engraving technique using a traditional stylus, then rubs lamp-black ink into your marks to reveal the writing.',
    highlights: ['Create your own lontar inscription using a traditional pengutik stylus', 'Learn the significance of lontar in Balinese Hindu culture', 'Workshop led by a certified lontar scholar', 'Take your inscribed leaf home as a unique souvenir', 'Visit the Kertha Gosa royal pavilion nearby (optional)'],
    includes: ['Prepared lontar leaf', 'Pengutik stylus and lamp-black ink', 'Scholar-led instruction', 'Take-home inscribed leaf in traditional casing'],
    excludes: ['Transport to Klungkung', 'Kertha Gosa entry fee (IDR 30,000 if visiting)', 'Gratuities'],
    meetingPoint: 'Lontar Studio, Jl. Puputan, Semarapura, Klungkung (opposite Kertha Gosa park)',
    images: ['https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Klungkung Lontar Academy', description: 'Wayan Raka is one of only a handful of practising lontar scholars in Bali, dedicated to keeping the ancient manuscript tradition alive through workshops and community preservation projects.', avatar: null, rating: 4.8, totalReviews: 28, user: { name: 'Wayan Raka', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Completely unique experience — I\'d never even heard of lontar before this. Wayan is a fascinating teacher. My inscribed leaf is one of my favourite things I\'ve ever brought home from travel.', createdAt: new Date('2024-01-30'), user: { name: 'Tom H.', image: null } }],
  },
  'gold-silver-ring-making': {
    slug: 'gold-silver-ring-making', title: 'Gold & Silver Ring Making Class', area: 'Canggu',
    price: 620000, duration: '3 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.8, totalReviews: 61,
    description: 'Craft a sterling silver or gold-plated ring from raw wire in a modern silversmith studio in Canggu. Goldsmith Putu walks you through cutting, shaping, soldering, and polishing until you have a wearable piece of jewellery made entirely by your own hands.',
    highlights: ['Make a real wearable sterling silver or gold-plated ring', 'Full process — cut, shape, solder, texture, and polish', 'Choose your design: simple band, twisted, hammered, or stone setting', 'Certified goldsmith instruction throughout', 'All tools and materials provided — no experience needed'],
    includes: ['Sterling silver wire or gold-plated option', 'All tools and soldering equipment', 'Certified goldsmith instructor', 'Polished finished ring to wear home'],
    excludes: ['Gemstone setting upgrade (IDR 150,000)', 'Transport to studio', 'Gratuities'],
    meetingPoint: 'Canggu Silver Studio, Jl. Batu Bolong 52, Canggu (near Canggu Club)',
    images: ['https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Canggu Silver Studio', description: 'Putu trained under Yogyakarta\'s finest goldsmiths before opening his Canggu studio, where he runs small-group jewellery-making classes for travellers who want to take home something truly made by hand.', avatar: null, rating: 4.8, totalReviews: 61, user: { name: 'Putu Wijaya', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'I was so nervous but Putu made it completely accessible. My ring turned out beautiful and I wear it every day. Best souvenir I\'ve ever made anywhere in the world.', createdAt: new Date('2024-05-01'), user: { name: 'Clara B.', image: null } }],
  },
  'endek-textile-workshop': {
    slug: 'endek-textile-workshop', title: 'Balinese Endek Textile Workshop', area: 'Gianyar',
    price: 360000, duration: '3 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.7, totalReviews: 44,
    description: 'Endek is Bali\'s royal silk — a weft ikat fabric worn at ceremonies and increasingly celebrated in international fashion. In Gianyar, Bali\'s textile capital, you\'ll visit an endek weaving cooperative, try your hand at the shuttle loom, and learn natural dyeing techniques from artisans who have been weaving since childhood.',
    highlights: ['Try shuttle-loom weaving on authentic endek equipment', 'Learn natural dyeing with turmeric, indigo, and mangrove bark', 'See the full endek production process from raw yarn to finished cloth', 'Take home a small woven swatch and dyed yarn sample', 'Visit Gianyar\'s famous textile market after the workshop'],
    includes: ['All materials and dye ingredients', 'Expert artisan instruction', 'Take-home swatch and dyed yarn', 'Refreshments'],
    excludes: ['Transport to Gianyar', 'Full endek sarong purchase (available at market price)', 'Gratuities'],
    meetingPoint: 'Gianyar Endek Cooperative, Jl. Kepundung, Gianyar town centre (10 min from Ubud)',
    images: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Gianyar Endek Cooperative', description: 'A women-led weaving cooperative in Gianyar preserving the royal endek silk tradition, offering authentic workshops and direct sales that support 30+ local artisan families.', avatar: null, rating: 4.7, totalReviews: 44, user: { name: 'Ibu Ratih', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Ibu Ratih and the cooperative are doing incredible work. The workshop is educational, hands-on, and deeply moving — these women are masters. I bought three sarongs afterwards.', createdAt: new Date('2024-03-08'), user: { name: 'Diana F.', image: null } }],
  },
  'breathwork-pranayama': {
    slug: 'breathwork-pranayama', title: 'Breathwork & Pranayama Session', area: 'Ubud',
    price: 300000, duration: '75 min', level: 'All levels', language: 'English', maxGuests: 10,
    rating: 4.9, totalReviews: 118,
    description: 'A guided 75-minute pranayama and conscious connected breathwork session in an open-air bamboo shala surrounded by Ubud jungle. Teacher Dewa combines traditional yogic breathing techniques with modern breathwork research to help you release stress, increase clarity, and access deeper states of relaxation.',
    highlights: ['Master four core pranayama techniques: nadi shodhana, kapalabhati, bhastrika, and ujjayi', 'Guided conscious connected breathing journey', 'Open-air bamboo shala with jungle canopy views', 'Post-session integration time with herbal tea', 'Personalised technique recommendations to take home'],
    includes: ['Mat, blanket, and eye pillow', 'Guided 75-minute session', 'Post-session herbal tea', 'Technique handout to continue at home'],
    excludes: ['Transport to the shala', 'Gratuities'],
    meetingPoint: 'Ubud Pranayama Shala, Jl. Raya Sanggingan, Ubud (next to Neka Art Museum)',
    images: ['https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Ubud Pranayama Shala', description: 'Dewa Arya is a certified pranayama teacher trained in Rishikesh with 12 years of practice, offering transformative breathwork sessions in a dedicated jungle shala in Ubud.', avatar: null, rating: 4.9, totalReviews: 118, user: { name: 'Dewa Arya', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'I cried during the breathwork and left feeling completely weightless. Dewa holds the space beautifully. I\'ve done breathwork before but this was something else entirely.', createdAt: new Date('2024-05-14'), user: { name: 'Zoe L.', image: null } }],
  },
  'holotropic-breathwork': {
    slug: 'holotropic-breathwork', title: 'Holotropic Breathwork Journey', area: 'Canggu',
    price: 450000, duration: '2 hours', level: 'Intermediate', language: 'English', maxGuests: 8,
    rating: 4.8, totalReviews: 49,
    description: 'A deep two-hour holotropic breathwork session using accelerated breathing patterns and evocative music to access non-ordinary states of consciousness. Facilitator Ani creates a safe, ceremonial container for inner exploration — often described as one of the most profound experiences guests have in Bali.',
    highlights: ['Full holotropic session with evocative music journey', 'Small group of max 8 for intimate facilitation', 'Integration circle after the session', 'Complimentary cacao ceremony opening', 'Experienced certified facilitator throughout'],
    includes: ['Yoga mat, blanket, eye mask', 'Cacao ceremony opening', 'Guided 2-hour holotropic session', 'Integration circle and herbal tea'],
    excludes: ['Transport to venue', 'Pre-session health screening is required — contact us first if you have heart or respiratory conditions', 'Gratuities'],
    meetingPoint: 'The Sanctuary, Jl. Pantai Batu Bolong, Canggu (opposite Echo Beach carpark)',
    images: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'The Sanctuary Canggu', description: 'Ani Dewi is a certified holotropic breathwork facilitator trained under Dr Stanislav Grof\'s lineage, offering ceremonial sessions in a purpose-built sound-treated space in Canggu.', avatar: null, rating: 4.8, totalReviews: 49, user: { name: 'Ani Dewi', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Indescribable. I\'ve never experienced anything like it. Ani is extraordinarily skilled at holding space. Whatever you think this is — it\'s more. Go in open.', createdAt: new Date('2024-04-28'), user: { name: 'James W.', image: null } }],
  },
  'balinese-massage-ritual': {
    slug: 'balinese-massage-ritual', title: 'Traditional Balinese Massage', area: 'Seminyak',
    price: 380000, duration: '90 min', level: 'All levels', language: 'English', maxGuests: 2,
    rating: 4.8, totalReviews: 204,
    description: 'A 90-minute traditional Balinese massage using a blend of gentle stretches, acupressure, reflexology, and warm coconut oil infused with local spices. Performed in a tranquil villa spa setting in Seminyak, this is the authentic version of Bali\'s most beloved healing tradition — restorative, grounding, and deeply relaxing.',
    highlights: ['Authentic Balinese technique — not a Western adaptation', 'Warm spiced coconut oil using locally sourced ingredients', 'Dedicated therapist with 5+ years of traditional training', 'Private treatment room with floral foot bath opening ritual', 'Followed by cold pressed herbal jamu and fresh fruit'],
    includes: ['90-minute traditional Balinese massage', 'Floral foot bath ritual', 'Warm spiced coconut oil', 'Post-massage jamu and fruit'],
    excludes: ['Transport to the spa', 'Additional treatments', 'Gratuities (appreciated)'],
    meetingPoint: 'Jiva Spa, Jl. Raya Seminyak 18, Seminyak (ask for Balible booking at reception)',
    images: ['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Jiva Spa Seminyak', description: 'A traditional Balinese spa in Seminyak staffed entirely by locally trained therapists, offering authentic treatments that draw on centuries of Balinese healing knowledge.', avatar: null, rating: 4.8, totalReviews: 204, user: { name: 'Ibu Sari', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'The best massage I\'ve had anywhere in Southeast Asia. The therapist read my body perfectly and the ambience is completely serene. Worth every rupiah.', createdAt: new Date('2024-05-20'), user: { name: 'Rachel T.', image: null } }],
  },
  'yin-yoga-nidra': {
    slug: 'yin-yoga-nidra', title: 'Yin Yoga & Yoga Nidra', area: 'Canggu',
    price: 250000, duration: '90 min', level: 'All levels', language: 'English', maxGuests: 12,
    rating: 4.9, totalReviews: 143,
    description: 'A deeply restorative 90-minute practice combining long-hold Yin yoga poses with a 20-minute Yoga Nidra (yogic sleep) guided meditation. Held in a beautiful open-air studio in Canggu, this class is perfect for nervous system reset, flexibility, and deep mental rest — no prior yoga experience required.',
    highlights: ['Long-hold Yin poses targeting deep connective tissue and fascia', '20-minute guided Yoga Nidra journey at the close', 'Experienced teacher with 800+ hours certification', 'Props-supported: bolsters, blocks, and blankets provided', 'All levels welcome — completely adaptable practice'],
    includes: ['Yoga mat, bolsters, blocks, and blanket', 'Guided 90-minute Yin + Nidra class', 'Post-class herbal tea'],
    excludes: ['Transport to studio', 'Gratuities'],
    meetingPoint: 'The Ohana Shala, Jl. Canggu Padang Linjong, Canggu (behind Finns Beach Club)',
    images: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'The Ohana Shala', description: 'Ketut Sari teaches Yin and restorative yoga in a lovingly designed open-air studio in Canggu, focusing on slowness and deep rest in a world that rarely stops.', avatar: null, rating: 4.9, totalReviews: 143, user: { name: 'Ketut Sari', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'I fell asleep during Yoga Nidra and woke feeling like I\'d slept eight hours. Ketut\'s voice is incredibly soothing. This is the class I return to every time I\'m in Canggu.', createdAt: new Date('2024-05-02'), user: { name: 'Mia C.', image: null } }],
  },
  'tibetan-singing-bowl': {
    slug: 'tibetan-singing-bowl', title: 'Private Tibetan Singing Bowl Session', area: 'Ubud',
    price: 400000, duration: '75 min', level: 'All levels', language: 'English', maxGuests: 4,
    rating: 4.9, totalReviews: 87,
    description: 'A private sound healing session with over 20 antique Tibetan singing bowls arranged around your body, played by master sound healer Komang. The vibrations resonate through your physical and energetic body, releasing tension, calming the nervous system, and inducing a profoundly meditative state that guests describe as life-changing.',
    highlights: ['Private session with 20+ antique hand-hammered Tibetan bowls', 'Bowls placed on and around the body for full vibrational immersion', 'Master healer with 18 years of practice', 'Optional chakra reading and discussion included', 'Held in a dedicated sound temple in the Ubud hills'],
    includes: ['75-minute private sound bath', 'Yoga mat and blanket', 'Post-session herbal tea and discussion', 'Optional chakra overview'],
    excludes: ['Transport to the sound temple', 'Gratuities'],
    meetingPoint: 'Komang\'s Sound Temple, Jl. Raya Lungsiakan, Kedewatan, Ubud (10 min north of centre)',
    images: ['https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Komang Sound Healing', description: 'Komang Astawa has been studying Tibetan sound healing in Nepal and Bali for 18 years, offering private sessions that combine bowl work with intuitive energy reading in a sacred purpose-built space.', avatar: null, rating: 4.9, totalReviews: 87, user: { name: 'Komang Astawa', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'I came in sceptical and left completely transformed. The vibrations are physical — you feel them in your chest, your spine, everywhere. Komang is a true healer. Book this.', createdAt: new Date('2024-04-19'), user: { name: 'Paul G.', image: null } }],
  },
  'metta-meditation-retreat': {
    slug: 'metta-meditation-retreat', title: 'Metta Loving-Kindness Meditation', area: 'Ubud',
    price: 280000, duration: '90 min', level: 'All levels', language: 'English', maxGuests: 10,
    rating: 4.8, totalReviews: 97,
    description: 'A 90-minute guided metta (loving-kindness) meditation session in a forest meditation hall in Ubud. Teacher Surya draws on Theravada Buddhist tradition to guide you through the classic four phrases of metta — starting with yourself and gradually expanding outward to all beings — creating a profound sense of openheartedness and compassion.',
    highlights: ['Traditional Theravada metta technique taught authentically', 'Begin with self-compassion and expand outward to all beings', 'Experienced meditation teacher trained in Myanmar and Thailand', 'Forest meditation hall with natural ventilation and birdsong', 'Includes 20 minutes of guided lovingkindness walking meditation'],
    includes: ['Cushion, mat, and meditation chair', 'Guided 90-minute session', 'Post-meditation discussion and Q&A', 'Herbal tea'],
    excludes: ['Transport to the meditation hall', 'Gratuities'],
    meetingPoint: 'Ubud Forest Meditation Hall, Jl. Bisma 8, Ubud (5-min walk from Jl. Raya Ubud)',
    images: ['https://images.unsplash.com/photo-1602192509154-0b900ee1f851?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Ubud Metta Centre', description: 'Surya Dharma teaches in the Theravada Buddhist tradition, trained at monasteries in Chiang Mai and Yangon, offering secular and traditional meditation sessions accessible to all.', avatar: null, rating: 4.8, totalReviews: 97, user: { name: 'Surya Dharma', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'The metta meditation completely changed how I relate to difficult people in my life. Surya teaches it so clearly and lovingly. I came back three times during my stay in Ubud.', createdAt: new Date('2024-03-15'), user: { name: 'Anna S.', image: null } }],
  },
  'boreh-body-treatment': {
    slug: 'boreh-body-treatment', title: 'Boreh Traditional Body Treatment', area: 'Ubud',
    price: 450000, duration: '2 hours', level: 'All levels', language: 'English', maxGuests: 2,
    rating: 4.8, totalReviews: 58,
    description: 'Boreh is Bali\'s ancient warming body scrub — a paste of cloves, ginger, cinnamon, galangal, and coriander applied warm to the body to stimulate circulation, relieve sore muscles, and cleanse the skin. This 2-hour ritual includes the traditional boreh application, a warm shower, and a full Balinese massage to finish.',
    highlights: ['Hand-mixed traditional boreh paste using 8 spices — the original recipe', 'Full body application followed by warm steam to open the skin', 'Relieves sore muscles — popular with surfers and trekkers', 'Full Balinese massage after the scrub', 'Floral bath and jamu to close the ritual'],
    includes: ['Traditional hand-mixed boreh paste', 'Steam wrap and warm shower', '60-minute Balinese massage', 'Floral bath closing ritual', 'Herbal jamu drink'],
    excludes: ['Transport to the spa', 'Gratuities (appreciated)'],
    meetingPoint: 'Boreh Wellness Ubud, Jl. Monkey Forest Rd 75, Ubud (adjacent to the Monkey Forest)',
    images: ['https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Boreh Wellness Ubud', description: 'Ibu Laksmi trained in traditional Balinese healing arts under her grandmother, a celebrated village healer, and has been offering authentic boreh and massage treatments in Ubud for 15 years.', avatar: null, rating: 4.8, totalReviews: 58, user: { name: 'Ibu Laksmi', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'I\'d been trekking every day for a week and my legs were destroyed. The boreh brought me completely back to life. The smell is extraordinary — like Bali in paste form. Incredible.', createdAt: new Date('2024-04-25'), user: { name: 'Marco D.', image: null } }],
  },
  'bahasa-bali-introduction': {
    slug: 'bahasa-bali-introduction', title: 'Balinese Language Introduction', area: 'Ubud',
    price: 220000, duration: '2 hours', level: 'All levels', language: 'English', maxGuests: 6,
    rating: 4.7, totalReviews: 36,
    description: 'Learn the basics of Bahasa Bali — the indigenous language spoken by Balinese Hindus — in a conversational two-hour class in Ubud. Teacher Kadek covers greetings, numbers, food and market vocabulary, polite phrases for temple visits, and a window into Bali\'s unique three-register language system that changes based on the social status of speaker and listener.',
    highlights: ['Learn greetings, numbers, and everyday market vocabulary', 'Understand Bali\'s three-register language system (low, mid, high Balinese)', 'Polite phrases for temple visits and local interactions', 'Interactive role-play with real market and ceremony scenarios', 'Take-home phrasebook and audio recordings'],
    includes: ['Printed phrasebook and vocabulary cards', 'Audio recording of key phrases', 'Two-hour interactive class', 'Tea and Balinese snacks'],
    excludes: ['Transport to the class venue', 'Gratuities'],
    meetingPoint: 'Ubud Language House, Jl. Dewi Sita 5, Ubud (near Nomad Restaurant)',
    images: ['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Ubud Language House', description: 'Kadek Mahendra is a Balinese linguist and former university lecturer who teaches both Bahasa Indonesia and Bahasa Bali to travellers wanting to connect more deeply with the island\'s culture.', avatar: null, rating: 4.7, totalReviews: 36, user: { name: 'Kadek Mahendra', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Kadek is a brilliant teacher and the class was so much fun. I used my new phrases in the market the next morning and people absolutely lit up. Can\'t recommend enough.', createdAt: new Date('2024-02-25'), user: { name: 'Hannah P.', image: null } }],
  },
  'gamelan-music-workshop': {
    slug: 'gamelan-music-workshop', title: 'Gamelan Music Workshop', area: 'Ubud',
    price: 350000, duration: '2 hours', level: 'All levels', language: 'English', maxGuests: 10,
    rating: 4.8, totalReviews: 72,
    description: 'Gamelan is the heartbeat of Bali — a percussion orchestra of bronze gongs, metallophones, and drums that accompanies every ceremony and dance performance. In this hands-on two-hour workshop in Ubud, a gamelan master teaches you to play interlocking melodic patterns on the gangsa (metallophone) and join the ensemble for a complete piece.',
    highlights: ['Play a full gamelan ensemble — not just observe', 'Learn the interlocking kotekan (interdependent melody) technique', 'Perform a complete traditional piece by the end of the session', 'Workshop led by a Pita Maha award-winning gamelan master', 'Visit the instrument-maker\'s workshop to see how bronze keys are cast'],
    includes: ['All instruments provided', 'Master-led instruction', 'Ensemble performance recording sent after class', 'Refreshments'],
    excludes: ['Transport to the gamelan hall', 'Gratuities'],
    meetingPoint: 'Ubud Gamelan Pavilion, Jl. Raya Ubud (behind Puri Saren Agung palace, east side)',
    images: ['https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Ubud Gamelan Academy', description: 'I Wayan Dibia is a nationally recognised gamelan master and former head of KOKAR Bali, the conservatory of traditional arts, who has dedicated his life to teaching and preserving Balinese musical heritage.', avatar: null, rating: 4.8, totalReviews: 72, user: { name: 'I Wayan Dibia', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'We performed a full piece together in just two hours — I could not believe it. The master is extraordinary and the whole experience is a joyful, joyful way to connect with Bali.', createdAt: new Date('2024-04-07'), user: { name: 'David K.', image: null } }],
  },
  'wayang-shadow-puppet': {
    slug: 'wayang-shadow-puppet', title: 'Wayang Shadow Puppet Workshop', area: 'Ubud',
    price: 320000, duration: '2.5 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.7, totalReviews: 44,
    description: 'Wayang kulit — shadow puppetry — is one of Indonesia\'s most ancient storytelling traditions and a UNESCO Intangible Heritage. In this workshop in Ubud, a master puppeteer teaches you to carve and paint your own puppet from buffalo hide, then perform a short scene behind the white screen as a dalang (puppeteer) narrates.',
    highlights: ['Carve and paint your own wayang puppet from genuine buffalo hide', 'Perform a shadow puppet scene behind the traditional kelir screen', 'Learn the epic Ramayana and Mahabharata story traditions', 'Guided by a third-generation UNESCO-recognised dalang (puppeteer)', 'Take your finished puppet home'],
    includes: ['Pre-cut buffalo hide puppet blank', 'Paints and carving tools', 'Master dalang instruction', 'Take-home finished puppet'],
    excludes: ['Transport to the studio', 'Gratuities'],
    meetingPoint: 'Wayang Kulit Studio, Jl. Tegalantang, Ubud (north of Arma Museum)',
    images: ['https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'I Ketut Kodi Wayang Studio', description: 'I Ketut Kodi is a third-generation dalang (shadow puppet master) whose family performances have been recognised by UNESCO, offering workshops that keep this ancient tradition alive for new generations.', avatar: null, rating: 4.7, totalReviews: 44, user: { name: 'I Ketut Kodi', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Ketut is a legend — literally a UNESCO-recognised master. Making the puppet was creative and meditative. The shadow theatre performance at the end gave me chills.', createdAt: new Date('2024-03-01'), user: { name: 'Yuki T.', image: null } }],
  },
  'pura-besakih-temple-tour': {
    slug: 'pura-besakih-temple-tour', title: 'Besakih Mother Temple Guided Tour', area: 'Karangasem',
    price: 380000, duration: '4 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.8, totalReviews: 119,
    description: 'Pura Besakih — the Mother Temple — is the largest, holiest, and most spiritually significant temple complex in Bali, comprising 23 separate temples on the slopes of Mount Agung. A knowledgeable guide accompanies you through the complex, explaining the cosmology, ritual calendar, and the significance of each pavilion against the dramatic backdrop of Bali\'s sacred volcano.',
    highlights: ['Private guide through all 23 temple compounds of the complex', 'Volcanic backdrop of Mount Agung on clear days', 'Learn Balinese Hindu cosmology and the significance of Pura Besakih', 'Witness active daily offerings and ceremonies', 'Sash and sarong provided to enter all areas'],
    includes: ['Certified local guide', 'Temple entrance fees', 'Sash and sarong for temple entry', 'Bottled water'],
    excludes: ['Transport from your accommodation (can be arranged — ask on booking)', 'Lunch (guide will recommend local warung)', 'Gratuities'],
    meetingPoint: 'Besakih Temple main car park, Jl. Raya Besakih, Rendang, Karangasem',
    images: ['https://images.unsplash.com/photo-1604999333679-b86d54738315?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Besakih Heritage Guides', description: 'Wayan Sudirta is a Karangasem-born guide with 15 years of experience at Besakih, trained in Balinese Hinduism and temple protocol, offering tours that go far beyond the standard tourist walk.', avatar: null, rating: 4.8, totalReviews: 119, user: { name: 'Wayan Sudirta', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Wayan transformed what could have been a generic temple visit into a genuine spiritual education. The scale of Besakih with Agung behind it is staggering. Essential Bali.', createdAt: new Date('2024-04-30'), user: { name: 'Kate M.', image: null } }],
  },
  'barong-mask-dance': {
    slug: 'barong-mask-dance', title: 'Barong & Keris Dance Performance', area: 'Batubulan',
    price: 150000, duration: '1 hour', level: 'All levels', language: 'English', maxGuests: 100,
    rating: 4.8, totalReviews: 263,
    description: 'The Barong and Keris dance is Bali\'s most iconic ritual performance — a dramatic battle between the lion-like Barong (good) and the witch Rangda (evil) that draws on the Calonarang sacred text. Performed every morning in the village of Batubulan, this is a genuine ceremonial performance, not a tourist show — the dancers enter a trance during the keris (dagger) scene.',
    highlights: ['Authentic daily performance — genuine trance dance ritual', 'Elaborate hand-carved masks and elaborate costumes', 'Knowledgeable guide explains the Calonarang story in English', 'Best seats in the front two rows — arrive 20 min early', 'Photo opportunities with costumed dancers after the show'],
    includes: ['Performance entry ticket', 'English story guide sheet', 'Post-show photo access'],
    excludes: ['Transport to Batubulan', 'Gratuities for dancers (customary — IDR 20,000 appreciated)'],
    meetingPoint: 'Pura Puseh Batubulan, Jl. Raya Batubulan, Batubulan village (20 min from Seminyak)',
    images: ['https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Batubulan Performance Group', description: 'The Batubulan village performance group has staged the Barong and Keris dance for over 60 years, maintaining the authentic sacred ritual while welcoming respectful international visitors every morning.', avatar: null, rating: 4.8, totalReviews: 263, user: { name: 'Pak Suarsa', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'The keris trance scene genuinely made my jaw drop — these men are pressing a dagger to their chests and it is very real. Nothing prepares you for it. Unmissable.', createdAt: new Date('2024-05-18'), user: { name: 'Ben A.', image: null } }],
  },
  'east-bali-villages-tour': {
    slug: 'east-bali-villages-tour', title: 'Ancient East Bali Villages Tour', area: 'Karangasem',
    price: 420000, duration: '6 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.7, totalReviews: 58,
    description: 'Explore the less-visited ancient villages of East Bali — including Tenganan Pegringsingan, one of Bali\'s oldest Bali Aga communities that has preserved pre-Hindu customs for over a thousand years. Your guide takes you through traditional village architecture, sacred geringsing double ikat weaving, and the old religious rituals that continue unchanged.',
    highlights: ['Visit Tenganan — Bali\'s best-preserved ancient Bali Aga village', 'See rare geringsing double-ikat weaving unique to this village', 'Explore the water palace ruins of Taman Ujung', 'Lunch at a warung with village elders (guide arranges)', 'Drive through the dramatic East Bali coastal road and rice terraces'],
    includes: ['Private car and driver', 'Certified local guide', 'Entrance fees to all sites', 'Bottled water'],
    excludes: ['Lunch (approximately IDR 80,000 at local warung)', 'Gratuities', 'Geringsing cloth purchase (available at village co-op prices)'],
    meetingPoint: 'Hotel pickup — provide your accommodation address at booking (Ubud, Seminyak, or Sanur departures)',
    images: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'East Bali Heritage Tours', description: 'Made Santika is a Karangasem native and certified heritage guide with 12 years of experience in East Bali\'s ancient villages, offering tours that prioritise authentic engagement over tourist-trail shortcuts.', avatar: null, rating: 4.7, totalReviews: 58, user: { name: 'Made Santika', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Tenganan was like stepping into a time portal. Made knew everyone in the village and the access we got felt genuinely privileged. The geringsing cloth we saw is extraordinary.', createdAt: new Date('2024-03-22'), user: { name: 'Lara J.', image: null } }],
  },
  'campuhan-ridge-walk': {
    slug: 'campuhan-ridge-walk', title: 'Campuhan Ridge Sunrise Walk', area: 'Ubud',
    price: 180000, duration: '2 hours', level: 'Easy', language: 'English', maxGuests: 8,
    rating: 4.8, totalReviews: 167,
    description: 'Walk the iconic Campuhan Ridge at sunrise with a local guide who knows every bird call, rice terrace, and traditional compound along the path. The trail runs along a narrow ridge between two river valleys — impossibly green, impossibly quiet at 6am — and ends at a small warung for fresh coconut and Balinese coffee before the day heats up.',
    highlights: ['Ubud\'s most beautiful trail — ridge walk between two river valleys', 'Sunrise timing for the best light and zero crowds', 'Local guide explains the rice farming cycle and local plants', 'End at a traditional warung with coconut and Balinese coffee', 'No strenuous climbing — suitable for all fitness levels'],
    includes: ['Local guide', 'Post-walk coconut and Balinese coffee at the ridge warung', 'Walking pole if needed'],
    excludes: ['Transport to the trailhead (15-min walk from central Ubud)', 'Gratuities'],
    meetingPoint: 'Campuhan Bridge, Jl. Raya Campuhan, Ubud (bridge at the base of the ridge — meet at 5:45am)',
    images: ['https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1552083375-1447ce886485?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Ubud Ridge Walks', description: 'Wayan Sutama is a born-and-raised Ubud local who has walked the Campuhan Ridge every morning for 20 years, sharing his deep knowledge of the local ecology and farming traditions with visitors.', avatar: null, rating: 4.8, totalReviews: 167, user: { name: 'Wayan Sutama', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Worth every rupiah and every early alarm. The ridge at sunrise is genuinely one of the most beautiful places I\'ve ever been. Wayan is warm, knowledgeable, and so proud of his home.', createdAt: new Date('2024-05-08'), user: { name: 'Olivia H.', image: null } }],
  },
  'jungle-trekking-sidemen': {
    slug: 'jungle-trekking-sidemen', title: 'Sidemen Valley Jungle Trek', area: 'Sidemen',
    price: 380000, duration: '4 hours', level: 'Moderate', language: 'English', maxGuests: 8,
    rating: 4.8, totalReviews: 74,
    description: 'Trek through the lush jungle and terraced rice fields of Sidemen Valley with Mount Agung rising above you and the Unda River threading below. Your guide takes you through working farms, bamboo groves, and traditional compounds — one of Bali\'s most serene and authentically rural landscapes, still largely unknown to mass tourism.',
    highlights: ['Trek through rice terraces, jungle, and bamboo groves with Mount Agung views', 'Cross traditional bamboo bridges and visit working rice farms', 'Stop at a local compound for home-cooked Balinese lunch included', 'Small group ensures pace and personal attention', 'River swim opportunity at the Unda River crossing'],
    includes: ['Experienced local guide', 'Home-cooked Balinese lunch at a local family compound', 'Bottled water and snacks', 'River swim towel'],
    excludes: ['Transport to Sidemen (approximately 1.5 hours from Ubud)', 'Gratuities'],
    meetingPoint: 'Sidemen Village Cooperative, Jl. Raya Sidemen, Sidemen — or hotel pickup from Ubud (add IDR 150,000)',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1552083375-1447ce886485?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Sidemen Jungle Guides', description: 'Komang Artana grew up farming rice in Sidemen and became a guide to share the valley he loves — his local knowledge and family connections give guests access to experiences no outside operator can replicate.', avatar: null, rating: 4.8, totalReviews: 74, user: { name: 'Komang Artana', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Sidemen completely overshadowed every other landscape I saw in Bali. The lunch at Komang\'s family compound was extraordinary. This should be on every serious Bali itinerary.', createdAt: new Date('2024-04-15'), user: { name: 'Felix R.', image: null } }],
  },
  'sekumpul-waterfall-trek': {
    slug: 'sekumpul-waterfall-trek', title: 'Sekumpul Waterfall Hidden Trek', area: 'Singaraja',
    price: 480000, duration: '5 hours', level: 'Moderate', language: 'English', maxGuests: 6,
    rating: 4.9, totalReviews: 96,
    description: 'Sekumpul is widely considered Bali\'s most spectacular waterfall — a cluster of seven separate falls plunging 80 metres through a jungle canyon in North Bali. The trek descends through clove and bamboo forest, crosses jungle streams, and rewards you with one of the most dramatic natural spectacles on the island.',
    highlights: ['Seven waterfall cluster — Bali\'s most dramatic natural landmark', 'Trek through clove and bamboo forest with local guide', 'Swim in the natural pool at the base of the main falls', 'Far fewer tourists than South Bali — a genuine hidden gem', 'Village blessing and offering ceremony on arrival'],
    includes: ['Certified local guide', 'Entrance fee and local guide fee', 'Bottled water and energy snacks', 'Sarong for village entry'],
    excludes: ['Transport from Ubud or Seminyak (can be arranged — ask at booking)', 'Lunch', 'Gratuities'],
    meetingPoint: 'Sekumpul Waterfall Ticket Office, Desa Sekumpul, Lemukih, Singaraja — or hotel pickup from Ubud (add IDR 200,000)',
    images: ['https://images.unsplash.com/photo-1552083375-1447ce886485?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1499962707695-0786c0e41de0?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'North Bali Waterfall Guides', description: 'Putu Darma is a Sekumpul-born guide who has led treks to the falls for 10 years, with deep community ties that allow access to routes and village moments no outside guide can offer.', avatar: null, rating: 4.9, totalReviews: 96, user: { name: 'Putu Darma', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Sekumpul is the most spectacular place I visited in all of Bali — and I went to a lot of spectacular places. The trek is earnable and the payoff is extraordinary. Do not miss this.', createdAt: new Date('2024-05-10'), user: { name: 'Nathan B.', image: null } }],
  },
  'bali-bird-walk': {
    slug: 'bali-bird-walk', title: 'Bali Bird Watching Walk — Ubud', area: 'Ubud',
    price: 350000, duration: '3 hours', level: 'Easy', language: 'English', maxGuests: 6,
    rating: 4.7, totalReviews: 51,
    description: 'A guided early-morning birdwatching walk through the rice fields, river valleys, and forest paths around Ubud. Expert birder Gede spots and identifies over 30 species including the endangered Bali starling, Javan kingfisher, and multiple species of sunbird — sharing field glasses and detailed knowledge throughout.',
    highlights: ['Spot 30+ bird species on a single morning walk', 'Chance to see the critically endangered Bali starling in the wild', 'High-quality binoculars and field guides provided', 'Expert local ornithologist guide with 15 years of fieldwork', 'Walk through rice fields, river gorge, and forest — varied habitats'],
    includes: ['Binoculars and Bali bird field guide', 'Expert ornithologist guide', 'Species checklist to keep', 'Post-walk coffee at a local warung'],
    excludes: ['Transport to meeting point', 'Gratuities'],
    meetingPoint: 'Ubud Birdwatching Centre, Jl. Raya Campuhan, Ubud (opposite Murni\'s Warung — meet at 6:00am)',
    images: ['https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Ubud Birdwatching', description: 'Gede Sumerta has been studying Balinese birds for 15 years, contributing to the Cornell Lab of Ornithology eBird database and leading birdwatching tours that combine scientific rigour with deep local knowledge.', avatar: null, rating: 4.7, totalReviews: 51, user: { name: 'Gede Sumerta', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'I\'m not a birder but this completely converted me. Gede\'s enthusiasm is infectious and his knowledge is astonishing. We spotted 34 species in three hours including a Bali starling.', createdAt: new Date('2024-03-05'), user: { name: 'Simon W.', image: null } }],
  },
  'bali-safari-wildlife': {
    slug: 'bali-safari-wildlife', title: 'Bali Safari & Marine Park', area: 'Gianyar',
    price: 550000, duration: '4 hours', level: 'All levels', language: 'English', maxGuests: 20,
    rating: 4.7, totalReviews: 88,
    description: 'A full guided morning at Bali Safari and Marine Park in Gianyar — home to over 100 species of animals across Indonesian, Indian, and African habitats. Your guide leads you on the open-sided safari truck through free-range enclosures, narrating the conservation programs and animal welfare initiatives behind each species.',
    highlights: ['Open-truck safari through Indonesian, Indian, and African free-range zones', 'Feeding experiences with elephants and sun bears', 'Behind-the-scenes wildlife conservation briefing', 'Balinese cultural performance included in your visit', 'Kid-friendly and accessible for all ages'],
    includes: ['Safari park entrance and open-truck safari', 'Cultural performance ticket', 'Certified guide throughout', 'Bottled water'],
    excludes: ['Transport to Bali Safari (Gianyar — 30 min from Ubud)', 'Elephant ride upgrade (IDR 350,000)', 'Lunch', 'Gratuities'],
    meetingPoint: 'Bali Safari & Marine Park main entrance, Jl. Bypass Prof. Dr. Ida Bagus Mantra km 19.8, Gianyar',
    images: ['https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Bali Safari Guides', description: 'Made Sukerta has been a certified safari guide at Bali Safari for eight years, specialising in Indonesian wildlife and conservation education for families and wildlife enthusiasts.', avatar: null, rating: 4.7, totalReviews: 88, user: { name: 'Made Sukerta', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'My kids absolutely loved it — and so did I. The free-range safari feels genuinely wild. Made\'s commentary on conservation was eye-opening. Well worth the trip from Ubud.', createdAt: new Date('2024-04-03'), user: { name: 'Claire T.', image: null } }],
  },
  'mount-agung-sunrise-trek': {
    slug: 'mount-agung-sunrise-trek', title: 'Mount Agung Sunrise Summit Trek', area: 'Karangasem',
    price: 950000, duration: '8 hours', level: 'Challenging', language: 'English', maxGuests: 4,
    rating: 4.9, totalReviews: 62,
    description: 'Mount Agung (3,031m) is Bali\'s highest and most sacred peak — the home of the gods and the axis around which Balinese cosmology revolves. This challenging overnight summit trek departs at midnight, reaching the crater rim at dawn for an extraordinary sunrise above the clouds with Java\'s Mount Rinjani visible across the Lombok Strait.',
    highlights: ['Summit Bali\'s highest and holiest peak at 3,031 metres', 'Crater rim sunrise above the clouds — Java\'s Rinjani visible on clear days', 'Certified mountain guide with 200+ Agung ascents', 'Small group of max 4 for safety and personal attention', 'Midnight start — headtorches and full gear provided'],
    includes: ['Certified mountain guide', 'Headtorches and trekking poles', 'Hot breakfast at the summit', 'All safety equipment', 'Ceremonial offering for Agung (required — included)'],
    excludes: ['Transport to trailhead (Pura Pasar Agung, Selat — 2 hours from Ubud)', 'Hiking boots (bring your own — essential)', 'Warm layers (temperature at summit: 5–10°C)', 'Gratuities'],
    meetingPoint: 'Pura Pasar Agung, Desa Selat, Karangasem — meet guide at 11:30pm for midnight departure',
    images: ['https://images.unsplash.com/photo-1499962707695-0786c0e41de0?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1552083375-1447ce886485?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Agung Summit Guides', description: 'Nyoman Agus has guided over 400 successful summit ascents of Mount Agung over 12 years, certified in mountain rescue and first aid, with a deep knowledge of the mountain\'s sacred protocols and seasonal conditions.', avatar: null, rating: 4.9, totalReviews: 62, user: { name: 'Nyoman Agus', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'The hardest thing I\'ve done in Bali and absolutely worth every gruelling step. Standing on the rim of an active volcano watching the sun rise above Java is one of the defining moments of my life. Nyoman is exceptional.', createdAt: new Date('2024-02-28'), user: { name: 'Alex M.', image: null } }],
  },
  'jatiluwih-rice-terrace-walk': {
    slug: 'jatiluwih-rice-terrace-walk', title: 'Jatiluwih UNESCO Rice Terrace Walk', area: 'Tabanan',
    price: 280000, duration: '3 hours', level: 'Easy', language: 'English', maxGuests: 8,
    rating: 4.8, totalReviews: 133,
    description: 'Walk through the UNESCO World Heritage rice terraces of Jatiluwih — the most expansive and best-preserved example of the traditional Balinese subak irrigation system that has shaped these hillsides for over a thousand years. Your guide explains the subak water temples, the spiritual ecology of Balinese rice farming, and the varieties of red, white, and black rice growing in each field.',
    highlights: ['UNESCO World Heritage Site — the best-preserved subak rice terraces in Bali', 'Walk directly through the working terraces — not on a viewing platform', 'Guide explains the subak water temple system and Balinese cosmology of rice', 'Visit a working rice mill and taste freshly milled Jatiluwih red rice', 'Sweeping panoramas across Tabanan\'s river valleys'],
    includes: ['Certified guide', 'UNESCO entrance fee', 'Rice mill visit and tasting', 'Bottled water'],
    excludes: ['Transport to Jatiluwih (1 hour from Ubud)', 'Lunch (guide recommends the best warung)', 'Gratuities'],
    meetingPoint: 'Jatiluwih Village ticket gate, Jl. Jatiluwih — Penebel, Tabanan (GPS: -8.3703, 115.1319)',
    images: ['https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1552083375-1447ce886485?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Jatiluwih Heritage Walks', description: 'Wayan Suartha is a Tabanan-born guide and former subak farmer who offers walks through Jatiluwih with an insider\'s understanding of the water temple system and the daily life of Balinese rice farmers.', avatar: null, rating: 4.8, totalReviews: 133, user: { name: 'Wayan Suartha', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'The scale of Jatiluwih is breathtaking — it goes on forever. Wayan\'s knowledge of the subak system completely reframed how I think about traditional agriculture. Highly recommended.', createdAt: new Date('2024-05-05'), user: { name: 'Charlotte B.', image: null } }],
  },
  'freediving-course-amed': {
    slug: 'freediving-course-amed', title: 'Freediving Course — Amed', area: 'Amed',
    price: 1200000, duration: 'Full day', level: 'Beginner', language: 'English', maxGuests: 4,
    rating: 4.9, totalReviews: 67,
    description: 'A full-day AIDA1-certified freediving course at Amed, home to some of Bali\'s clearest waters and the famous Japanese shipwreck. Starting with theory on breath physiology and equalization, you progress to pool sessions and then open-water dives, leaving with your internationally recognised AIDA1 certification and the ability to safely reach 10 metres on a single breath.',
    highlights: ['AIDA1 internationally recognised certification included', 'Amed\'s crystal-clear waters over the Japanese WWII shipwreck', 'Maximum 4 students per instructor for personalised coaching', 'Theory, pool training, and open-water dives all in one day', 'Includes post-course log book and certification card'],
    includes: ['AIDA1 certification', 'All dive equipment — wetsuit, fins, mask, weight belt', 'Instructor and pool time', 'Open water dives', 'Lunch and snacks', 'Certification card and log book'],
    excludes: ['Transport to Amed (3 hours from Seminyak — can arrange)', 'Accommodation in Amed (many excellent cheap options)', 'Gratuities'],
    meetingPoint: 'Amed Freediving Centre, Jl. Raya Amed, Amed village, Karangasem (on the beach front)',
    images: ['https://images.unsplash.com/photo-1559825481-12a05cc00344?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1682687220742-aba19b51a6c0?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Amed Freediving Centre', description: 'Kadek Wira is an AIDA2 certified instructor and competitive freediver who has trained over 300 beginner freedivers in Amed\'s exceptional waters — calm, clear, and rich with marine life.', avatar: null, rating: 4.9, totalReviews: 67, user: { name: 'Kadek Wira', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'I came to Bali with no intention of freediving and left with an AIDA certification. Kadek is an incredible teacher — patient, safe, and completely infectious in his passion for the ocean.', createdAt: new Date('2024-04-22'), user: { name: 'Sarah L.', image: null } }],
  },
  'scuba-intro-dive-amed': {
    slug: 'scuba-intro-dive-amed', title: 'Discover Scuba Diving — Amed', area: 'Amed',
    price: 850000, duration: '3 hours', level: 'Beginner', language: 'English', maxGuests: 4,
    rating: 4.9, totalReviews: 114,
    description: 'No experience needed — your Discover Scuba session in Amed begins with 45 minutes of breathing and buoyancy exercises in the shallows, then you descend to 12 metres with your instructor to explore Amed\'s famous Japanese WWII shipwreck and coral gardens teeming with tropical fish, turtles, and reef sharks.',
    highlights: ['PADI Discover Scuba — no certification or experience required', 'Dive over the Japanese WWII shipwreck at 12 metres depth', 'Excellent visibility — often 20+ metres in Amed', 'Maximum 2 students per instructor at all times', 'Underwater photos taken by instructor included'],
    includes: ['Full scuba equipment rental', 'Instructor-led shore dives to 12m', 'Theory and pool practice session', 'Underwater photos', 'Water and light snacks'],
    excludes: ['Transport to Amed', 'Medical clearance (form sent on booking — required for first-time divers)', 'Gratuities'],
    meetingPoint: 'Amed Diving Base, Jl. Raya Amed, Amed, Karangasem (beachfront, opposite the warung row)',
    images: ['https://images.unsplash.com/photo-1682687220742-aba19b51a6c0?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1559825481-12a05cc00344?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Amed Diving Base', description: 'A PADI Five Star dive centre in Amed with an exceptional safety record and locally trained instructors who know every reef and wreck in the area intimately.', avatar: null, rating: 4.9, totalReviews: 114, user: { name: 'Gede Antara', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Incredible. I\'ve always wanted to try scuba and this was the perfect first experience. The Japanese shipwreck is surreal. Gede made me feel completely safe the entire time.', createdAt: new Date('2024-05-25'), user: { name: 'Megan R.', image: null } }],
  },
  'surf-lesson-kuta': {
    slug: 'surf-lesson-kuta', title: 'Surf Lesson — Kuta Beach', area: 'Kuta',
    price: 350000, duration: '2 hours', level: 'Beginner', language: 'English', maxGuests: 4,
    rating: 4.7, totalReviews: 289,
    description: 'Kuta\'s gentle beach break is one of the world\'s best learning waves — long, consistent, and beginner-friendly year-round. Your certified surf instructor matches you with the right foam board, teaches you the pop-up technique on the sand, and gets you riding waves in the water within the first 30 minutes. Almost everyone stands up on their first session.',
    highlights: ['Kuta\'s gentle beach break — one of the world\'s best beginner waves', 'Certified instructor with max 4 students per group', 'Most guests stand up within the first 30 minutes', 'Includes foam board, rash guard, and surf wax', 'GoPro footage of your waves available (optional)'],
    includes: ['Foam surfboard', 'Rash guard', 'Certified surf instructor', 'Post-lesson cold coconut on the beach'],
    excludes: ['Transport to Kuta Beach', 'GoPro footage (IDR 100,000 optional)', 'Gratuities'],
    meetingPoint: 'Kuta Beach Surf School, Jl. Pantai Kuta, Kuta (in front of the Hard Rock Hotel — meet at 7:00am or 4:00pm)',
    images: ['https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Kuta Surf School', description: 'A Kuta institution since 2008, staffed entirely by ISA-certified Balinese instructors who have introduced thousands of first-time surfers to the joy of riding their first wave.', avatar: null, rating: 4.7, totalReviews: 289, user: { name: 'Wayan Krisna', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'I stood up on my second wave and felt like a champion. Wayan is so encouraging and the vibe is pure joy. Kuta\'s break is perfect for beginners. Best morning of my trip.', createdAt: new Date('2024-05-28'), user: { name: 'Jake O.', image: null } }],
  },
  'nusa-penida-snorkel-trip': {
    slug: 'nusa-penida-snorkel-trip', title: 'Nusa Penida Snorkel Day Trip', area: 'Nusa Penida',
    price: 650000, duration: 'Full day', level: 'All levels', language: 'English', maxGuests: 12,
    rating: 4.9, totalReviews: 342,
    description: 'A full-day snorkelling adventure to three of Nusa Penida\'s most iconic marine sites — Manta Point (manta ray cleaning station), Crystal Bay (Mola Mola territory), and Gamat Bay (coral garden with sea turtles). Fast boat transfers, certified snorkel guide, full equipment, and lunch on the beach included.',
    highlights: ['Three premier snorkel sites: Manta Point, Crystal Bay, and Gamat Bay', 'High probability of manta ray encounters at Manta Point', 'Sea turtle sightings at Gamat Bay\'s coral garden', 'Full snorkel equipment and life jacket provided', 'Beachside lunch included on Nusa Penida'],
    includes: ['Fast boat transfer from Sanur (return)', 'All snorkel equipment and life jackets', 'Certified guide', 'Beachside lunch', 'Bottled water and snacks'],
    excludes: ['Transport to Sanur port', 'Wetsuit (can be rented IDR 50,000)', 'Gratuities'],
    meetingPoint: 'Sanur Harbour, Jl. Hang Tuah, Sanur (check in at Balible desk at 7:30am)',
    images: ['https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1559825481-12a05cc00344?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1682687220742-aba19b51a6c0?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Nusa Penida Ocean Tours', description: 'Ketut Juniartha runs daily small-group snorkel trips to Nusa Penida with an exceptional marine ecology knowledge and commitment to responsible interaction with mantas, turtles, and reef systems.', avatar: null, rating: 4.9, totalReviews: 342, user: { name: 'Ketut Juniartha', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Swimming with five manta rays at Manta Point is the most extraordinary wildlife encounter of my life. Ketut knows the ocean here intimately. An absolutely perfect day.', createdAt: new Date('2024-06-01'), user: { name: 'Isabella K.', image: null } }],
  },
  'white-water-rafting-ayung': {
    slug: 'white-water-rafting-ayung', title: 'White Water Rafting — Ayung River', area: 'Ubud',
    price: 450000, duration: '2.5 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.8, totalReviews: 198,
    description: 'Raft through the dramatic jungle gorge of the Ayung River — Bali\'s longest river — shooting through Class II and III rapids past 50-metre waterfall cascades, ancient stone carvings on the canyon walls, and an unbroken corridor of tropical jungle. A certified guide steers every raft, making this accessible even for complete beginners.',
    highlights: ['Ayung River jungle gorge with 50-metre waterfall cascades', 'Class II–III rapids — thrilling but safe for all levels', 'Ancient stone carvings and temple ruins on the canyon walls', 'Certified raft guides — max 4 per raft', 'Buffet lunch at the riverside base camp after the run'],
    includes: ['All rafting equipment — helmet, life jacket, paddle', 'Certified guide per raft', 'Safety briefing', 'Buffet lunch', 'Changing rooms and showers at the base camp'],
    excludes: ['Transport to the Ayung put-in point (can arrange from Ubud — ask at booking)', 'Waterproof bag rental (IDR 30,000)', 'Gratuities'],
    meetingPoint: 'Ayung Rafting Base Camp, Jl. Kedewatan, Ubud (base camp at the river — shuttle from Ubud centre available)',
    images: ['https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1552083375-1447ce886485?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Ayung River Rafting', description: 'Bali\'s longest-running commercial rafting operator, with a 20-year safety record and certified guides who know every rapid, eddy, and waterfall on the Ayung by heart.', avatar: null, rating: 4.8, totalReviews: 198, user: { name: 'Kadek Purnama', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'The jungle canyon is extraordinary — it felt like a lost world. The rapids are genuinely exciting without being terrifying. The carvings in the cliff walls are surreal. Brilliant morning.', createdAt: new Date('2024-05-12'), user: { name: 'Ben C.', image: null } }],
  },
  'sup-lake-batur': {
    slug: 'sup-lake-batur', title: 'SUP on Lake Batur — Volcano Views', area: 'Kintamani',
    price: 380000, duration: '2 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.8, totalReviews: 57,
    description: 'Stand-up paddleboard on the glassy surface of Lake Batur — a volcanic caldera lake encircled by the crater rim of Bali\'s most active volcano. The lake\'s altitude means cool temperatures and mirror-calm water most mornings, while the views of Gunung Batur steaming above are unlike anything else in Bali.',
    highlights: ['SUP on a volcanic caldera lake — unique in all of Bali', 'Mount Batur active volcano views throughout the paddle', 'Cool mountain air and mirror-calm water most mornings', 'Suitable for complete beginners — full instruction provided', 'Visit lakeside Trunyan village by paddleboard (optional extension)'],
    includes: ['SUP board, paddle, and leash', 'Life jacket', 'Certified instructor', 'Warm ginger tea and snacks after the session'],
    excludes: ['Transport to Lake Batur (1 hour from Ubud)', 'Gratuities', 'Trunyan village extension (IDR 100,000 additional)'],
    meetingPoint: 'Toya Bungkah lakeside, Lake Batur, Kintamani — at the SUP board rack (meet at 7:00am)',
    images: ['https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1499962707695-0786c0e41de0?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Lake Batur SUP', description: 'Wayan Merta grew up fishing on Lake Batur and now runs the lake\'s premier stand-up paddleboard operation, combining water sport with deep knowledge of the volcano and the lakeside Bali Aga communities.', avatar: null, rating: 4.8, totalReviews: 57, user: { name: 'Wayan Merta', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Paddling on a volcanic crater lake with an active volcano steaming above you — I still can\'t believe this is a real thing you can do. Completely surreal and beautiful. Wayan is a brilliant guide.', createdAt: new Date('2024-04-08'), user: { name: 'Pedro G.', image: null } }],
  },
  'scuba-manta-ray-nusa': {
    slug: 'scuba-manta-ray-nusa', title: 'Manta Ray Scuba Dive — Nusa Penida', area: 'Nusa Penida',
    price: 1100000, duration: 'Full day', level: 'Certified divers', language: 'English', maxGuests: 4,
    rating: 5.0, totalReviews: 78,
    description: 'A full-day two-dive experience targeting Manta Point and Crystal Bay off Nusa Penida — two of the Indian Ocean\'s premier dive sites. Manta Point is a cleaning station where oceanic manta rays with 4-metre wingspans hover in the current as cleaner wrasse tend to them. Crystal Bay is home to the elusive Mola Mola (ocean sunfish) during the September–November season.',
    highlights: ['Manta Point — oceanic manta rays with 4-metre wingspans at a cleaning station', 'Crystal Bay — Mola Mola sightings in season (Sep–Nov)', 'Two dives with surface interval snorkel on Nusa Penida', 'Max 4 certified divers per guide for optimal sightings', 'Full briefing, equipment check, and post-dive analysis'],
    includes: ['Two guided scuba dives', 'Full equipment rental', 'PADI-certified dive master', 'Fast boat from Sanur (return)', 'Beachside lunch', 'Post-dive debriefing'],
    excludes: ['Transport to Sanur port', 'Valid dive certification card (must be presented)', 'Gratuities'],
    meetingPoint: 'Sanur Harbour, Jl. Hang Tuah, Sanur (check in at 7:00am — bring dive cert)',
    images: ['https://images.unsplash.com/photo-1682687220742-aba19b51a6c0?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1559825481-12a05cc00344?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Nusa Penida Dive Pro', description: 'A PADI Five Star centre specialising exclusively in the world-class dive sites of Nusa Penida, with Dive Masters who know the seasonal behaviour of mantas and Mola Mola intimately.', avatar: null, rating: 5.0, totalReviews: 78, user: { name: 'Nyoman Surya', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Five manta rays at the cleaning station — one passed directly beneath me. I was shaking for an hour afterwards. Nyoman positioned us perfectly and the briefing was meticulous. A bucket-list dive.', createdAt: new Date('2024-04-18'), user: { name: 'Laura M.', image: null } }],
  },
  'tirta-empul-purification': {
    slug: 'tirta-empul-purification', title: 'Tirta Empul Holy Water Ritual', area: 'Gianyar',
    price: 420000, duration: '3 hours', level: 'All levels', language: 'English', maxGuests: 6,
    rating: 4.9, totalReviews: 214,
    description: 'Tirta Empul is Bali\'s most sacred holy spring — a Hindu temple complex where Balinese devotees immerse themselves in the 30 natural fountains (called pelinggih) to purify body and spirit. Your guide prepares offerings, explains the ritual protocol, and accompanies you through the melukat purification ceremony in the spring pools, followed by a visit to the spring\'s origin temple.',
    highlights: ['Guided melukat purification ceremony in the sacred spring pools', 'Private offering preparation with your guide before entering', 'Explanation of each of the 30 fountain meanings', 'Visit the inner sanctum and spring-source temple', 'Sarong, sash, and white ceremonial cloth provided'],
    includes: ['Certified Balinese Hindu guide', 'Ceremonial offerings', 'Sarong, sash, and white cloth for purification', 'Temple entrance fee', 'Post-ceremony herbal tea'],
    excludes: ['Transport to Tirta Empul (30 min from Ubud)', 'Gratuities'],
    meetingPoint: 'Tirta Empul main gate, Jl. Tirta, Manukaya, Tampaksiring, Gianyar (meet at 7:30am before the crowds)',
    images: ['https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Sacred Bali Rituals', description: 'Gede Putra is a third-generation Balinese Hindu guide who accompanies guests through authentic sacred ceremonies with deep respect for the rituals\' meaning and the temple\'s sanctity.', avatar: null, rating: 4.9, totalReviews: 214, user: { name: 'Gede Putra', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Standing under those sacred fountains with Gede\'s guidance was one of the most moving experiences of my life. I\'m not religious but I felt something shift in me. Deeply, deeply special.', createdAt: new Date('2024-05-22'), user: { name: 'Amy J.', image: null } }],
  },
  'balian-healer-session': {
    slug: 'balian-healer-session', title: 'Balian Traditional Healer Session', area: 'Ubud',
    price: 550000, duration: '2 hours', level: 'All levels', language: 'English', maxGuests: 2,
    rating: 4.8, totalReviews: 91,
    description: 'A private session with a certified Balinese balian — a traditional healer who works with prayer, medicinal plants, energy reading, and physical treatment to restore balance. Unlike tourist "healer" experiences, this connects you with a genuine community healer who treats local Balinese clients and works within the traditional Hindu framework of spiritual and physical health.',
    highlights: ['Private session with a genuine community balian (traditional healer)', 'Energy reading and spiritual diagnosis in the traditional Balinese method', 'Herbal treatment using locally grown medicinal plants', 'Interpretation and translation provided throughout', 'Respectful, authentic ceremony — not a tourist performance'],
    includes: ['Translator and cultural interpreter', 'Ceremonial offerings', 'Herbal treatment', 'Post-session explanation and recommendations'],
    excludes: ['Transport to the healer\'s compound (typically rural Ubud area)', 'Additional herbal remedies to take home (purchased from healer directly)', 'Gratuities (customary offering to the healer — guide will advise)'],
    meetingPoint: 'Provided on booking — healer\'s compound location shared 24 hours before (Ubud area)',
    images: ['https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Ubud Healing Journeys', description: 'Wayan Kanta has facilitated respectful introductions to genuine Balinese healers for 12 years, carefully curating relationships with community balian who welcome visitors with openness and spiritual integrity.', avatar: null, rating: 4.8, totalReviews: 91, user: { name: 'Wayan Kanta', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'The healer diagnosed things about me that no one could have told him. Wayan\'s translation was sensitive and beautiful. I left with a herbal remedy and a sense of being truly seen. Unforgettable.', createdAt: new Date('2024-04-14'), user: { name: 'Julia F.', image: null } }],
  },
  'temple-offering-ceremony': {
    slug: 'temple-offering-ceremony', title: 'Balinese Temple Offering Ceremony', area: 'Ubud',
    price: 380000, duration: '2.5 hours', level: 'All levels', language: 'English', maxGuests: 6,
    rating: 4.8, totalReviews: 127,
    description: 'Learn to create a traditional canang sari — the daily palm-leaf offering that Balinese Hindus place at temple shrines, home altars, and business entrances every morning. Then accompany your guide to a local temple to present the offerings in a live ceremony, observing the prayers and incense ritual as part of the daily devotional practice rather than as a spectator.',
    highlights: ['Hand-make a traditional canang sari offering from palm leaves and flowers', 'Join a live temple ceremony to present your offering — not a performance', 'Learn the meaning of each element: flowers, incense, rice, and holy water', 'Dress in traditional Balinese ceremonial clothing for the temple visit', 'Morning light at the temple is extraordinary for photography'],
    includes: ['All offering materials — palm, flowers, incense, rice', 'Temple ceremonial clothing (kebaya or udeng)', 'Certified Hindu priest guide', 'Temple entrance fee', 'Post-ceremony Balinese breakfast'],
    excludes: ['Transport to the temple', 'Gratuities'],
    meetingPoint: 'Pura Taman Kemuda Saraswati, Jl. Raya Ubud, Ubud (the famous lotus temple — meet at 7:00am)',
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Ubud Temple Rituals', description: 'Ibu Kadek leads Balinese ceremony introductions with warmth and depth, drawing on her role as a temple priestess in her village and her fifteen years of guiding visitors through the living spiritual culture of Bali.', avatar: null, rating: 4.8, totalReviews: 127, user: { name: 'Ibu Kadek', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Making the offering and then presenting it at the temple was the most connected I felt to Balinese culture in two weeks. Ibu Kadek explains everything with such love. A really special experience.', createdAt: new Date('2024-05-16'), user: { name: 'Sandra P.', image: null } }],
  },
  'chakra-energy-healing': {
    slug: 'chakra-energy-healing', title: 'Chakra Balancing & Energy Healing', area: 'Ubud',
    price: 480000, duration: '90 min', level: 'All levels', language: 'English', maxGuests: 2,
    rating: 4.7, totalReviews: 63,
    description: 'A private 90-minute session combining chakra assessment, crystals, sound, and energy work to identify and release blockages in the seven energy centres. Healer Nyoman works intuitively, combining Balinese Hindu healing knowledge with yogic chakra philosophy and modern energy healing modalities to create a deeply personalised session.',
    highlights: ['Full seven-chakra assessment and balancing', 'Crystal placement, singing bowl, and tuning fork integration', 'Highly personalised — not a scripted session', 'Private treatment space with sacred geometric altar', 'Post-session written notes on your chakra state and recommendations'],
    includes: ['90-minute private healing session', 'Crystal and sound tools', 'Post-session written summary', 'Herbal tea and water'],
    excludes: ['Transport to the healing centre', 'Crystal purchase (available from healer)', 'Gratuities'],
    meetingPoint: 'Nyoman\'s Healing Studio, Jl. Raya Penestanan, Ubud (behind the rice terraces — directions sent on booking)',
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Nyoman Energy Healing', description: 'Nyoman Ratih blends Balinese healing tradition with training in Reiki, crystal therapy, and yogic chakra systems, offering deeply personalised sessions in a dedicated sacred space in Ubud\'s Penestanan neighbourhood.', avatar: null, rating: 4.7, totalReviews: 63, user: { name: 'Nyoman Ratih', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Nyoman knew things about my energy and my life without me saying a word. I left feeling lighter than I have in years. Whether you believe in chakras or not, this woman is extraordinary.', createdAt: new Date('2024-03-28'), user: { name: 'Tanya B.', image: null } }],
  },
  'sunrise-temple-blessing': {
    slug: 'sunrise-temple-blessing', title: 'Sunrise Temple Blessing Walk', area: 'Kintamani',
    price: 320000, duration: '3 hours', level: 'Easy', language: 'English', maxGuests: 6,
    rating: 4.9, totalReviews: 78,
    description: 'Walk to a small hilltop temple above Lake Batur at sunrise to receive a traditional Balinese Hindu blessing (tirtha) from a resident priest. The walk through the cool volcanic plateau at dawn — with the crater lake turning gold and Mount Agung rising in the east — is one of Bali\'s most peaceful and spiritually resonant experiences.',
    highlights: ['Receive a traditional tirtha (holy water) blessing from a Balinese priest', 'Sunrise walk across the volcanic Batur plateau', 'Panoramic views of Lake Batur and Mount Agung at golden hour', 'Ceremonial flower and incense offering included', 'Warm jamu and breakfast at a lakeside warung after the blessing'],
    includes: ['Local guide and translator', 'Ceremonial offering materials', 'Sarong and sash for temple entry', 'Post-blessing breakfast at lakeside warung'],
    excludes: ['Transport to Kintamani (1 hour from Ubud)', 'Gratuities (small donation to the temple priest is customary)'],
    meetingPoint: 'Pura Ulun Danu Batur parking area, Kintamani — meet guide at 5:30am (sunrise timing)',
    images: ['https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Kintamani Sacred Walks', description: 'Made Wirawan is a Kintamani native and ceremonial guide trained in Balinese Hindu priestly tradition, leading pre-dawn walks that connect visitors to the sacred geography of the Batur volcano and lake.', avatar: null, rating: 4.9, totalReviews: 78, user: { name: 'Made Wirawan', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Standing at that hilltop temple as the lake turned gold and the priest blessed us with holy water — I had tears running down my face. Made creates something truly sacred here.', createdAt: new Date('2024-04-02'), user: { name: 'Nina S.', image: null } }],
  },
  'melukat-purification': {
    slug: 'melukat-purification', title: 'Melukat Water Purification Ritual', area: 'Gianyar',
    price: 450000, duration: '2 hours', level: 'All levels', language: 'English', maxGuests: 4,
    rating: 4.9, totalReviews: 102,
    description: 'Melukat is Bali\'s most important purification ritual — a bathing ceremony in sacred water at a water temple, performed to cleanse negative energy, mark life transitions, or simply to reset and restore. Your guide prepares all offerings, explains the ritual meaning, and accompanies you through the complete ceremony in a non-touristy temple setting.',
    highlights: ['Complete melukat ceremony — not a demonstration, a real ritual', 'Sacred spring water from a temple that has been active for over 800 years', 'All offerings prepared by your guide before the ceremony', 'White ceremonial clothing and sarong provided', 'Post-ceremony blessing from the resident priest'],
    includes: ['All ceremonial offerings', 'White melukat clothing and sarong', 'Balinese ceremonial guide', 'Temple entrance donation', 'Post-ceremony traditional breakfast'],
    excludes: ['Transport to temple (Gianyar area)', 'Gratuities'],
    meetingPoint: 'Pura Mengening, Tampaksiring, Gianyar — or alternative spring temple confirmed 24 hours before (meet at 7:00am)',
    images: ['https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Bali Sacred Ceremonies', description: 'Ketut Mudra is a Balinese Hindu priest and cultural guide who has facilitated authentic melukat ceremonies for international guests for 15 years, working only with temples that welcome outsiders respectfully.', avatar: null, rating: 4.9, totalReviews: 102, user: { name: 'Ketut Mudra', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'The melukat was profound. Ketut prepared everything and guided us through every moment. Standing in the sacred spring with water pouring over you and mantras in the air — I sobbed. Beautiful.', createdAt: new Date('2024-05-30'), user: { name: 'Rachel C.', image: null } }],
  },
  'purnama-full-moon-ceremony': {
    slug: 'purnama-full-moon-ceremony', title: 'Purnama Full Moon Ceremony', area: 'Ubud',
    price: 350000, duration: '2 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.9, totalReviews: 88,
    description: 'Purnama — the Balinese full moon — is one of the most auspicious nights in the Hindu calendar, when temples across Bali fill with worshippers, gamelan, and the sweet smoke of incense. Join a genuine village purnama ceremony with an experienced guide, dressed in ceremonial attire, to witness and participate in this living devotional tradition.',
    highlights: ['Join a real village purnama ceremony — not a tourist performance', 'Dress in traditional Balinese ceremonial attire provided', 'Witness temple processions, gamelan music, and fire offerings', 'Guide explains the cosmological significance of the full moon', 'Post-ceremony sharing of traditional ceremonial foods'],
    includes: ['Ceremonial kebaya or udeng with sash and sarong', 'Cultural guide and interpreter', 'Ceremonial offerings to participate', 'Post-ceremony traditional foods'],
    excludes: ['Transport to the ceremony village', 'Photography in certain sacred inner areas (guide will advise)'],
    meetingPoint: 'Provided 24 hours before ceremony — Ubud area village temple (date-dependent)',
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Ubud Ceremony Guides', description: 'Wayan Suandi has facilitated cultural access to Balinese ceremonies for 14 years, carefully building village relationships that allow respectful visitor participation in authentic devotional life.', avatar: null, rating: 4.9, totalReviews: 88, user: { name: 'Wayan Suandi', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'To sit inside a living, breathing purnama ceremony in full swing was extraordinary. The gamelan, the incense, the hundreds of people in ceremonial dress — I felt like a guest in the most sacred sense.', createdAt: new Date('2024-05-23'), user: { name: 'Mark T.', image: null } }],
  },
  'kundalini-yoga-ceremony': {
    slug: 'kundalini-yoga-ceremony', title: 'Kundalini Awakening Ceremony', area: 'Ubud',
    price: 420000, duration: '2.5 hours', level: 'All levels', language: 'English', maxGuests: 8,
    rating: 4.8, totalReviews: 55,
    description: 'A ceremonial Kundalini yoga session combining kriyas (movement sequences), pranayama, mantra chanting, and savasana in an outdoor jungle shala. Teacher Surya Devi leads with Yogi Bhajan lineage techniques adapted for the Balinese setting — opening with a cacao ceremony and closing with a gong bath to integrate the experience.',
    highlights: ['Cacao ceremony opening to prepare the heart for practice', 'Full Kundalini kriya set targeting your energetic nervous system', 'Mantra chanting and pranayama throughout', 'Closing gong bath for integration and deep relaxation', 'Outdoor jungle shala setting in Ubud'],
    includes: ['Cacao ceremony', 'Full 2-hour Kundalini session', 'Gong bath closing', 'Mat, blanket, and props', 'Herbal tea and light refreshments'],
    excludes: ['Transport to the shala', 'Gratuities'],
    meetingPoint: 'Lotus Heart Shala, Jl. Raya Penestanan Kelod, Ubud (GPS: -8.5068, 115.2561)',
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Lotus Heart Kundalini', description: 'Surya Devi trained with KRI-certified Kundalini teachers in India and New Mexico, bringing a ceremonial approach to the practice that draws on both Sikh Dharma and Balinese spiritual tradition.', avatar: null, rating: 4.8, totalReviews: 55, user: { name: 'Surya Devi', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'The cacao + kundalini + gong bath combination is extraordinary. I\'ve been doing yoga for ten years and this was unlike anything I\'ve experienced. Surya is a genuinely gifted teacher.', createdAt: new Date('2024-04-10'), user: { name: 'Grace W.', image: null } }],
  },
  'limpah-holy-spring-ritual': {
    slug: 'limpah-holy-spring-ritual', title: 'Sacred Spring Purification Ritual', area: 'Gianyar',
    price: 380000, duration: '2 hours', level: 'All levels', language: 'English', maxGuests: 4,
    rating: 4.9, totalReviews: 71,
    description: 'Visit a little-known sacred spring temple in the hills above Gianyar to perform a private purification ritual in spring water that has never been treated or altered since it emerged from the earth. Your guide — a local Hindu priest — leads the ceremony in Balinese with translated narration, immersing you in the living devotional practice away from tourist temples.',
    highlights: ['Private ceremony at a non-tourist sacred spring known only to locals', 'Led by a genuine resident Balinese Hindu priest', 'Ancient spring water straight from the source — cool, clear, and sacred', 'Full ceremonial attire and offerings provided', 'Far fewer visitors than Tirta Empul — deeply intimate experience'],
    includes: ['Priest-led ceremony', 'All ceremonial offerings', 'White ceremonial cloth and sarong', 'Post-ceremony jamu and fruit', 'Cultural interpreter'],
    excludes: ['Transport to the spring temple', 'Gratuities (offering to the priest customary — guide will advise)'],
    meetingPoint: 'Provided 24 hours before — Gianyar hills (approximately 20 min from Ubud)',
    images: ['https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Hidden Springs Bali', description: 'Ketut Alit is a Balinese Hindu priest and cultural bridge-builder who shares access to sacred springs and private ceremonies far from the tourist trail — emphasising authentic devotional participation over spectacle.', avatar: null, rating: 4.9, totalReviews: 71, user: { name: 'Ketut Alit', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'No tourists. A real priest. A spring so cold and clear it felt like it came from another world. Ketut\'s ceremony was the most intimate and moving thing I experienced in two weeks in Bali.', createdAt: new Date('2024-03-18'), user: { name: 'Thomas R.', image: null } }],
  },
  'traditional-healer-blessing': {
    slug: 'traditional-healer-blessing', title: 'Traditional Village Healer Blessing', area: 'Bangli',
    price: 500000, duration: '90 min', level: 'All levels', language: 'English', maxGuests: 2,
    rating: 4.8, totalReviews: 43,
    description: 'Receive a traditional blessing from a village healer (pemangku) in the highland village of Bangli — one of Bali\'s most spiritually conservative regions, far from the tourist circuit. The blessing involves prayer, holy water, incense, and the placement of protective symbols, performed in the healer\'s family compound with deep reverence and authenticity.',
    highlights: ['Genuine village healer — not a tourist-facing operation', 'Bangli highlands: spiritually conservative, rarely visited by outsiders', 'Full blessing ceremony with holy water, incense, and protective charms', 'Cultural interpreter bridges communication with respect and sensitivity', 'Opportunity to ask questions about Balinese spiritual life through your guide'],
    includes: ['Cultural interpreter and guide', 'Ceremonial offerings', 'Sarong and sash', 'Transport within Bangli village'],
    excludes: ['Transport to Bangli from Ubud or Seminyak', 'Offering to the healer (guide will advise — typically IDR 100,000–200,000)', 'Gratuities'],
    meetingPoint: 'Bangli regency central parking, Jl. Merdeka, Bangli town — guide will meet you there',
    images: ['https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Bangli Highland Guides', description: 'Wayan Suarsa is a Bangli native and cultural guide who has spent a decade connecting respectful visitors with authentic highland Balinese ceremonies far removed from the southern tourist circuit.', avatar: null, rating: 4.8, totalReviews: 43, user: { name: 'Wayan Suarsa', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'Getting into Bangli\'s interior and receiving a blessing from a genuine village healer felt like a genuine privilege. Wayan\'s cultural sensitivity made everything feel right. Very special.', createdAt: new Date('2024-02-10'), user: { name: 'Peter H.', image: null } }],
  },
  'odalan-temple-festival': {
    slug: 'odalan-temple-festival', title: 'Odalan Temple Festival Experience', area: 'Ubud',
    price: 300000, duration: '3 hours', level: 'All levels', language: 'English', maxGuests: 6,
    rating: 4.9, totalReviews: 92,
    description: 'Odalan is a Balinese temple\'s anniversary festival — occurring every 210 days on the Pawukon calendar — when a community gathers for days of offerings, gamelan, dance, and communal prayer to honour the deity housed in their temple. Your guide takes you to a genuine neighbourhood odalan, dress you in ceremonial attire, and helps you participate respectfully in the festivities.',
    highlights: ['Participate in a real odalan — the most important event in a temple\'s life', 'Dress in full Balinese ceremonial attire to join the community', 'Witness gamelan, legong dance, and priest-led prayer simultaneously', 'Receive ceremonial food blessings shared by the community', 'Guide\'s access ensures respectful participation rather than voyeurism'],
    includes: ['Full Balinese ceremonial attire (kebaya or udeng)', 'Cultural guide and interpreter', 'Ceremonial offerings to present', 'Ceremonial food blessings received', 'Cultural briefing before and integration after'],
    excludes: ['Transport to the odalan location (changes with each festival — Ubud area)', 'Gratuities'],
    meetingPoint: 'Provided 24 hours before the festival date — Ubud neighbourhood temple (date-dependent)',
    images: ['https://images.unsplash.com/photo-1604999333679-b86d54738315?w=800&auto=format&fit=crop&q=85','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80'],
    operator: { businessName: 'Ubud Festival Access', description: 'Gede Artana facilitates genuine odalan participation through 10 years of community relationships in Ubud\'s banjar neighbourhoods, offering an access to Balinese ceremonial life that money alone cannot buy.', avatar: null, rating: 4.9, totalReviews: 92, user: { name: 'Gede Artana', image: null } },
    reviews: [{ id: 'r1', rating: 5, comment: 'The odalan was the most alive, joyful, overwhelming thing I\'ve witnessed anywhere in the world. Gamelan, dancing, hundreds of people in gold and white — and we were welcomed into the middle of it all.', createdAt: new Date('2024-05-27'), user: { name: 'Nadia V.', image: null } }],
  },
  'sup-seminyak': {
    slug: 'sup-seminyak', title: 'Stand-Up Paddleboard at Seminyak', area: 'Seminyak',
    price: 350000, duration: '1.5 hours', level: 'All levels', language: 'English', maxGuests: 6,
    rating: 4.6, totalReviews: 52,
    description: 'Glide across the calm morning waters of Seminyak Beach on a stand-up paddleboard before the day heats up and the crowds arrive. Instructor Wayan guides you from your first wobbly step onto the board through to confident paddling, and on flat days takes advanced paddlers out beyond the break for sunrise views back to shore.',
    highlights: ['Early morning session when Seminyak Beach is at its calmest', 'Full instruction from beginner to confident paddler in one session', 'On flat days: paddle beyond the break for open ocean sunrise views', 'Great for core fitness and balance — no surf experience needed', 'Followed by fresh coconut on the beach'],
    includes: ['SUP board and paddle', 'Life vest and leash', 'Certified instructor Wayan', 'Post-session fresh coconut'],
    excludes: ['Transport to Seminyak Beach', 'Wetsuit', 'Gratuities'],
    meetingPoint: 'Seminyak Beach SUP point, in front of W Hotel, Jl. Kayu Aya, Seminyak (meet at 7:00am)',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&h=300&auto=format&fit=crop&q=80',
    ],
    operator: { businessName: 'Seminyak SUP Co.', description: 'Early morning stand-up paddleboard sessions on Seminyak Beach, run by certified instructors who have been on these waters for over a decade.', avatar: null, rating: 4.6, totalReviews: 52, user: { name: 'Wayan Putra', image: null } },
    reviews: [
      { id: 'r1', rating: 5, comment: 'Perfect way to start the day — calm water, gorgeous light, and Wayan is a brilliant teacher. Went from complete beginner to paddling confidently in forty minutes.', createdAt: new Date('2024-05-07'), user: { name: 'Fiona A.', image: null } },
      { id: 'r2', rating: 4, comment: 'Really enjoyable. The early start is worth it — the beach is beautiful before the crowds. Good instructor, safe equipment.', createdAt: new Date('2024-04-01'), user: { name: 'Marcus P.', image: null } },
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
  if (!experience) {
    const prettyTitle = params.slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    return (
      <>
        <Navbar />
        <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center', backgroundColor: '#F5F1EB' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C8A97E', marginBottom: 12, fontFamily: 'var(--font-inter)' }}>COMING SOON</p>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, color: '#111111', marginBottom: 16, maxWidth: 480 }}>{prettyTitle}</h1>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, color: '#6F675C', maxWidth: 420, lineHeight: 1.7, marginBottom: 32 }}>
            We&apos;re working with a local host to bring this experience online. Check back soon, or explore what&apos;s available now.
          </p>
          <a href="/search" style={{ display: 'inline-flex', alignItems: 'center', height: 46, padding: '0 28px', backgroundColor: '#111111', color: 'white', borderRadius: 8, fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-inter)', textDecoration: 'none' }}>
            Browse all experiences
          </a>
          <a href="/" style={{ display: 'block', marginTop: 16, fontSize: 13, color: '#C8A97E', fontFamily: 'var(--font-inter)', textDecoration: 'underline' }}>
            ← Back to home
          </a>
        </div>
        <MobileNav />
      </>
    )
  }

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

      <Navbar />

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

        {/* Mobile: gallery with thumbnail strip */}
        <ExperienceGallery images={experience.images} title={experience.title} />

        {/* ── TWO-COLUMN LAYOUT ── */}
        <div className="flex flex-col lg:flex-row gap-10">

          {/* LEFT */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <MapPin size={12} style={{ color: '#C8A97E' }} />
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: '#6F675C' }}>{experience.area}</span>
            </div>

            <div className="flex items-start justify-between gap-3 mt-2">
              <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700, color: '#111111' }}>
                {experience.title}
              </h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                <ShareButton slug={experience.slug} title={experience.title} />
                <WishlistHeart slug={experience.slug} size={18} />
              </div>
            </div>

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

            <div className="mt-4">
              <ReadMore text={experience.description} />
            </div>

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
          <div id="booking" className="hidden lg:block lg:w-[340px] flex-shrink-0">
            <BookingWidget price={experience.price} slug={experience.slug} duration={experience.duration} maxGuests={experience.maxGuests} rating={experience.rating} totalReviews={experience.totalReviews} />
          </div>
        </div>
      </div>

      {/* ── AI RECOMMENDATIONS ── */}
      <RecommendationsSection current={currentForRec} others={allOthers} />
      <Footer />

      {/* ── MOBILE BOOKING MODAL ── */}
      <MobileBookingModal
        price={experience.price}
        slug={experience.slug}
        duration={experience.duration}
        maxGuests={experience.maxGuests}
        rating={experience.rating}
        totalReviews={experience.totalReviews}
      />

      <MobileNav />
    </div>
  )
}
