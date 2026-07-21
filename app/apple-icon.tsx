import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #0b0b14 0%, #1a0d2e 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '36px',
      }}
    >
      <svg
        width="120"
        height="100"
        viewBox="0 0 22 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 16 L1 10 L5.5 3 L11 8 L16.5 3 L21 10 L21 16 Z"
          fill="#C9A84C"
        />
        <rect x="1" y="13" width="20" height="3" rx="1" fill="#9A7030" />
        <circle cx="11" cy="8" r="1.8" fill="#FFE4B5" />
        <circle cx="1" cy="10" r="1.4" fill="#F0C040" />
        <circle cx="21" cy="10" r="1.4" fill="#F0C040" />
        <circle cx="11" cy="14.5" r="1.2" fill="#E8C878" />
        <circle cx="6" cy="14.5" r="0.9" fill="#C9A84C" />
        <circle cx="16" cy="14.5" r="0.9" fill="#C9A84C" />
      </svg>
    </div>,
    { ...size }
  )
}
