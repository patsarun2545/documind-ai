import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: '#0A0F1E',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        position: 'relative',
      }}
    >
      {/* D ใหญ่ */}
      <span
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: '#6366F1',
          lineHeight: 1,
          marginRight: 2,
        }}
      >
        D
      </span>

      {/* เส้น 3 ขีด */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          marginBottom: 4,
        }}
      >
        <div style={{ width: 8, height: 2, background: '#818CF8', borderRadius: 1 }} />
        <div style={{ width: 6, height: 2, background: '#818CF8', borderRadius: 1, opacity: 0.6 }} />
        <div style={{ width: 7, height: 2, background: '#818CF8', borderRadius: 1, opacity: 0.35 }} />
      </div>
    </div>,
    { ...size }
  )
}