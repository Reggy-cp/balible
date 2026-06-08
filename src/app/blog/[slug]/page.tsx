import { notFound } from 'next/navigation'
import { ArrowLeft, Clock, Calendar } from 'lucide-react'
import Navbar from '@/components/Navbar'
import NewsletterSignup from '@/components/NewsletterSignup'
import MobileNav from '@/components/MobileNav'

type Article = {
  slug: string
  category: string
  title: string
  excerpt: string
  author: string
  authorImage: string
  authorBio: string
  date: string
  readMins: number
  image: string
  content: { type: 'p' | 'h2' | 'h3' | 'blockquote'; text: string }[]
  tags: string[]
}

const ARTICLES: Record<string, Article> = {
  'pottery-ubud-living-tradition': {
    slug: 'pottery-ubud-living-tradition',
    category: 'Craft & Art',
    title: 'The Potters of Ubud: A Living Tradition',
    excerpt: 'Three kilometres south of Ubud\'s market, in a workshop that smells of wet earth and woodsmoke, Made Sari shapes a pot the way her grandmother taught her — slow hands, total presence.',
    author: 'Ayu Dewi Santika',
    authorImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&auto=format&fit=crop&q=80',
    authorBio: 'Ayu is a Ubud-based writer and cultural researcher. She has spent fifteen years documenting Balinese traditional crafts and the communities that sustain them.',
    date: 'Jun 1, 2024',
    readMins: 6,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&auto=format&fit=crop&q=80',
    tags: ['Ubud', 'Pottery', 'Traditional Craft', 'Culture'],
    content: [
      { type: 'p', text: 'Three kilometres south of Ubud\'s central market, down a lane that narrows until motorbikes can\'t pass, is a compound that smells of wet earth and woodsmoke. Made Sari is already at her wheel when we arrive, hands buried in a cone of grey clay, coaxing it upward with the unhurried focus of someone who has done this ten thousand times — because she has.' },
      { type: 'p', text: 'Made is fifty-one years old. Her grandmother taught her to centre clay when she was seven. Her mother refined her technique in her teens. Today, Made teaches visitors from around the world, but the methods she passes on are unchanged: breathe slowly, feel the clay, don\'t force it.' },
      { type: 'h2', text: 'A Craft Older Than Tourism' },
      { type: 'p', text: 'Pottery in Bali predates the Hindu kingdoms. Archaeological evidence places clay vessels in the archipelago as early as 2000 BCE. The village of Pejaten, near Tabanan, has been producing utilitarian earthenware for centuries — water jugs, rice cookers, ceremonial vessels — using the same pinch and coil methods taught today.' },
      { type: 'p', text: 'What makes Ubud\'s pottery tradition distinct is the integration of artistic ambition with functional purpose. Made\'s studio produces both decorative pieces for export and temple offerings used in local ceremonies. The same hands that shape a tourist\'s souvenir bowl will, next week, create a vessel for a cremation ritual.' },
      { type: 'blockquote', text: '"The clay doesn\'t know what it will become when you start. That\'s what I love about it. You begin with nothing and by the end, something exists that didn\'t before. That is a kind of magic." — Made Sari' },
      { type: 'h2', text: 'The Wheel, the Hand, the Kiln' },
      { type: 'p', text: 'Wheel throwing is the skill most visitors come to learn. Made places your hands on the spinning clay and immediately you understand why it takes years to master: the slightest imbalance sends the whole thing wobbling. Her corrections are gentle. She adjusts your elbows, your wrist angle, your breathing. Within twenty minutes, improbably, you have the shape of a bowl.' },
      { type: 'p', text: 'Hand-building — coils, slabs, pinching — is slower and, Made argues, more honest. "The wheel is speed," she says. "Hand-building is memory. Every pinch is recorded in the clay." The vessels made this way carry subtle fingerprints, small undulations that no wheel could replicate.' },
      { type: 'h3', text: 'Firing and Glazing' },
      { type: 'p', text: 'After drying for two to three days, pieces are fired in a wood-burning kiln that Made inherited from her mother. The kiln reaches 1100°C over six hours. The natural ash glaze it produces — unpredictable, unrepeatable — is one of the reasons collectors seek out her work. "Every kiln firing is a surprise," she says. "That\'s also what I love."' },
      { type: 'h2', text: 'Why This Matters' },
      { type: 'p', text: 'Balinese traditional crafts face a pressure familiar everywhere: the economics of mass production make them increasingly difficult to sustain. Machine-made ceramics from Java and China undercut handmade prices. Tourism demand can distort craft into performance — demonstrations of technique rather than real practice.' },
      { type: 'p', text: 'Made\'s studio walks a careful line. She charges fair prices, pays fair wages, and insists that every class produce real work, not a souvenir exercise. Visitors leave with something genuinely made. The distinction matters to her.' },
      { type: 'blockquote', text: '"If they take something they made with their own hands, they will remember Bali differently. Not the traffic, not the crowds — they will remember the feeling of making something. That is what I want to give."' },
      { type: 'p', text: 'We leave in the late morning, the clay smell still on our hands. On the lane back toward Ubud proper, we pass a woman carrying offerings to the family temple — small baskets of flowers and rice, perfectly arranged. The same hands that made those baskets probably once learned to shape clay. In Bali, the crafts are not separate from the culture. They are the culture.' },
    ],
  },
  'sound-healing-science-and-soul': {
    slug: 'sound-healing-science-and-soul',
    category: 'Wellness',
    title: 'Sound Healing: Where Science Meets the Sacred',
    excerpt: 'Singing bowls aren\'t new age nonsense. Neuroscientists are studying how resonant frequencies affect the nervous system.',
    author: 'Lena Kovač',
    authorImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&auto=format&fit=crop&q=80',
    authorBio: 'Lena is a health journalist based between Berlin and Bali. She writes about the intersection of traditional medicine, neuroscience, and modern wellness.',
    date: 'May 18, 2024',
    readMins: 8,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=80',
    tags: ['Wellness', 'Ubud', 'Sound Healing', 'Meditation'],
    content: [
      { type: 'p', text: 'In a bamboo pavilion overlooking a river gorge, I am lying on a mat with my eyes closed while a man named Wayan Nuarta places a bronze singing bowl on my sternum. He strikes it once, lightly, with a padded mallet. The vibration moves through my chest before I hear the sound. By the time the note fades — fifteen, twenty seconds — something in my nervous system has shifted.' },
      { type: 'p', text: 'This is not mysticism, or at least not only mysticism. In the past decade, researchers at institutions including Harvard Medical School, Johns Hopkins, and the Max Planck Institute have published peer-reviewed studies on the physiological effects of what they variously call "sound therapy," "vibroacoustic therapy," and "auditory entrainment." The results suggest that the Balinese healer and the neuroscientist are describing the same phenomenon from different directions.' },
      { type: 'h2', text: 'What the Research Says' },
      { type: 'p', text: 'The central mechanism appears to be brainwave entrainment — the tendency of neural oscillations to synchronise with rhythmic external stimuli. When you hear a sustained tone in the delta or theta frequency range (0.5–8 Hz), your brainwaves tend to match it. Delta and theta states are associated with deep sleep, meditative absorption, and reduced cortisol production.' },
      { type: 'p', text: 'A 2016 study published in the Journal of Evidence-Based Complementary & Alternative Medicine found that a single sound meditation session significantly reduced tension, anger, fatigue, and depressed mood, while increasing feelings of spiritual wellbeing. A 2020 review in the Journal of Music Therapy found consistent evidence for reduced anxiety and improved mood following singing bowl interventions.' },
      { type: 'blockquote', text: '"What we\'re seeing is that certain sound frequencies appear to down-regulate the sympathetic nervous system — the fight-or-flight response — and activate the parasympathetic system. The body shifts from threat-response mode into rest-and-digest. That\'s measurable." — Dr. Sarah Chen, neuroscientist (interviewed via email)' },
      { type: 'h2', text: 'Wayan\'s Understanding' },
      { type: 'p', text: 'Wayan Nuarta has been a balian — a Balinese traditional healer — for twenty-three years. He learned from his father, who learned from his. When I describe the neuroscience research to him, he nods slowly, unsurprised.' },
      { type: 'p', text: '"We say the bowls call the spirit back to the body," he tells me. "When people are anxious or sick or grieving, a part of them has gone away. The vibration reminds them to come home." He is not using the language of Hz and parasympathetic activation, but the description is functionally identical: the sound interrupts the dysregulated state and returns the system to baseline.' },
      { type: 'h3', text: 'The Bowls Themselves' },
      { type: 'p', text: 'Traditional Tibetan singing bowls are made from an alloy of seven metals — gold, silver, copper, iron, tin, lead, and mercury — each corresponding to a celestial body in the Tibetan cosmological system. Wayan\'s bowls come from Nepal and are over a hundred years old. The older the bowl, he says, the deeper the resonance. He owns fourteen.' },
      { type: 'p', text: 'Modern crystal bowls, made from pure quartz, produce cleaner overtones and sustain longer. Wayan uses both, combining them in sessions that move through a sequence of frequencies. The effect is cumulative: by the end of an hour-long session, most people report a state that is neither sleep nor waking but something between the two.' },
      { type: 'h2', text: 'Ubud\'s Unique Context' },
      { type: 'p', text: 'Sound has always been central to Balinese spiritual life. Gamelan orchestras accompany temple ceremonies; the kecak chant creates a sonic architecture that observers describe as overwhelming in the best sense. The gong, the kendang drum, the suling flute — Balinese ritual is inseparable from its sonic dimension.' },
      { type: 'p', text: 'What contemporary sound healing practitioners like Wayan have done is adapt this existing cultural relationship with sound into a format accessible to visitors: a one-on-one or small group session, translated into the wellness language familiar to Western guests, while retaining the ritual intention of the original practice.' },
      { type: 'p', text: 'Lying in that bamboo pavilion with the vibration still humming in my chest, I find I don\'t particularly care whether the mechanism is brainwave entrainment or spirit-calling. The effect is real. Whatever it is, it works.' },
    ],
  },
  'kecak-dance-uluwatu-guide': {
    slug: 'kecak-dance-uluwatu-guide',
    category: 'Culture',
    title: 'How to Watch the Kecak Dance Without the Crowd',
    excerpt: 'The Kecak at Uluwatu is one of the most jaw-dropping performances in Asia. It\'s also one of the most crowded. Here\'s how to experience it properly.',
    author: 'Ni Made Suasti',
    authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
    authorBio: 'Ni Made Suasti grew up in Denpasar and has been writing about Balinese culture and performing arts for fifteen years. She is also a trained gamelan musician.',
    date: 'May 5, 2024',
    readMins: 5,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&auto=format&fit=crop&q=80',
    tags: ['Uluwatu', 'Culture', 'Kecak', 'Performance'],
    content: [
      { type: 'p', text: 'The Kecak fire dance performed at Pura Luhur Uluwatu each evening is one of the most extraordinary performances you will see anywhere. A hundred men sit in concentric circles, their bare torsos lit by a central fire, their voices creating a sound — "cak cak cak cak" — that builds into something hypnotic and overwhelming. Behind them, the Indian Ocean turns gold and then pink as the sun drops below the horizon.' },
      { type: 'p', text: 'You should go. But you should know what you\'re going into, because the logistics can erode the experience if you\'re unprepared.' },
      { type: 'h2', text: 'The Performance Itself' },
      { type: 'p', text: 'The Kecak dramatises an episode from the Ramayana — specifically the abduction of Sita by the demon king Ravana, and her rescue by Prince Rama with the help of the monkey general Hanuman. The performers who create the "cak" chanting are representing the monkey army, Hanuman\'s forces, their voices substituting for the gamelan instruments that accompany most Balinese dance forms.' },
      { type: 'p', text: 'The form was created in the 1930s by a German artist named Walter Spies, working with the Balinese dancer and choreographer Wayan Limbak. It drew on an existing trance-chanting ritual called Sanghyang but restructured it into a narrative performance for outside audiences. Today it is entirely Balinese-owned, performed by local men who rehearse together for years.' },
      { type: 'blockquote', text: '"People think it\'s a tourist show, but the men who perform take it very seriously. Many of them have been doing this for twenty years. The devotion is real." — local guide, Uluwatu' },
      { type: 'h2', text: 'The Crowd Problem — and What to Do About It' },
      { type: 'p', text: 'The performance begins at 6pm. If you arrive at 5:45pm, you will find the viewing area already packed. Tour buses start arriving from 4pm. The prime positions — the outer ring of the stone amphitheatre with unobstructed ocean views — are taken by 5:30pm at the latest.' },
      { type: 'h3', text: 'Arrive Early, See the Temple First' },
      { type: 'p', text: 'The correct approach is to arrive at 4pm. This serves two purposes. First, you can explore Pura Luhur Uluwatu itself — a sixth-century sea temple perched on a seventy-metre cliff — before the performance crowds arrive. The temple monkeys, famous for stealing sunglasses and phones, are at their most active in the afternoon and are genuinely entertaining if you\'re not in a hurry.' },
      { type: 'p', text: 'Second, arriving early means you can secure a position in the stone seating area closest to the stage and with the best sightline to the ocean backdrop. The western and north-western sections have the clearest view of the sunset framing the performance.' },
      { type: 'h3', text: 'What to Bring' },
      { type: 'p', text: 'A sarong is required to enter the temple complex — you\'ll be lent one at the entrance if you don\'t have one, but having your own is cleaner. Bring water, as the performances run ninety minutes with no interval. Keep your phone in a bag or pocket — the monkeys specifically target shiny objects, and a phone snatched mid-performance is not an unusual occurrence.' },
      { type: 'h2', text: 'After the Performance' },
      { type: 'p', text: 'The road back from Uluwatu toward Seminyak is chaotic immediately after the show ends. Everyone leaves at once. If you have dinner reservations at a beach club nearby — Single Fin and Ulu Cliffhouse are both within fifteen minutes — go there directly after the performance and wait for the traffic to clear. You\'ll eat better, pay about the same, and arrive at your next destination an hour later in much better spirits.' },
      { type: 'p', text: 'The Kecak, experienced with some preparation and patience, is not just a cultural performance. It is one of the genuinely great spectacles available to a traveller in this part of the world. Go. Just go prepared.' },
    ],
  },
  'jimbaran-seafood-guide': {
    slug: 'jimbaran-seafood-guide',
    category: 'Food & Drink',
    title: 'Jimbaran After Dark: A Guide to the Beach Warungs',
    excerpt: 'By 6pm, the fishing boats have come in and the grills are lit. Not every warung is equal — we\'ve done the research.',
    author: 'Ayu Dewi Santika',
    authorImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&auto=format&fit=crop&q=80',
    authorBio: 'Ayu is a Ubud-based writer and cultural researcher who has been documenting Balinese food culture for over a decade.',
    date: 'Apr 22, 2024',
    readMins: 7,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop&q=80',
    tags: ['Jimbaran', 'Food & Drink', 'Seafood', 'Beach Dining'],
    content: [
      { type: 'p', text: 'By six in the evening, Jimbaran Bay transforms. The long crescent of sand that spent the day as a sun-bathing strip becomes a dining room — hundreds of low tables arranged on the sand, each with a candle, a plastic stool, and an unobstructed view of the sunset that tends to stop conversation mid-sentence.' },
      { type: 'p', text: 'The warungs that line the beach have been serving grilled seafood here for decades. The format is consistent: you walk to the ice display at the front, choose your fish — usually red snapper, barramundi, lobster, tiger prawns, squid — and negotiate the price by weight. The kitchen grills it over coconut-husk charcoal and brings it to your table with peanut sauce, sambal matah, steamed rice, and kangkung water spinach.' },
      { type: 'h2', text: 'The Best and the Tourist Traps' },
      { type: 'p', text: 'Not every warung deserves your evening. The strip divides roughly into three sections: the northern end near Kedonganan fish market, the central section most visible from the road, and the quieter southern stretch toward Four Seasons. The central section has the highest foot traffic and, correspondingly, the most aggressive touts and the least consistent kitchens.' },
      { type: 'h3', text: 'Warung Ikan Bakar Cianjur' },
      { type: 'p', text: 'The best warung we have visited consistently over three years is Cianjur, at the northern end. The fish is ordered by weight and priced fairly. The sambal matah — a raw shallot, lemongrass, and chilli condiment that is the correct accompaniment to grilled fish in Bali — is made fresh each hour. The staff will not hurry you.' },
      { type: 'h3', text: 'Warung Menega' },
      { type: 'p', text: 'Menega is the most famous of the Jimbaran warungs and for good reason: the seafood quality is reliably high and the location — right on the sand — is excellent. It is also more expensive than its neighbours and fills up by 6:30pm. Book ahead or arrive at 5:45pm.' },
      { type: 'blockquote', text: '"The best fish is always the fish that came in that morning. Ask what\'s freshest and trust the answer — the fishermen are neighbours. They don\'t bring bad fish to Jimbaran." — the owner of Warung Cianjur' },
      { type: 'h2', text: 'Practical Details' },
      { type: 'p', text: 'Negotiate the price of your fish before it goes to the kitchen. The displayed price per kilogram should be the price you pay; if a different number appears on your bill, it is worth querying calmly. Most warungs are completely honest and the confusion is usually a genuine error, not a scam.' },
      { type: 'p', text: 'Arrive between 5:30pm and 6pm for the best table positions and the full sunset experience. The light hits the water perfectly from around 6:20pm. Later arrivals (after 7pm) will find excellent food but miss the spectacle that makes Jimbaran special.' },
      { type: 'h2', text: 'The Fishing Village Behind the Restaurant Strip' },
      { type: 'p', text: 'A ten-minute walk north of the restaurant strip is Kedonganan fish market, where the boats come in each morning between 5am and 7am. The atmosphere is raw and vivid — outrigger canoes beaching in the shallows, the catch sorted by species and size on bamboo mats, vendors from restaurants and private households choosing their fish for the day.' },
      { type: 'p', text: 'The market is not a tourist attraction; it is a working fish market. But it is open to anyone who arrives at the right time, and watching the morning activity that will become your evening dinner gives the Jimbaran experience a coherence that is rare in Bali\'s more curated visitor economy. Come back in the morning if you can. It\'s worth the early alarm.' },
    ],
  },
  'sidemen-valley-east-bali': {
    slug: 'sidemen-valley-east-bali',
    category: 'Travel',
    title: 'Sidemen: The Valley Most Visitors Never Find',
    excerpt: 'While Seminyak fills with pool parties and Ubud with yoga retreats, Sidemen sits quietly in the shadow of Mount Agung — emerald terraces, women weaving ikat, no one trying to sell you anything.',
    author: 'James Whitfield',
    authorImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&auto=format&fit=crop&q=80',
    authorBio: 'James is a travel writer who has lived in Southeast Asia for twelve years. He has been visiting Sidemen since 2011 and considers it one of the finest valleys in Asia.',
    date: 'Apr 8, 2024',
    readMins: 9,
    image: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=1200&auto=format&fit=crop&q=80',
    tags: ['East Bali', 'Sidemen', 'Travel', 'Ikat Weaving'],
    content: [
      { type: 'p', text: 'The road into Sidemen valley is a single-lane affair that climbs through rubber trees and then opens suddenly onto one of the most beautiful agricultural landscapes in Asia. The valley floor is a patchwork of rice terraces in graduated shades of green — lime, emerald, sage — cut by a brown river that flashes between the paddies. Above it all, when the clouds allow, Mount Agung rises to 3031 metres, its perfect volcanic cone dominating the horizon.' },
      { type: 'p', text: 'This valley is an hour\'s drive from Ubud. In that hour, you have left behind the traffic, the yoga studios, the Instagram cafes, and the organised tourism that defines the Ubud experience. Sidemen has none of those things, which is precisely why it is extraordinary.' },
      { type: 'h2', text: 'The Ikat Weavers' },
      { type: 'p', text: 'Sidemen is known throughout Bali for its geringsing — a double ikat textile so labour-intensive to produce that a single cloth can take five years to complete. The dyeing, the pattern-tying, and the weaving are all performed by hand using techniques passed between women in the same families for generations.' },
      { type: 'p', text: 'In the village of Desa Sidemen, wooden houses with open-sided workshops line the main road. Women sit at backstrap looms in the mornings, the rhythmic clack of the shuttle audible from the lane. They will generally allow you to watch, and some will demonstrate the double ikat technique if you approach with appropriate curiosity and patience.' },
      { type: 'blockquote', text: '"A geringsing takes between three and five years because each thread must be dyed twice — once as warp, once as weft — before the cloth exists. When you finally see the pattern emerge in the weaving, it is a revelation." — Ni Wayan Satri, master weaver' },
      { type: 'h3', text: 'Buying Directly' },
      { type: 'p', text: 'If you buy ikat in Ubud or Seminyak, you are almost certainly buying a machine-made reproduction or a simplified version of the genuine article. In Sidemen, you can buy directly from the women who made the cloth. Prices are higher than the market reproductions, because the work is real. A genuine geringsing costs between IDR 2,000,000 and IDR 15,000,000 depending on complexity and scale. It is worth every rupiah.' },
      { type: 'h2', text: 'The Landscape' },
      { type: 'p', text: 'The rice terraces of Sidemen are not as famous as Tegalalang near Ubud, which means they are also not lined with viewing platforms, selfie stands, and entrance fees. You can walk directly into the paddies, following the narrow dikes between the flooded fields, and encounter only the sound of water, frogs, and wind.' },
      { type: 'p', text: 'The best walk is the Campuhan-equivalent ridge walk that begins behind Desa Sidemen and climbs for about forty minutes to a viewpoint overlooking the entire valley. Do it at sunrise, when Agung is clear and the mist hangs in the valley floor. Bring a guide from your accommodation — the paths fork constantly and getting lost here is easy.' },
      { type: 'h2', text: 'Getting Here and Staying' },
      { type: 'p', text: 'Sidemen is served by neither Grab nor Gojek reliably. The correct approach is to hire a driver for the day from Ubud — expect to pay IDR 400,000–550,000 for a full-day hire — or rent a scooter if you are comfortable on one. The road climbs steadily and has some sharp turns. In the rainy season, sections can be slick.' },
      { type: 'p', text: 'Several excellent small guesthouses and one exceptional boutique hotel — Samanvaya, at the northern end of the valley — offer accommodation. Staying one or two nights changes the experience entirely. The morning mist, the early light on the paddies, the evening sound of the river — these require time, not a day trip.' },
      { type: 'p', text: 'Most visitors to Bali will spend their entire trip within a ten-kilometre radius of Seminyak or Ubud. That is understandable. But Sidemen exists, and it is hour away, and it is the Bali that the photographs on Instagram are actually trying to capture. Go before everyone else does.' },
    ],
  },
  'silver-celuk-village': {
    slug: 'silver-celuk-village',
    category: 'Craft & Art',
    title: 'Celuk\'s Silver Villages: A Craft Under Pressure',
    excerpt: 'For generations, Celuk has been Bali\'s silver capital. But mass tourism and cheap imports are changing the craft. We visited three workshops to find out what\'s at stake.',
    author: 'Ni Made Suasti',
    authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
    authorBio: 'Ni Made Suasti grew up in Denpasar and has been writing about Balinese culture, craft, and performing arts for fifteen years.',
    date: 'Mar 27, 2024',
    readMins: 11,
    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=1200&auto=format&fit=crop&q=80',
    tags: ['Canggu', 'Silver', 'Craft & Art', 'Cultural Heritage'],
    content: [
      { type: 'p', text: 'The village of Celuk sits on the road between Denpasar and Ubud, about eight kilometres south of the art market. It is, by tradition, Bali\'s silversmithing capital — a village where the craft has been passed father to son, mother to daughter, for at least three centuries. Every house on the main road is also a workshop and a shop. The sound of hammers on silver is continuous.' },
      { type: 'p', text: 'But something is changing. Pull off the main road and walk the back lanes of Celuk and you find a different story: workshop shutters closed in the morning, young men on motorbikes heading toward Denpasar for office jobs, grandmothers sitting alone at work benches where three generations used to work together.' },
      { type: 'h2', text: 'Three Workshops, Three Realities' },
      { type: 'h3', text: 'Workshop One: The Tourist Shop' },
      { type: 'p', text: 'The first workshop we visit is on the main road. It has a large car park for tour buses, glass display cases, air conditioning, and prices in US dollars. A young man in a batik shirt demonstrates silversmithing at a workbench positioned for visibility. The technique is competent. The pieces on display are technically correct.' },
      { type: 'p', text: 'But the margins are set for tour group buying: the prices are triple what you\'d pay at a craft market, and the relationship between what\'s demonstrated and what\'s for sale is theatrical rather than direct. The silver in the shop did not all come from this workshop. The experience is clean and comfortable and tells you almost nothing about the actual craft.' },
      { type: 'h3', text: 'Workshop Two: The Working Family' },
      { type: 'p', text: 'Down a lane fifty metres from the main road, we find Ketut Suardana\'s workshop. Ketut is forty-seven, a third-generation silversmith. His father and grandfather worked at this same bench. Today he works with his wife and one of his three sons; the other two have taken jobs in Denpasar. The workshop produces custom pieces for a handful of loyal buyers in Ubud and direct export to a gallery in Amsterdam.' },
      { type: 'p', text: 'The quality of Ketut\'s work is immediately different. His repoussé work — hammering silver from the inside to create relief patterns — achieves a delicacy that requires years to develop. He shows us a commission he is completing: a set of offering bowls for a temple in East Bali, each one different, each one signed on the base with his family\'s mark.' },
      { type: 'blockquote', text: '"The cheap imports from China look like silver. They feel like silver. But they have no life in them because no one put life into them. A piece made by hand carries something — the energy of the person who made it. That\'s what I\'m trying to preserve." — Ketut Suardana' },
      { type: 'h3', text: 'Workshop Three: The Innovator' },
      { type: 'p', text: 'The third workshop belongs to Kadek, thirty-two, who trained under his uncle before spending two years in a jewellery design programme in Jakarta. Kadek\'s pieces are unmistakably contemporary — geometric forms, mixed metal oxidation, collaborations with a textile artist in Ubud — while the fabrication techniques are entirely traditional: hand-sawing, hand-filing, traditional granulation.' },
      { type: 'p', text: 'He sells primarily through Instagram and a small stockist in Singapore. His prices are high by Balinese standards. He is fully booked six months ahead. "I\'m not trying to preserve the craft exactly as it was," he says. "I\'m trying to make sure it survives. Sometimes that means changing it."' },
      { type: 'h2', text: 'The Pressure Points' },
      { type: 'p', text: 'The threats to Celuk\'s silversmithing tradition are not difficult to identify. First: mass-produced silver jewellery from Java and China that is visually similar to handmade pieces but costs a fraction of the price. Second: a tourism industry that rewards spectacle over quality, meaning workshops that perform silversmithing for tour groups earn more than workshops that make exceptional things quietly. Third: young people who can see, rationally, that a smartphone retail job in Denpasar offers more predictable income and better social status than years of apprenticeship.' },
      { type: 'p', text: 'Against these pressures, the craft persists — not because of sentiment but because genuinely skilled Balinese silversmithing is irreplaceable. The world does not have an unlimited supply of people who can do what Ketut does. When that knowledge is gone, it is gone.' },
      { type: 'p', text: 'The best thing a visitor can do is buy real things from real craftspeople at real prices. Skip the main road shops. Walk the back lanes. Look for the workshops where someone is actually working. Ask who made what you\'re buying. That question, asked seriously, changes everything about the transaction.' },
    ],
  },
}

