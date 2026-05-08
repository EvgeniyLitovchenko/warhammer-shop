import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#1a1c1f',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#c9a558',
          fontSize: 22,
          fontWeight: 900,
          fontFamily: 'serif',
        }}
      >
        W
      </div>
    ),
    size,
  );
}
