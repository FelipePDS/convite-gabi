// Root admin layout — auth is handled by middleware + (dashboard)/layout.tsx
// The login page lives here too, so we must NOT redirect unauthenticated users
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
