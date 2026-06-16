import { notFound } from 'next/navigation'

// Services feature hidden — delete this file to re-enable all /services routes
export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  notFound()
  return children
}
