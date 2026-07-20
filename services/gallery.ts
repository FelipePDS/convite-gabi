import prisma from '@/lib/db'

export type GalleryItemData = {
  id: string
  type: 'IMAGE' | 'VIDEO'
  url: string
  caption: string | null
  order: number
}

export async function getGalleryItems(): Promise<GalleryItemData[]> {
  try {
    const items = await prisma.galleryItem.findMany({
      orderBy: { order: 'asc' },
      select: { id: true, type: true, url: true, caption: true, order: true },
    })

    return items.map((item) => ({
      id: item.id,
      type: item.type as 'IMAGE' | 'VIDEO',
      url: item.url,
      caption: item.caption ?? null,
      order: item.order,
    }))
  } catch {
    return []
  }
}
