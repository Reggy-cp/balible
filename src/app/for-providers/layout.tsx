import { notFound } from 'next/navigation'

// Services feature hidden — delete this file to re-enable /for-providers
export default function ForProvidersLayout({ children }: { children: React.ReactNode }) {
  notFound()
  return children
}
