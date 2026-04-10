import type { Metadata } from 'next'
import './globals.css'

const metadataBase = (() => {
  const url = process.env.NEXT_PUBLIC_SITE_URL

  if (!url) {
    return undefined
  }

  try {
    return new URL(url)
  } catch {
    return undefined
  }
})()

export const metadata: Metadata = {
  metadataBase,
  title: '구은성 ♥ 김예은 결혼식 초대장',
  description:
    '2026년 6월 6일 낮 12시, 꽃재교회 2층 대예배실에서 열리는 구은성 · 김예은 결혼식 모바일 청첩장입니다.',
  openGraph: {
    type: 'website',
    title: '구은성 ♥ 김예은 결혼식 초대장',
    description:
      '소중한 순간에 함께하시어 축복해주시면 감사하겠습니다. 2026년 6월 6일 낮 12시.',
    images: [
      {
        url: '/imgs/WJ_06443.jpg',
        width: 1200,
        height: 1800,
        alt: '구은성 김예은 웨딩 사진',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '구은성 ♥ 김예은 결혼식 초대장',
    description: '2026년 6월 6일 토요일 낮 12시 · 꽃재교회 2층 대예배실',
    images: ['/imgs/WJ_06443.jpg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@noonnu/eulyoo1945-regular@0.1.0/index.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
