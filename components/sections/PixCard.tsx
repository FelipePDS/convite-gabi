'use client'

import { useState } from 'react'
import Image from 'next/image'
import QRCode from 'react-qr-code'
import toast from 'react-hot-toast'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PixCardProps {
  pixKey: string
  qrCodeUrl: string | null
}

export function PixCard({ pixKey, qrCodeUrl }: PixCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixKey)
      setCopied(true)
      toast.success('Chave PIX copiada!', { icon: '✓' })
      setTimeout(() => setCopied(false), 2_500)
    } catch {
      // Fallback for browsers that block clipboard without HTTPS
      toast.error('Não foi possível copiar automaticamente. Copie a chave manualmente.')
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:gap-12">
      {/* QR Code */}
      <div className="shrink-0">
        <div className="overflow-hidden rounded-2xl bg-white p-4 shadow-xl ring-1 ring-white/10">
          {qrCodeUrl ? (
            <Image
              src={qrCodeUrl}
              alt="QR Code PIX"
              width={180}
              height={180}
              className="block"
            />
          ) : (
            <QRCode
              value={pixKey}
              size={180}
              bgColor="#ffffff"
              fgColor="#1a1a1a"
              level="M"
            />
          )}
        </div>
        <p className="mt-3 text-center text-xs text-white/50">Aponte a câmera para o QR Code</p>
      </div>

      {/* Key + copy */}
      <div className="flex flex-col gap-4 text-white">
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-widest text-white/50">
            Chave PIX
          </p>
          <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/8 px-4 py-3">
            <code className="break-all font-mono text-sm font-medium text-white sm:text-base">
              {pixKey}
            </code>
          </div>
        </div>

        <Button
          onClick={handleCopy}
          size="lg"
          className={cn(
            'w-full gap-2 transition-all sm:w-auto',
            copied && 'bg-green-600 hover:bg-green-600'
          )}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copiar chave PIX
            </>
          )}
        </Button>

        <p className="max-w-xs text-sm text-white/50">
          Abra o app do seu banco, selecione PIX e cole a chave para fazer sua contribuição.
        </p>
      </div>
    </div>
  )
}
