import prisma from '@/lib/db'
import { GalleryManager } from '@/components/admin/GalleryManager'

async function getItems() {
  try {
    const items = await prisma.galleryItem.findMany({ orderBy: { order: 'asc' } })
    return items.map((i) => ({ ...i, type: i.type as 'IMAGE' | 'VIDEO', caption: i.caption ?? null }))
  } catch {
    return []
  }
}

export default async function AdminGalleryPage() {
  const items = await getItems()
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'ml_default'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Galeria</h1>
        <p className="text-muted-foreground mt-1 text-sm">Gerencie imagens e vídeos</p>
      </div>
      <GalleryManager
        initialItems={items}
        uploadPreset={uploadPreset}
      />
    </div>
  )
}
