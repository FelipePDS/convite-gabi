import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  // Middleware handles the redirect, but this is a server-side safety net
  if (!session) {
    redirect('/admin/login')
  }

  return <>{children}</>
}
