const TOUR_BASE = 'https://apis.data.go.kr/B551011/KorService2/searchFestival2'

const parseDate = (yyyymmdd) => {
  if (!yyyymmdd || yyyymmdd.length !== 8) return null
  const year = Number(yyyymmdd.slice(0, 4))
  const month = Number(yyyymmdd.slice(4, 6)) - 1 // 월은 0부터 시작
  const day = Number(yyyymmdd.slice(6, 8))
  return new Date(year, month, day) // 로컬 시간 기준 자정
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
   오픈API가 개최 종료된 축제 정보만을 응답하여 실제 진행 중인 축제 정보로 mock 데이터를 만들어서 사용합니다.
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
      image: 'festival/hangang.jpg',
    },
    {
      title: '성북문화바캉스',
      address: '서울특별시 성북구 정릉로 279 (정릉동) ',
      startDate: '20260725',
      endDate: '20260809',
      image: 'festival/seongbuk.png',
    },
  ],
  보령: [
    {
      title: '보령머드축제',
      address: '충청남도 보령시 신흑동 2282대천해수욕장',
      startDate: '20260724',
      endDate: '20260809',
      image: 'festival/boryeong.jpg',
    },
  ],
  춘천: [
    {
      title: '춘천 썸머워터 페스티벌',
      address: '강원특별자치도 춘천시 삼천동 200-9 춘천수변공원',
      startDate: '20260717',
      endDate: '20260817',
      image: 'festival/chuncheon.jpg',
    },
  ],
  인천: [
    {
      title: '송도해변축제',
      address: '인천광역시 연수구 아암대로 764 (송도동) 송도달빛공원',
      startDate: '20260808',
      endDate: '20260815',
      image: 'festival/incheon.jpg',
    },
  ],
  부산: [
    {
      title: '부산바다축제',
      address: '부산광역시 사하구 다대동 다대포 해수욕장',
      startDate: '20260807',
      endDate: '20260813',
      image: 'festival/busan.jpg',
    },
  ],
  전주: [
    {
      title: '전주 가맥축제',
      address: '전북특별자치도 전주시 덕진구 권삼득로 308 (덕진동1가) ',
      startDate: '20260806',
      endDate: '20260808',
      image: 'festival/jeonju.jpg',
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
      image: f.image ? `${import.meta.env.BASE_URL}${f.image}` : '',
      address: f.address,
      startDate,
      endDate,
      status: toStatus(startDate, endDate),
      isMock: true,
    }
  })
}
