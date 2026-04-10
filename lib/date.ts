import type { Language } from '@/types/language'

const weddingDate = new Date('2026-06-06T12:00:00+09:00')

export function getWeddingDate() {
  return weddingDate
}

export function formatLocalWeddingDate(language: Language) {
  return new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Seoul',
  }).format(weddingDate)
}

export function getCountdownMessage(language: Language, now = new Date()) {
  const msDiff = weddingDate.getTime() - now.getTime()
  const dayDiff = Math.ceil(msDiff / (1000 * 60 * 60 * 24))

  if (dayDiff > 0) {
    return language === 'ko' ? `D-${dayDiff}` : `D-${dayDiff}`
  }

  if (dayDiff === 0) {
    return language === 'ko' ? '오늘은 예식 당일입니다' : 'Today is our wedding day'
  }

  return language === 'ko'
    ? '소중한 예식이 잘 마무리되었습니다'
    : 'Our wedding day has gracefully passed'
}

export function buildJune2026Matrix() {
  const firstDate = new Date('2026-06-01T00:00:00+09:00')
  const firstDay = firstDate.getDay() // 0: Sun
  const totalDays = 30

  const cells: Array<number | null> = []

  for (let i = 0; i < firstDay; i += 1) {
    cells.push(null)
  }

  for (let day = 1; day <= totalDays; day += 1) {
    cells.push(day)
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}
