import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Convite especial'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  const title = process.env.NEXT_PUBLIC_EVENT_TITLE ?? 'Aniversário da Gabi'
  const subtitle = process.env.NEXT_PUBLIC_EVENT_SUBTITLE ?? 'Você foi convidado para uma celebração especial'

  return new ImageResponse(
    <div
      style={{
        background: '#0b0b14',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Radial gold glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 800,
          height: 500,
          background: 'radial-gradient(ellipse, rgba(201,168,76,0.25) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      {/* Subtle dot grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(201,168,76,0.12) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          position: 'relative',
          padding: '0 80px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            color: '#C9A84C',
            fontSize: 22,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
          }}
        >
          ✦ Você está convidado ✦
        </div>

        <div
          style={{
            color: '#ffffff',
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.1,
            fontFamily: 'serif',
          }}
        >
          {title}
        </div>

        <div style={{ width: 80, height: 2, background: 'rgba(201,168,76,0.6)' }} />

        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 28 }}>{subtitle}</div>
      </div>
    </div>,
    { ...size }
  )
}
