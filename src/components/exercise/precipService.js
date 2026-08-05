import axios from 'axios'

const OWM_BASE = 'https://api.openweathermap.org/data/2.5'
const OWM_KEY = import.meta.env.VITE_OPENWEATHER_KEY

export async function fetchHourlyPrecipitation(lat, lon) {
  const [currentRes, forecastRes] = await Promise.all([
    axios.get(`${OWM_BASE}/weather`, {
      params: { lat, lon, appid: OWM_KEY, units: 'metric', lang: 'kr' },
    }),
    axios.get(`${OWM_BASE}/forecast`, {
      params: { lat, lon, appid: OWM_KEY, units: 'metric', lang: 'kr' },
    }),
  ])

  const now = currentRes.data
  const nowIso = new Date().toISOString().slice(0, 19)

  // 현재 관측값을 맨 앞에 넣어서, 이미 지나간 낮 시간대의 더위도 반영되게 함
  const current = {
    time: nowIso,
    probability: 0,
    precip: now.rain?.['1h'] ?? 0,
    feelsLike: now.main.feels_like,
    temp: now.main.temp,
    // 오늘 관측된 최고기온 (OWM이 제공)
    tempMax: now.main.temp_max,
  }

  const forecast = forecastRes.data.list.map((item) => ({
    time: item.dt_txt.replace(' ', 'T'),
    probability: Math.round((item.pop ?? 0) * 100),
    precip: item.rain?.['3h'] ?? 0,
    feelsLike: item.main.feels_like,
    temp: item.main.temp,
  }))

  return [current, ...forecast]
}
