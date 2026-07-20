'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Plus, Trash2, ImageIcon, PlayCircle, Loader2, Upload } from 'lucide-react'
import { CldUploadWidget } from 'next-cloudinary'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { extractYouTubeId, youtubeThumbnail } from '@/lib/youtube'

type GalleryItem = { id: string; type: 'IMAGE' | 'VIDEO'; url: string; caption: string | null; order: number }

const youtubeSchema = z.object({
  url: z.string().min(1, 'URL obrigatória'),
  caption: z.string().max(200).optional(),
})

interface GalleryManagerProps {
  initialItems: GalleryItem[]
  uploadPreset: string
}

export function GalleryManager({ initialItems, uploadPreset }: GalleryManagerProps) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems)
  const [youtubeOpen, setYoutubeOpen] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.infer<typeof youtubeSchema>>({
    resolver: zodResolver(youtubeSchema),
  })

  const handleImageUpload = async (result: { info?: unknown }) => {
    const info = result.info as { secure_url?: string } | undefined
    const url = info?.secure_url
    if (!url) return
    const res = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'IMAGE', url }),
    })
    const json = await res.json()
    if (!res.ok) { toast.error(json.error ?? 'Erro ao salvar imagem'); return }
    setItems((prev) => [...prev, json])
    toast.success('Imagem adicionada!')
  }

  const onYoutubeSubmit = async (data: z.infer<typeof youtubeSchema>) => {
    const videoId = extractYouTubeId(data.url)
    if (!videoId) { toast.error('URL do YouTube inválida'); return }
    const res = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'VIDEO', url: data.url, caption: data.caption }),
    })
    const json = await res.json()
    if (!res.ok) { toast.error(json.error ?? 'Erro ao salvar'); return }
    setItems((prev) => [...prev, json])
    toast.success('Vídeo adicionado!')
    setYoutubeOpen(false)
    reset()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este item?')) return
    setDeleting(id)
    const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
    setDeleting(null)
    if (!res.ok) { toast.error('Erro ao excluir'); return }
    setItems((prev) => prev.filter((i) => i.id !== id))
    toast.success('Item excluído!')
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <CldUploadWidget
          uploadPreset={uploadPreset}
          onSuccess={handleImageUpload}
          options={{ resourceType: 'image', maxFiles: 10 }}
        >
          {({ open }) => (
            <Button size="sm" className="gap-1.5" onClick={() => open()}>
              <Upload className="h-4 w-4" /> Upload imagem
            </Button>
          )}
        </CldUploadWidget>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setYoutubeOpen(true)}>
          <PlayCircle className="h-4 w-4" /> Adicionar vídeo
        </Button>
        <span className="text-muted-foreground ml-auto text-sm">{items.length} item(ns)</span>
      </div>

      {items.length === 0 ? (
        <div className="text-muted-foreground mt-8 flex flex-col items-center gap-2 py-12 text-center">
          <ImageIcon className="h-10 w-10 opacity-30" />
          <p className="text-sm">Nenhum item na galeria.</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item) => {
            const videoId = item.type === 'VIDEO' ? extractYouTubeId(item.url) : null
            const thumb = videoId ? youtubeThumbnail(videoId) : item.url
            return (
              <div key={item.id} className="group relative overflow-hidden rounded-xl border">
                <Image
                  src={thumb}
                  alt={item.caption ?? 'Gallery item'}
                  width={200}
                  height={150}
                  className="aspect-video w-full object-cover"
                />
                {item.type === 'VIDEO' && (
                  <div className="bg-black/40 absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="h-6 w-6 text-white" />
                  </div>
                )}
                <button
                  className="bg-destructive absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-md text-white opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                  aria-label="Excluir"
                >
                  {deleting === item.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* YouTube dialog */}
      <Dialog open={youtubeOpen} onOpenChange={setYoutubeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar vídeo do YouTube</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onYoutubeSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>URL do YouTube *</Label>
              <Input placeholder="https://youtube.com/watch?v=…" {...register('url')} />
              {errors.url && <p className="text-destructive text-xs">{errors.url.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Legenda (opcional)</Label>
              <Input placeholder="Descrição do vídeo" {...register('caption')} />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setYoutubeOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Adicionar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