const ALL_ARTICLES = [
  { slug: 'pottery-ubud-living-tradition', category: 'Craft & Art', title: 'The Potters of Ubud: A Living Tradition', image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&auto=format&fit=crop&q=80', readMins: 6 },
  { slug: 'sound-healing-science-and-soul', category: 'Wellness', title: 'Sound Healing: Where Science Meets the Sacred', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop&q=80', readMins: 8 },
  { slug: 'kecak-dance-uluwatu-guide', category: 'Culture', title: 'How to Watch the Kecak Dance Without the Crowd', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&auto=format&fit=crop&q=80', readMins: 5 },
  { slug: 'jimbaran-seafood-guide', category: 'Food & Drink', title: 'Jimbaran After Dark: A Guide to the Beach Warungs', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&auto=format&fit=crop&q=80', readMins: 7 },
  { slug: 'sidemen-valley-east-bali', category: 'Travel', title: 'Sidemen: The Valley Most Visitors Never Find', image: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=400&auto=format&fit=crop&q=80', readMins: 9 },
  { slug: 'silver-celuk-village', category: 'Craft & Art', title: 'Celuk\'s Silver Villages: A Craft Under Pressure', image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&auto=format&fit=crop&q=80', readMins: 11 },
]

export function generateStaticParams() {
  return Object.keys(ARTICLES).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = ARTICLES[slug]
  if (!article) return {}
  return { title: `${article.title} — Balible Journal`, description: article.excerpt }
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = ARTICLES[slug]
  if (!article) notFound()

  const related = ALL_ARTICLES.filter(a => a.slug !== slug).slice(0, 3)

  return (
    <div style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F5F1EB', minHeight: '100vh' }}>
      <Navbar />

      {/* HERO IMAGE */}
      <div className="relative w-full" style={{ height: 'clamp(300px, 45vw, 520px)' }}>
        <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.5) 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 max-w-[800px] mx-auto">
          <span className="inline-block px-3 py-1 rounded-full mb-4" style={{ backgroundColor: '#C8A97E', color: 'white', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {article.category}
          </span>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(26px, 4vw, 46px)', fontWeight: 700, color: 'white', lineHeight: 1.15, textShadow: '0 2px 16px rgba(0,0,0,0.25)' }}>
            {article.title}
          </h1>
        </div>
      </div>

      {/* ARTICLE BODY */}
      <div className="max-w-[800px] mx-auto px-6 py-12">

        {/* Back link */}
        <a href="/blog" className="inline-flex items-center gap-2 mb-8 hover:opacity-70 transition-opacity" style={{ textDecoration: 'none', color: '#6F675C', fontSize: 13 }}>
          <ArrowLeft size={14} /> Back to Journal
        </a>

        {/* Meta row */}
        <div className="flex items-center gap-4 mb-10 pb-8" style={{ borderBottom: '1px solid #E8E4DE' }}>
          <img src={article.authorImage} alt={article.author} className="w-12 h-12 rounded-full object-cover" />
          <div>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 600, color: '#111111' }}>{article.author}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <div className="flex items-center gap-1.5">
                <Calendar size={11} style={{ color: '#6F675C' }} />
                <span style={{ fontSize: 12, color: '#6F675C' }}>{article.date}</span>
              </div>
              <span style={{ color: '#E8E4DE' }}>·</span>
              <div className="flex items-center gap-1.5">
                <Clock size={11} style={{ color: '#6F675C' }} />
                <span style={{ fontSize: 12, color: '#6F675C' }}>{article.readMins} min read</span>
              </div>
            </div>
          </div>
        </div>

        {/* Excerpt / lead */}
        <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(17px, 2vw, 20px)', color: '#111111', lineHeight: 1.7, marginBottom: 32, fontStyle: 'italic' }}>
          {article.excerpt}
        </p>

        {/* Content blocks */}
        <div style={{ lineHeight: 1.85 }}>
          {article.content.map((block, i) => {
            if (block.type === 'h2') return (
              <h2 key={i} style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 700, color: '#111111', marginTop: 40, marginBottom: 16 }}>
                {block.text}
              </h2>
            )
            if (block.type === 'h3') return (
              <h3 key={i} style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(17px, 2vw, 20px)', fontWeight: 700, color: '#111111', marginTop: 28, marginBottom: 12 }}>
                {block.text}
              </h3>
            )
            if (block.type === 'blockquote') return (
              <blockquote key={i} style={{ margin: '32px 0', paddingLeft: 20, borderLeft: '3px solid #C8A97E', fontFamily: 'var(--font-playfair)', fontSize: 'clamp(15px, 1.8vw, 18px)', color: '#6F675C', fontStyle: 'italic', lineHeight: 1.75 }}>
                {block.text}
              </blockquote>
            )
            return (
              <p key={i} style={{ fontFamily: 'var(--font-inter)', fontSize: 'clamp(15px, 1.6vw, 17px)', color: '#3A3530', lineHeight: 1.85, marginBottom: 20 }}>
                {block.text}
              </p>
            )
          })}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-12 pt-8" style={{ borderTop: '1px solid #E8E4DE' }}>
          {article.tags.map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full" style={{ backgroundColor: '#E8E4DE', color: '#6F675C', fontSize: 12, fontWeight: 500 }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Author bio card */}
        <div className="mt-10 p-6 rounded-2xl flex gap-5 items-start" style={{ backgroundColor: 'white', border: '1px solid #E8E4DE' }}>
          <img src={article.authorImage} alt={article.author} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
          <div>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 700, color: '#C8A97E', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>About the author</p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 15, fontWeight: 600, color: '#111111', marginBottom: 6 }}>{article.author}</p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: '#6F675C', lineHeight: 1.7 }}>{article.authorBio}</p>
          </div>
        </div>
      </div>

      {/* NEWSLETTER STRIP */}
      <div className="max-w-[800px] mx-auto px-6 pb-4">
        <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: '#111111' }}>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, letterSpacing: '0.2em', color: '#C8A97E', textTransform: 'uppercase', marginBottom: 8 }}>New stories, every fortnight</p>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 700, color: 'white', marginBottom: 6 }}>Enjoy this story?</h2>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 20 }}>
            Get one good story about Bali every two weeks, written by people who live here.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <NewsletterSignup dark />
          </div>
        </div>
      </div>

      {/* RELATED ARTICLES */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16">
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(22px, 2.5vw, 28px)', fontWeight: 700, color: '#111111', marginBottom: 24 }}>More from the Journal</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {related.map(a => (
            <a key={a.slug} href={`/blog/${a.slug}`} className="bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow" style={{ border: '1px solid #E8E4DE', textDecoration: 'none' }}>
              <div style={{ height: 180, overflow: 'hidden' }}>
                <img src={a.image} alt={a.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4">
                <span className="inline-block px-2.5 py-0.5 rounded-full mb-2" style={{ backgroundColor: '#F5F1EB', color: '#C8A97E', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {a.category}
                </span>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, fontWeight: 700, color: '#111111', lineHeight: 1.3, marginBottom: 8 }}>{a.title}</h3>
                <div className="flex items-center gap-1.5">
                  <Clock size={10} style={{ color: '#6F675C' }} />
                  <span style={{ fontSize: 11, color: '#6F675C' }}>{a.readMins} min read</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#111111', padding: '40px 24px 28px' }}>
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <a href="/" style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, fontWeight: 700, color: 'white', textDecoration: 'none' }}>BALIBLE</a>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>© 2024 Balible. All rights reserved.</p>
          <div className="flex gap-6">
            {[{ label: 'Journal', href: '/blog' }, { label: 'Experiences', href: '/search' }, { label: 'Destinations', href: '/destinations' }].map(({ label, href }) => (
              <a key={label} href={href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }} className="hover:text-white transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </footer>
      <MobileNav />
    </div>
  )
}
