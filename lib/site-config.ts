const defaultSiteUrl = 'https://your-domain.vercel.app'
const defaultNaverMap = 'https://naver.me/FvEgIqLh'
const defaultKakaoMap = 'https://place.map.kakao.com/23465934'

export const siteConfig = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? defaultSiteUrl,
  weddingDateISO: '2026-06-06T12:00:00+09:00',
  weddingStartUTC: '20260606T030000Z',
  weddingEndUTC: '20260606T050000Z',
  venueName: '꽃재교회 2층 대예배실',
  venueAddress: '기독교대한감리회 꽃재교회 2층 대예배실, 마장로 164(1070-5)',
  naverMapUrl: process.env.NEXT_PUBLIC_NAVER_MAP_URL ?? defaultNaverMap,
  kakaoMapUrl: process.env.NEXT_PUBLIC_KAKAO_MAP_URL ?? defaultKakaoMap,
  icsPath: process.env.NEXT_PUBLIC_WEDDING_ICS_PATH ?? '/calendar/wedding-invitation.ics',
  kakaoShareEnabled: process.env.NEXT_PUBLIC_KAKAO_SHARE_ENABLED === 'true',
}

export const googleCalendarUrl =
  `https://calendar.google.com/calendar/render?action=TEMPLATE` +
  `&text=${encodeURIComponent('구은성 ♥ 김예은 결혼식')}` +
  `&dates=${siteConfig.weddingStartUTC}/${siteConfig.weddingEndUTC}` +
  `&details=${encodeURIComponent('소중한 날 함께 축복해주시면 감사하겠습니다.')}` +
  `&location=${encodeURIComponent(siteConfig.venueAddress)}`
