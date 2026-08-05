import axios from 'axios'

const OWM_BASE = 'https://api.openweathermap.org/data/2.5'
const OWM_KEY = import.meta.env.VITE_OPENWEATHER_KEY

// Open-Meteo 대신 OpenWeatherMap으로 통일 (앱 전체가 같은 API 하나만 쓰도록)
// 3시간 단위라 Open-Meteo(1시간 단위)보다는 살짝 성기지만, 우천취소 판정 범위(경기 1시간 전~3시간 후)엔 충분해요
export async function fetchHourlyPrecipitation(lat, lon) {
  const res = await axios.get(`${OWM_BASE}/forecast`, {
    params: { lat, lon, appid: OWM_KEY, units: 'metric', lang: 'kr' },
  })

  return res.data.list.map((item) => ({
    time: item.dt_txt.replace(' ', 'T'),
    probability: Math.round((item.pop ?? 0) * 100),
    precip: item.rain?.['3h'] ?? 0,
    feelsLike: item.main.feels_like,
  }))
}
