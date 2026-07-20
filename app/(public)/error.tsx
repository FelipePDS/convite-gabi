'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="bg-destructive/10 text-destructive flex h-14 w-14 items-center justify-center rounded-full">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <div className="space-y-2">
        <h2 className="font-heading text-xl font-bold">Algo deu errado</h2>
        <p className="text-muted-foreground max-w-sm text-sm">
          Ocorreu um erro ao carregar esta página. Tente novamente.
        </p>
      </div>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  )
}
