<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useConfigStore } from '@/stores/configStore'
import axios from 'axios'
import {
  fetchFestivalsByArea,
  sortFestivals,
  getMockFestivals,
} from '@/components/exercise/festivalService'
import FestivalList from '@/components/exercise/FestivalList.vue'
import { cities } from '@/components/exercise/cityList'

const route = useRoute()

const city = ref(null)
const isLoading = ref(true)

const festivals = ref([])
const festivalStatus = ref('loading')

const loadFestivals = async (cityName) => {
  festivalStatus.value = 'loading'
  const meta = cities.find((c) => c.name === cityName)
  if (!meta) {
    festivalStatus.value = 'error'
    return
  }
  try {
    const list = await fetchFestivalsByArea(meta.tourAreaCode)
    const sorted = sortFestivals(list)
    festivals.value = sorted.length > 0 ? sorted : getMockFestivals(cityName)
    festivalStatus.value = 'ok'
  } catch (err) {
    console.warn('축제 정보 조회 실패, 예시 데이터로 대체합니다.', err)
    festivals.value = getMockFestivals(cityName)
    festivalStatus.value = 'ok'
  }
}

const configStore = useConfigStore()

const convertTemp = (rawTemp) => {
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp
}

const mapWeatherId = (id) => {
  if (id === 800 || id === 801) return '맑음'
  if (id >= 802 && id <= 804) return '구름'
  if (id >= 700 && id < 800) return '구름'
  return '비'
}

const OWM_BASE = 'https://api.openweathermap.org/data/2.5'
const OWM_KEY = import.meta.env.VITE_OPENWEATHER_KEY

// 3시간 단위 예보 40개를 날짜별로 묶어서 하루 요약(최저/최고/강수확률/대표날씨)으로 변환
const buildDailyOutlook = (list) => {
  const groups = {}
  list.forEach((item) => {
    const dateKey = item.dt_txt.slice(0, 10)
    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(item)
  })

  return Object.entries(groups)
    .slice(0, 5)
    .map(([date, items]) => {
      const temps = items.map((i) => i.main.temp)
      const pops = items.map((i) => i.pop ?? 0)
      const noonItem =
        items.find((i) => i.dt_txt.includes('12:00:00')) || items[Math.floor(items.length / 2)]
      return {
        date,
        min: Math.round(Math.min(...temps)),
        max: Math.round(Math.max(...temps)),
        pop: Math.round(Math.max(...pops) * 100),
        status: mapWeatherId(noonItem.weather[0].id),
      }
    })
}

const fetchCityWeather = async (meta) => {
  const [currentRes, forecastRes] = await Promise.all([
    axios.get(`${OWM_BASE}/weather`, {
      params: { lat: meta.lat, lon: meta.lon, appid: OWM_KEY, units: 'metric', lang: 'kr' },
    }),
    axios.get(`${OWM_BASE}/forecast`, {
      params: { lat: meta.lat, lon: meta.lon, appid: OWM_KEY, units: 'metric', lang: 'kr' },
    }),
  ])

  const current = currentRes.data
  const hourly = forecastRes.data.list.slice(0, 8).map((item) => ({
    time: item.dt_txt,
    temp: Math.round(item.main.temp),
    status: mapWeatherId(item.weather[0].id),
    pop: Math.round((item.pop ?? 0) * 100),
    rain: item.rain?.['3h'] ? Number(item.rain['3h'].toFixed(1)) : 0,
  }))

  return {
    id: meta.id,
    name: meta.name,
    region: meta.region,
    temp: Math.round(current.main.temp),
    humidity: current.main.humidity,
    status: mapWeatherId(current.weather[0].id),
    rainNow: current.rain?.['1h'] ? Number(current.rain['1h'].toFixed(1)) : 0,
    hourly,
    daily: buildDailyOutlook(forecastRes.data.list),
  }
}

