import { LoginForm } from '@/components/admin/LoginForm'

export const metadata = {
  title: 'Login — Admin',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-950 to-neutral-900 p-4">
      <LoginForm />
    </main>
  )
}
