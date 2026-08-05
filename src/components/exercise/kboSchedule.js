const addDays = (days) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export const kboSchedule = [
  // 오늘 실제 경기
  { date: addDays(0), time: '18:30', home: '두산', away: 'NC', stadium: '잠실야구장' },
  { date: addDays(0), time: '18:30', home: '삼성', away: '한화', stadium: '대구삼성라이온즈파크' },
  { date: addDays(0), time: '18:30', home: '롯데', away: '키움', stadium: '사직야구장' },
  { date: addDays(0), time: '18:30', home: 'SSG', away: 'LG', stadium: '인천SSG랜더스필드' },
  { date: addDays(0), time: '18:30', home: 'KIA', away: 'KT', stadium: '광주기아챔피언스필드' },
  // 다가올 경기 (예시, 돔구장/창원 케이스 포함)
  { date: addDays(1), time: '18:30', home: '두산', away: 'NC', stadium: '잠실야구장' },
  { date: addDays(1), time: '18:30', home: '삼성', away: '한화', stadium: '대구삼성라이온즈파크' },
  { date: addDays(1), time: '18:30', home: '롯데', away: '키움', stadium: '사직야구장' },
  { date: addDays(1), time: '18:30', home: 'SSG', away: 'LG', stadium: '인천SSG랜더스필드' },
  { date: addDays(1), time: '18:30', home: 'KIA', away: 'KT', stadium: '광주기아챔피언스필드' },
  { date: addDays(2), time: '18:30', home: 'LG', away: 'KIA', stadium: '잠실야구장' },
  { date: addDays(2), time: '18:30', home: '한화', away: '키움', stadium: '대전 한화생명 볼파크' },
  { date: addDays(2), time: '18:30', home: 'KT', away: '롯데', stadium: '수원 KT위즈파크' },
  { date: addDays(2), time: '18:30', home: '삼성', away: '두산', stadium: '대구삼성라이온즈파크' },
  { date: addDays(2), time: '18:30', home: 'NC', away: 'SSG', stadium: '창원NC파크' },
]
