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
    name: 'Jaqueta jeans oversized clara',
    description:
      'Peça coringa para looks casuais, inspirada no estilo oversized que faz sucesso entre as meninas de 15 anos.',
    imageUrl:
      'https://a-static.mlcdn.com.br/800x800/jaqueta-oversized-em-jeans-claro-tamanho-m-youcom/basicaessencial/55ccf5e4547e11ed91e24201ac185019/2f9227d85747c55aeed1fbd29b32adce.jpeg',
    purchaseUrl: null,
    price: 189.9,
    status: 'RESERVED',
    reservedByName: 'Mariana Costa',
    reservedByPhone: '(11) 98888-1201',
    reservedAt: '2026-07-28T18:30:00.000Z',
  },

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
    name: 'Tênis casual branco com sola alta',
    description:
      'Modelo versátil para combinar com vestido, jeans ou conjunto comfy em festas e passeios.',
    imageUrl:
      'https://static.dafiti.com.br/p/herlim-tenis-feminino-casual-original-flatform-plataforma-sola-alta-branco-9876-81838641-1-zoom.jpg?ims=fit-in%2F430x623',
    purchaseUrl: null,
    price: 279.9,
    status: 'RESERVED',
    reservedByName: 'Beatriz Rocha',
    reservedByPhone: '(11) 96666-7812',
    reservedAt: '2026-07-30T20:05:00.000Z',
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
    name: 'Body splash floral adocicado',
    description:
      'Fragrância jovial e leve, perfeita para a rotina escolar, passeios e momentos especiais.',
    imageUrl:
      'https://images.tcdn.com.br/img/img_prod/631794/body_splash_my_flowers_200ml_humma_7450_1_13b0a8ff0d394ea6212c7ee53d4a1620.jpg',
    purchaseUrl: null,
    price: 94.9,
    status: 'RESERVED',
    reservedByName: 'Camila Souza',
    reservedByPhone: '(11) 94444-9087',
    reservedAt: '2026-08-02T17:20:00.000Z',
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

  {
    name: 'Kit skincare com gel de limpeza e hidratante',
    description:
      'Dupla para o cuidado facial diário, pensada para uma rotina simples, prática e cheirosa.',
    imageUrl:
      'https://paguemenos.vtexassets.com/arquivos/ids/1074571/Kit-Eudora-Niina-Secrets-Skin---Gel-Limpeza-Facial-100ml---Gel-Hidratante-Nutritivo-30ml.jpg?v=638944869668600000',
    purchaseUrl: null,
    price: 149.9,
    status: 'RESERVED',
    reservedByName: 'Larissa Alves',
    reservedByPhone: '(11) 92222-6644',
    reservedAt: '2026-08-05T14:55:00.000Z',
  },

  {
    name: 'Moletom oversized rosa blush',
    description:
      'Peça confortável e fofa para usar em dias frios, viagens ou maratonas de filmes com as amigas.',
    imageUrl:
      'https://static.riachuelo.com.br/RCHLO/16404505001/portrait/42c423af6fd66c629aa0e05a54eb721f8461da73.jpg',
    purchaseUrl: null,
    price: 199.9,
    status: 'RESERVED',
    reservedByName: 'Sofia Ribeiro',
    reservedByPhone: '(11) 91111-2780',
    reservedAt: '2026-08-07T19:40:00.000Z',
  },

  {
    name: 'Fone Bluetooth rosa pastel',
    description:
      'Acessório prático para ouvir música, assistir a vídeos e acompanhar a rotina com mais estilo.',
    imageUrl:
      'https://carrefourbr.vtexassets.com/arquivos/ids/87171960/',
    purchaseUrl: null,
    price: 239.9,
    status: 'RESERVED',
    reservedByName: 'Helena Barros',
    reservedByPhone: '(11) 90000-5619',
    reservedAt: '2026-08-08T16:25:00.000Z',
  },

  {
    name: 'Câmera instantânea mini',
    description:
      'Presente divertido para registrar momentos com amigas, família e lembranças da festa de aniversário.',
    imageUrl:
      'https://www.glazerscamera.com/cdn/shop/products/89961_01_Hero_1200x1200.png?v=1678494223',
    purchaseUrl: null,
    price: 389.9,
    status: 'RESERVED',
    reservedByName: 'Manuela Araujo',
    reservedByPhone: '(11) 98989-7733',
    reservedAt: '2026-08-10T12:05:00.000Z',
  },
]