const TOUR_BASE = 'https://apis.data.go.kr/B551011/KorService2/searchFestival2'

const parseDate = (yyyymmdd) => {
  if (!yyyymmdd || yyyymmdd.length !== 8) return null
  return new Date(`${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`)
}

const toStatus = (startDate, endDate) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = parseDate(startDate)
  const end = parseDate(endDate)
  if (!start || !end) return { key: 'ended', label: '종료', color: '#c7c2de' }

  if (today >= start && today <= end) {
    return { key: 'ongoing', label: '🎉 진행 중', color: '#43a047' }
  }
  if (today < start) {
    const dday = Math.ceil((start - today) / (1000 * 60 * 60 * 24))
    if (dday <= 7) return { key: 'soon', label: `🔜 D-${dday}`, color: '#fb8c00', dday }
    return { key: 'upcoming', label: '예정', color: '#9ca3af', dday }
  }
  return { key: 'ended', label: '종료', color: '#c7c2de' }
}

export async function fetchFestivalsByArea(areaCode) {
  const params = new URLSearchParams({
    serviceKey: import.meta.env.VITE_TOUR_KEY,
    MobileOS: 'ETC',
    MobileApp: 'WeatherDiary',
    _type: 'json',
    arrange: 'A',
    numOfRows: '100',
    pageNo: '1',
    areaCode,
    eventStartDate: '20200101',
  })

  const res = await fetch(`${TOUR_BASE}?${params.toString()}`)
  if (!res.ok) throw new Error('축제 정보 요청 실패')
  const data = await res.json()
  const raw = data?.response?.body?.items?.item ?? []
  const items = Array.isArray(raw) ? raw : [raw]

  return items
    .filter((it) => it.title)
    .map((it) => ({
      id: it.contentid,
      title: it.title,
      image: it.firstimage || '',
      address: it.addr1 || '',
      startDate: it.eventstartdate,
      endDate: it.eventenddate,
      status: toStatus(it.eventstartdate, it.eventenddate),
    }))
    .filter((f) => f.status.key !== 'ended')
}

// 진행 중 → 시작일 가까운 순
export function sortFestivals(list) {
  return [...list].sort((a, b) => {
    const rank = (f) => (f.status.key === 'ongoing' ? 0 : 1)
    const r = rank(a) - rank(b)
    return r !== 0 ? r : (a.startDate || '').localeCompare(b.startDate || '')
  })
}

/* ─────────────────────────────────────────────
   오픈API에 아직 등록 안 된 지역을 위한 예시(mock) 데이터
   실제 API가 0건을 반환할 때만 보완용으로 사용됨
   ───────────────────────────────────────────── */
const addDaysStr = (days) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

const rawMockFestivals = {
  서울: [
    {
      title: '한강 페스티벌',
      address: '서울특별시 마포구 마포나루길 407 (망원동) 망원한강공원',
      startDate: '20260801',
      endDate: '20260816',
    },
  ],
  춘천: [
    {
      title: '춘천 썸머워터 페스티벌',
      address: '강원특별자치도 춘천시 삼천동 200-9 춘천수변공원',
      startDate: '20260717',
      endDate: '20260817',
    },
  ],
}

export function getMockFestivals(cityName) {
  const entries = rawMockFestivals[cityName] || []
  return entries.map((f, i) => {
    const startDate = f.startDate || addDaysStr(f.startOffset)
    const endDate = f.endDate || addDaysStr(f.endOffset)
    return {
      id: `mock-${cityName}-${i}`,
      title: f.title,
      image: '',
      address: f.address,
      startDate,
      endDate,
      status: toStatus(startDate, endDate),
      isMock: true,
    }
  })
}
