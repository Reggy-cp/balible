import crypto from 'crypto'

// Server-side Midtrans Snap helpers. Sandbox vs production is controlled by
// MIDTRANS_IS_PRODUCTION; the server key must match the chosen environment.
const IS_PROD = process.env.MIDTRANS_IS_PRODUCTION === 'true'
const SNAP_BASE = IS_PROD ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com'

function authHeader() {
  const key = process.env.MIDTRANS_SERVER_KEY
  if (!key) throw new Error('MIDTRANS_SERVER_KEY is not set')
  return `Basic ${Buffer.from(`${key}:`).toString('base64')}`
}

export type SnapTransactionInput = {
  orderId: string
  grossAmount: number
  customerName: string
  customerEmail: string
  customerPhone?: string
  itemName: string
}

export async function createSnapTransaction(input: SnapTransactionInput): Promise<{ token: string } | { error: string }> {
  try {
    const res = await fetch(`${SNAP_BASE}/snap/v1/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader() },
      body: JSON.stringify({
        transaction_details: { order_id: input.orderId, gross_amount: input.grossAmount },
        item_details: [{ id: input.orderId, name: input.itemName.slice(0, 50), price: input.grossAmount, quantity: 1 }],
        customer_details: {
          first_name: input.customerName.slice(0, 50),
          email: input.customerEmail || undefined,
          phone: input.customerPhone || undefined,
        },
      }),
    })
    const data = await res.json()
    if (!res.ok || !data.token) {
      console.error('[midtrans] snap transaction failed:', data)
      return { error: 'Could not start payment. Please try again.' }
    }
    return { token: data.token }
  } catch (err) {
    console.error('[midtrans] snap request error:', err)
    return { error: 'Could not start payment. Please try again.' }
  }
}

// Midtrans signs notifications as sha512(order_id + status_code + gross_amount + server_key)
export function verifyNotificationSignature(payload: {
  order_id: string
  status_code: string
  gross_amount: string
  signature_key: string
}): boolean {
  const key = process.env.MIDTRANS_SERVER_KEY
  if (!key) return false
  const expected = crypto
    .createHash('sha512')
    .update(payload.order_id + payload.status_code + payload.gross_amount + key)
    .digest('hex')
  return expected === payload.signature_key
}
