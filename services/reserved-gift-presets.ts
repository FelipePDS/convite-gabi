import type { GiftData } from './gifts'

export type ReservedGiftPreset = {
  name: string
  description: string
  imageUrl: string | null
  purchaseUrl: string | null
  price: number
  status: 'RESERVED'
  reservedByName: string
  reservedByPhone: string
  reservedAt: string
}

export const reservedGiftPresets: ReservedGiftPreset[] = [
  {
    name: 'Kit de maquiagem com lip oil e blush cremoso',
    description:
      'Combo delicado para uma make glow no dia a dia, com visual leve e acabamento natural.',
    imageUrl:
      'https://oceane.vtexassets.com/arquivos/ids/211793-150-150?aspect=true&height=150&v=638738343499300000&width=150',
    purchaseUrl: null,
    price: 129.9,
    status: 'RESERVED',
    reservedByName: 'Ana Luiza Martins',
    reservedByPhone: '(11) 97777-4520',
    reservedAt: '2026-07-29T15:10:00.000Z',
  },
  {
    name: 'Shoulder bag off-white',
    description:
      'Bolsa compacta e estilosa para completar produções modernas sem perder a praticidade.',
    imageUrl:
      'https://static.dafiti.com.br/p/Santa-Lolla-Bolsa-Tiracolo-Santa-Lolla-M%C3%A9dia-Off-White-8061-99057241-1-zoom.jpg',
    purchaseUrl: null,
    price: 159.9,
    status: 'RESERVED',
    reservedByName: 'Julia Fernandes',
    reservedByPhone: '(11) 95555-3321',
    reservedAt: '2026-08-01T13:45:00.000Z',
  },
  {
    name: 'Paleta de sombras rosé e dourado',
    description:
      'Cores suaves e cintilantes para maquiagens delicadas, festa de 15 anos e eventos especiais.',
    imageUrl:
      'https://www.shoppingdamultidao.com.br/cdn/shop/files/7899956828751__1.jpg?v=1776736888&width=1946',
    purchaseUrl: null,
    price: 119.9,
    status: 'RESERVED',
    reservedByName: 'Isabela Lima',
    reservedByPhone: '(11) 93333-1456',
    reservedAt: '2026-08-03T21:15:00.000Z',
  },
]

export const reservedGiftData: GiftData[] = reservedGiftPresets.map((gift, index) => ({
  id: `preset-reserved-gift-${index + 1}`,
  name: gift.name,
  description: gift.description,
  imageUrl: gift.imageUrl,
  purchaseUrl: gift.purchaseUrl,
  price: gift.price,
  status: gift.status,
  canUndoReservation: false,
}))
