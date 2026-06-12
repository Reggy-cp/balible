// Single source of truth for the platform service fee. The Terms page and
// How It Works copy promise 10% — keep them in sync if this changes.
export const SERVICE_FEE_RATE = 0.1

export function computeBookingTotal(unitPrice: number, units: number): number {
  const subtotal = Math.round(unitPrice * units)
  return subtotal + Math.round(subtotal * SERVICE_FEE_RATE)
}
