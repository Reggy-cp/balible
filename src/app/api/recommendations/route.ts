import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // Throttle by IP — this endpoint spends Anthropic credits.
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const { allowed } = await checkRateLimit(`recommendations:${ip}`, 30, 60_000)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
    }

    const { current, others } = await req.json()
    if (!current || !Array.isArray(others)) {
      return NextResponse.json({ recommendations: [] }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { recommendations: others.slice(0, 3).map((e: { slug: string }) => e.slug) },
        { status: 200 }
      )
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: 'You are the Balible recommendation engine. Return ONLY valid JSON with no markdown, no explanation, no code blocks.',
        messages: [
          {
            role: 'user',
            content: `A user is viewing this experience: ${JSON.stringify({
              slug: current.slug,
              title: current.title,
              category: current.category,
              area: current.area,
              price: current.price,
            })}.

Other available experiences: ${JSON.stringify(
              others.map((e: { slug: string; title: string; category: string; area: string; price: number; rating: number }) => ({
                slug: e.slug,
                title: e.title,
                category: e.category,
                area: e.area,
                price: e.price,
                rating: e.rating,
              }))
            )}.

Pick the 3 most relevant experiences to recommend based on category similarity, area, price range, and likely user interest. Return exactly: {"recommendations":["slug1","slug2","slug3"]}`,
          },
        ],
      }),
    })

    if (!res.ok) {
      throw new Error(`Anthropic API error: ${res.status}`)
    }

    const data = await res.json()
    const text: string = data.content[0].text.trim()

    // Strip any accidental markdown fences
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Recommendations API error:', err)
    return NextResponse.json({ recommendations: [] }, { status: 200 })
  }
}
