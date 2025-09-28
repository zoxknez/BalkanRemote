import { ImageResponse } from '@vercel/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

const THEME_MAP = {
  default: {
    from: '#1e3a8a', // blue-800
    to: '#6d28d9',   // violet-700
    accent: '#60a5fa',
  },
  jobs: {
    from: '#0f766e', // teal-700
    to: '#2563eb',   // blue-600
    accent: '#34d399',
  },
  guide: {
    from: '#b45309', // amber-700
    to: '#db2777',   // pink-600
    accent: '#fbbf24',
  },
  resources: {
    from: '#065f46', // emerald-700
    to: '#16a34a',   // green-600
    accent: '#86efac',
  },
} as const

type ThemeKey = keyof typeof THEME_MAP
type ThemeDef = typeof THEME_MAP[ThemeKey]

function getTheme(theme?: string): ThemeDef {
  const t = (theme || '').toLowerCase()
  if (t in THEME_MAP) {
    return THEME_MAP[t as ThemeKey]
  }
  return THEME_MAP.default
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const title = searchParams.get('title') || 'Remote Balkan'
    const subtitle = searchParams.get('subtitle') || 'Career hub za remote profesionalce sa Balkana'
    const theme = getTheme(searchParams.get('theme') || undefined)

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)`,
            color: 'white',
            fontFamily: 'Inter, ui-sans-serif, system-ui, Arial',
            padding: '60px',
            overflow: 'hidden',
          }}
        >
          {/* Subtle background pattern */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'radial-gradient(ellipse at 20% 10%, rgba(255,255,255,0.08), transparent 40%), radial-gradient(ellipse at 80% 90%, rgba(255,255,255,0.08), transparent 40%)',
            }}
          />

          {/* Brand badge */}
          <div
            style={{
              position: 'absolute',
              top: 36,
              left: 36,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                letterSpacing: -0.5,
              }}
            >
              RB
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, opacity: 0.95 }}>Remote Balkan</div>
          </div>

          {/* Title */}
          <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -1, textAlign: 'center' }}>{title}</div>
          <div style={{ fontSize: 28, opacity: 0.95, marginTop: 12, textAlign: 'center' }}>{subtitle}</div>

          {/* Accent line */}
          <div
            style={{
              position: 'absolute',
              bottom: 48,
              width: 720,
              height: 6,
              background: theme.accent,
              borderRadius: 999,
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
        // Cache for a day on browser and a week on CDN; allow stale-while-revalidate for a day
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
        },
      }
    )
  } catch {
    return new Response('Failed to generate the image', { status: 500 })
  }
}
