// Fallback rate used when no value has been saved in admin settings.
export const SERVICE_FEE_RATE = 0.1

export function computeBookingTotal(unitPrice: number, units: number, rate = SERVICE_FEE_RATE): number {
  const subtotal = Math.round(unitPrice * units)
  return subtotal + Math.round(subtotal * rate)
}