const loadCity = async (cityId) => {
  isLoading.value = true
  city.value = null

  if (cityId === 'my-location') {
    if (!('geolocation' in navigator)) {
      isLoading.value = false
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          city.value = await fetchCityWeather({
            id: 'my-location',
            name: '내 위치',
            region: '내 위치',
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        } finally {
          isLoading.value = false
        }
      },
      () => {
        isLoading.value = false
      },
    )
    return
  }

  const meta = cities.find((c) => c.id === cityId)
  if (!meta) {
    isLoading.value = false
    return
  }

  try {
    city.value = await fetchCityWeather(meta)
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

watch(() => route.params.cityId, loadCity, { immediate: true })

watch(city, (newCity) => {
  if (newCity && newCity.name !== '내 위치') {
    loadFestivals(newCity.name)
  }
})

const theme = computed(() => {
  switch (city.value?.status) {
    case '맑음':
      return { icon: 'fa-solid fa-sun', wash: '#fff4de', accent: '#ffb648' }
    case '비':
      return { icon: 'fa-solid fa-cloud-rain', wash: '#e8f4ff', accent: '#5fadff' }
    case '구름':
      return { icon: 'fa-solid fa-cloud', wash: '#f1edfb', accent: '#a79fc9' }
    default:
      return { icon: 'fa-solid fa-temperature-half', wash: '#f4f4f6', accent: '#9ca3af' }
  }
})

const weatherIconFor = (status) => {
  switch (status) {
    case '맑음':
      return 'fa-solid fa-sun'
    case '비':
      return 'fa-solid fa-cloud-rain'
    case '구름':
      return 'fa-solid fa-cloud'
    default:
      return 'fa-solid fa-temperature-half'
  }
}

const tempInfo = computed(() => {
  const t = city.value?.temp ?? 0
  if (t >= 30) return { label: '무더워요', color: '#e4572e' }
  if (t >= 25) return { label: '더워요', color: '#ff9f45' }
  if (t >= 20) return { label: '선선해요', color: '#4caf50' }
  if (t >= 10) return { label: '쌀쌀해요', color: '#4a90e2' }
  return { label: '추워요', color: '#2e3a87' }
})

const humidityInfo = computed(() => {
  const h = city.value?.humidity ?? 0
  if (h >= 80) return { label: '눅눅해요', color: '#0f9da6', wash: '#e0f7f5' }
  if (h >= 60) return { label: '습해요', color: '#5fadff', wash: '#e8f4ff' }
  if (h >= 40) return { label: '쾌적해요', color: '#3fcb94', wash: '#e3fbf1' }
  return { label: '건조해요', color: '#d97706', wash: '#fef3e2' }
})

const formatHour = (isoString, index) => {
  if (index === 0) return '지금'
  return `${Number(isoString.slice(11, 13))}시`
}

const formatDailyDate = (dateStr) => {
  const d = new Date(dateStr)
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
  return `${d.getMonth() + 1}/${d.getDate()} (${weekday})`
}
</script>

<template>
  <div v-if="isLoading" class="status-box loading">
    <i class="fa-solid fa-spinner fa-spin"></i> 날씨 정보를 불러오는 중이에요...
  </div>

  <div v-else-if="!city" class="status-box error">
    <i class="fa-solid fa-triangle-exclamation"></i> 해당 도시 정보를 찾을 수 없어요.
    <RouterLink to="/" class="back-btn">대시보드 홈으로 이동</RouterLink>
  </div>

  <template v-else>
    <div class="detail-hero" :style="{ '--wash': theme.wash, '--accent': theme.accent }">
      <div class="detail-icon"><i :class="theme.icon"></i></div>
      <p class="detail-name">
        {{ city.name }}
        <span class="city-region">{{ city.region }}</span>
      </p>
      <p class="detail-temp">
        {{ convertTemp(city.temp) }}<span class="unit">{{ configStore.unitSymbol }}</span>
      </p>
      <div class="detail-meta">
        <span
          class="humidity"
          :style="{ color: humidityInfo.color, backgroundColor: humidityInfo.wash }"
        >
          <i class="fa-solid fa-droplet"></i> {{ city.humidity }}% · {{ humidityInfo.label }}
        </span>
        <span class="label" :style="{ backgroundColor: tempInfo.color }">{{ tempInfo.label }}</span>
        <span class="rain-now" :class="{ active: city.rainNow > 0 }">
          <i class="fa-solid fa-cloud-showers-heavy"></i>
          {{ city.rainNow > 0 ? `현재 강수량 ${city.rainNow}mm` : '현재 강수 없음' }}
        </span>
      </div>
    </div>

    <section class="hourly-section" v-if="city.hourly?.length">
      <h3 class="section-title"><i class="fa-solid fa-clock"></i> 시간별 예보</h3>
      <div class="hourly-scroll">
        <div v-for="(hour, index) in city.hourly" :key="hour.time" class="hourly-item">
          <span class="hourly-time">{{ formatHour(hour.time, index) }}</span>
          <i :class="weatherIconFor(hour.status)" class="hourly-icon"></i>
          <span class="hourly-temp">{{ convertTemp(hour.temp) }}{{ configStore.unitSymbol }}</span>
          <span class="hourly-pop"><i class="fa-solid fa-droplet"></i> {{ hour.pop }}%</span>
        </div>
      </div>
    </section>

    <section class="daily-section" v-if="city.daily?.length">
      <h3 class="section-title"><i class="fa-solid fa-calendar-days"></i> 5일 예보</h3>
      <div class="daily-list">
        <div v-for="day in city.daily" :key="day.date" class="daily-item">
          <span class="daily-date">{{ formatDailyDate(day.date) }}</span>
          <i :class="weatherIconFor(day.status)" class="daily-icon"></i>
          <span class="daily-pop"><i class="fa-solid fa-droplet"></i> {{ day.pop }}%</span>
          <span class="daily-temps">
            <span class="daily-min">{{ convertTemp(day.min) }}°</span>
            /
            <span class="daily-max">{{ convertTemp(day.max) }}°</span>
          </span>
        </div>
      </div>
    </section>

    <section class="festival-section" v-if="city.name !== '내 위치'">
      <h3 class="section-title"><i class="fa-solid fa-champagne-glasses"></i> 지역 축제</h3>
      <div v-if="festivalStatus === 'loading'" class="mini-status loading">
        <i class="fa-solid fa-spinner fa-spin"></i> 축제 정보를 불러오는 중이에요...
      </div>
      <div v-else-if="festivalStatus === 'error'" class="mini-status error">
        <i class="fa-solid fa-triangle-exclamation"></i> 축제 정보를 불러오지 못했어요.
        <button class="retry-btn" @click="loadFestivals(city.name)">다시 시도</button>
      </div>
      <FestivalList
        v-else
        :festivals="festivals"
        :empty-message="`현재 ${city.name}에서 진행 중인 축제가 없습니다.`"
      />
    </section>

    <RouterLink to="/" class="back-btn">
      <i class="fa-solid fa-arrow-left"></i> 대시보드 홈으로 이동
    </RouterLink>
  </template>
</template>

<style scoped>
.status-box {
  padding: 40px 18px;
  border-radius: 18px;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
}
.status-box.loading {
  background-color: #eaf6ff;
  color: #3b82c4;
}
.status-box.error {
  background-color: #ffe9f1;
  color: #ff5c8a;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.detail-hero {
  position: relative;
  text-align: center;
  padding: 32px 20px;
  background-color: var(--wash);
  border-radius: 24px;
  margin-bottom: 24px;
}
.detail-icon {
  width: 76px;
  height: 76px;
  margin: 0 auto 12px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: var(--accent);
  background-color: #ffffff;
  border-radius: 50%;
  box-shadow: 0 8px 20px rgba(69, 65, 95, 0.1);
}
.detail-name {
  margin: 0 0 4px 0;
  font-family: 'Jua', 'Pretendard', sans-serif;
  font-size: 22px;
  color: #45415f;
}
.city-region {
  margin-left: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  background-color: #c7c2de;
  padding: 3px 10px;
  border-radius: 999px;
  vertical-align: middle;
}
.detail-temp {
  margin: 4px 0 12px 0;
  font-size: 44px;
  font-weight: 800;
  color: #45415f;
}
.unit {
  font-size: 20px;
  font-weight: 500;
  color: #a6a0be;
}
.detail-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}
.humidity {
  font-size: 13px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 999px;
}
.label {
  display: inline-block;
  padding: 5px 13px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
}
.rain-now {
  font-size: 13px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 999px;
  color: #a6a0be;
  background-color: #f4f4f6;
}
.rain-now.active {
  color: #5fadff;
  background-color: #e8f4ff;
}

.hourly-section,
.daily-section {
  margin-bottom: 24px;
}
.section-title {
  margin: 0 0 12px 0;
  font-family: 'Jua', 'Pretendard', sans-serif;
  font-size: 15px;
  font-weight: 400;
  color: #45415f;
}

.hourly-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 6px;
}
.hourly-item {
  flex-shrink: 0;
  width: 66px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 6px;
  background-color: #fbfaff;
  border-radius: 14px;
}
.hourly-time {
  font-size: 12px;
  font-weight: 700;
  color: #a6a0be;
}
.hourly-icon {
  font-size: 16px;
  color: #ffb648;
}
.hourly-temp {
  font-size: 14px;
  font-weight: 800;
  color: #45415f;
}
.hourly-pop {
  font-size: 10px;
  font-weight: 700;
  color: #5fadff;
}

.daily-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.daily-item {
  display: grid;
  grid-template-columns: 56px 24px 50px 1fr;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background-color: #fbfaff;
  border-radius: 12px;
}
.daily-date {
  font-size: 12px;
  font-weight: 700;
  color: #45415f;
}
.daily-icon {
  font-size: 15px;
  color: #ffb648;
}
.daily-pop {
  font-size: 11px;
  font-weight: 700;
  color: #5fadff;
}
.daily-temps {
  text-align: right;
  font-size: 13px;
  font-weight: 700;
}
.daily-min {
  color: #a6a0be;
}
.daily-max {
  color: #45415f;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  border-radius: 999px;
  background-color: #f1ecff;
  color: #45415f;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}
.back-btn:hover {
  background-color: #45415f;
  color: #ffffff;
}

.festival-section {
  margin-bottom: 24px;
}
.mini-status {
  padding: 20px;
  border-radius: 14px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
}
.mini-status.loading {
  background-color: #eaf6ff;
  color: #3b82c4;
}
.mini-status.error {
  background-color: #ffe9f1;
  color: #ff5c8a;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
</style>
