import { put } from '@vercel/blob'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import Anthropic from '@anthropic-ai/sdk'

const MAX_PX    = 1920
const QUALITY   = 82
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

async function generateAlt(imageBuffer: Buffer, hint: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return hint
  try {
    const client = new Anthropic({ apiKey: key })
    const b64 = imageBuffer.toString('base64')
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 60,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/webp', data: b64 } },
          { type: 'text', text: `Write a concise image alt text (max 12 words) for this photo. Context: ${hint}. Reply with only the alt text, no quotes.` },
        ],
      }],
    })
    return (msg.content[0] as { text: string }).text.trim()
  } catch {
    return hint
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const hint = (formData.get('hint') as string | null) ?? 'Bali experience photo'
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'File too large. Maximum size is 10 MB.' }, { status: 413 })

  const raw = Buffer.from(await file.arrayBuffer())

  const webp = await sharp(raw)
    .rotate()                          // auto-orient from EXIF
    .resize({ width: MAX_PX, height: MAX_PX, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer()

  const filename = `experiences/${session.user.id}/${Date.now()}.webp`
  const blob = await put(filename, webp, { access: 'public', contentType: 'image/webp' })

  const alt = await generateAlt(webp, hint)

  return NextResponse.json({ url: blob.url, alt })
}
