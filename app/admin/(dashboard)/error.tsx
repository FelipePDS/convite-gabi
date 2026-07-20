'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminError({
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
    <div className="flex h-full flex-col items-center justify-center gap-6 py-20 text-center">
      <div className="bg-destructive/10 text-destructive flex h-14 w-14 items-center justify-center rounded-full">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <div className="space-y-1">
        <h2 className="font-heading text-lg font-bold">Erro ao carregar</h2>
        <p className="text-muted-foreground max-w-xs text-sm">
          {error.message || 'Ocorreu um erro inesperado.'}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={reset} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Tentar novamente
      </Button>
    </div>
  )
}
