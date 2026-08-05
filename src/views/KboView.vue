<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { kboSchedule } from '@/components/exercise/kboSchedule'
import { getStadiumByName } from '@/components/exercise/stadiums'
import { fetchHourlyPrecipitation } from '@/components/exercise/precipService'
import { predictRainCancellation } from '@/components/exercise/rainPrediction'

const todayStr = new Date().toISOString().slice(0, 10)

const gamesToday = computed(() => kboSchedule.filter((g) => g.date === todayStr))
const upcomingGames = computed(() =>
  [...kboSchedule.filter((g) => g.date > todayStr)].sort((a, b) =>
    a.date !== b.date ? a.date.localeCompare(b.date) : a.time.localeCompare(b.time),
  ),
)
const groupedUpcoming = computed(() => {
  const groups = {}
  upcomingGames.value.forEach((g) => {
    if (!groups[g.date]) groups[g.date] = []
    groups[g.date].push(g)
  })
  return Object.entries(groups)
})

const precipByCity = ref({})

const loadPrecipFor = (stadium) => {
  if (precipByCity.value[stadium.cityName]) return
  precipByCity.value[stadium.cityName] = 'loading'
  fetchHourlyPrecipitation(stadium.lat, stadium.lon)
    .then((hourly) => {
      precipByCity.value[stadium.cityName] = hourly
    })
    .catch((err) => {
      console.warn('강수 예보 조회 실패', stadium.cityName, err)
      precipByCity.value[stadium.cityName] = 'error'
    })
}

onMounted(() => {
  const seen = new Set()
  ;[...gamesToday.value, ...upcomingGames.value].forEach((g) => {
    const stadium = getStadiumByName(g.stadium)
    if (stadium && !stadium.isDome && !seen.has(stadium.cityName)) {
      seen.add(stadium.cityName)
      loadPrecipFor(stadium)
    }
  })
})

const getRainBadge = (game) => {
  const stadium = getStadiumByName(game.stadium)
  if (!stadium) return { label: '구장 정보 없음', color: '#9ca3af', reason: '' }
  if (stadium.isDome) return predictRainCancellation({ isDome: true })

  const precip = precipByCity.value[stadium.cityName]
  if (precip === 'loading' || precip === undefined) {
    return { label: '예보 확인 중', color: '#c7c2de', reason: '' }
  }
  if (precip === 'error') {
    return { label: '예보 정보 없음', color: '#9ca3af', reason: '예보 조회에 실패했어요.' }
  }
  const gameTime = new Date(`${game.date}T${game.time}:00`)
  return predictRainCancellation({ isDome: false, gameTime, hourly: precip })
}
</script>

<template>
  <header class="app-header">
    <div class="header-text">
      <h1 class="app-title">⚾ KBO 경기 일정</h1>
      <p class="app-subtitle">오늘과 다가올 경기, 우천취소 가능성을 확인해보세요</p>
    </div>
  </header>

  <section class="kbo-section">
    <h3 class="section-title"><i class="fa-solid fa-calendar-day"></i> 오늘의 경기</h3>
    <p v-if="gamesToday.length === 0" class="empty-msg">오늘은 예정된 경기가 없습니다.</p>
    <div v-else class="game-list">
      <div v-for="(g, i) in gamesToday" :key="i" class="game-card">
        <span class="game-time">{{ g.time }}</span>
        <span class="game-teams">{{ g.away }} @ {{ g.home }}</span>
        <RouterLink
          :to="`/weather/${getStadiumByName(g.stadium).cityId}`"
          class="game-stadium link"
        >
          <i class="fa-solid fa-location-dot"></i> {{ g.stadium }}
        </RouterLink>
        <span class="rain-badge" :style="{ backgroundColor: getRainBadge(g).color }">{{
          getRainBadge(g).label
        }}</span>
        <span v-if="getRainBadge(g).reason" class="rain-reason">{{ getRainBadge(g).reason }}</span>
      </div>
    </div>
  </section>

  <section class="kbo-section">
    <h3 class="section-title"><i class="fa-solid fa-calendar-week"></i> 다가올 경기</h3>
    <div v-for="[date, games] in groupedUpcoming" :key="date" class="date-group">
      <p class="date-label">{{ date }}</p>
      <div class="game-list">
        <div v-for="(g, i) in games" :key="i" class="game-card">
          <span class="game-time">{{ g.time }}</span>
          <span class="game-teams">{{ g.away }} @ {{ g.home }}</span>
          <RouterLink
            :to="`/weather/${getStadiumByName(g.stadium).cityId}`"
            class="game-stadium link"
          >
            <i class="fa-solid fa-location-dot"></i> {{ g.stadium }}
          </RouterLink>
          <span class="rain-badge" :style="{ backgroundColor: getRainBadge(g).color }">{{
            getRainBadge(g).label
          }}</span>
          <span v-if="getRainBadge(g).reason" class="rain-reason">{{
            getRainBadge(g).reason
          }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.app-header {
  padding: 8px 8px 24px 8px;
  margin-bottom: 24px;
  border-bottom: 2px dashed #f1ecff;
}
.app-title {
  margin: 0;
  font-family: 'Jua', 'Pretendard', sans-serif;
  font-size: 24px;
  font-weight: 400;
  color: #45415f;
}
.app-subtitle {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #a6a0be;
}

.kbo-section {
  margin-bottom: 28px;
}
.section-title {
  margin: 0 0 14px 0;
  font-family: 'Jua', 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #45415f;
}
.empty-msg {
  padding: 24px;
  background-color: #fbfaff;
  border-radius: 14px;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: #a6a0be;
}

.date-group {
  margin-bottom: 14px;
}
.date-label {
  margin: 0 0 8px 4px;
  font-size: 12px;
  font-weight: 700;
  color: #a6a0be;
}

.game-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.game-card {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 14px 16px;
  background-color: #fbfaff;
  border-radius: 14px;
}
.game-time {
  font-size: 13px;
  font-weight: 800;
  color: #45415f;
  min-width: 44px;
}
.game-teams {
  font-size: 13px;
  font-weight: 700;
  color: #45415f;
}
.game-stadium.link {
  font-size: 12px;
  color: #5fadff;
  text-decoration: underline;
  cursor: pointer;
}
.rain-badge {
  margin-left: auto;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
}
.rain-reason {
  width: 100%;
  font-size: 11px;
  color: #a6a0be;
}
</style>
