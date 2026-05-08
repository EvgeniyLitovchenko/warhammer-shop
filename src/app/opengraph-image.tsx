import { ImageResponse } from 'next/og';

export const alt = 'Warhammer Shop';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background:
            'linear-gradient(135deg, #1a1c1f 0%, #2a2d31 50%, #1a1c1f 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#e7dfc6',
          fontFamily: 'serif',
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: '#c9a558',
            letterSpacing: 12,
            textTransform: 'uppercase',
            marginBottom: 40,
          }}
        >
          In the Emperor&apos;s name
        </div>
        <div
          style={{
            fontSize: 110,
            fontWeight: 900,
            letterSpacing: -2,
            textAlign: 'center',
            lineHeight: 1,
          }}
        >
          WARHAMMER SHOP
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#e7dfc6',
            opacity: 0.7,
            marginTop: 48,
            textAlign: 'center',
            maxWidth: 900,
          }}
        >
          Miniatures · Paints · Books · Accessories
        </div>
      </div>
    ),
    size,
  );
}
