import { notFound } from 'next/navigation'

// Services feature hidden — delete this file to re-enable the provider dashboard
export default function ProviderDashboardLayout({ children }: { children: React.ReactNode }) {
  notFound()
  return children
}
