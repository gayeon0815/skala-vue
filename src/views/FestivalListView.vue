<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  fetchFestivalsByArea,
  sortFestivals,
  getMockFestivals,
} from '@/components/exercise/festivalService'
import FestivalList from '@/components/exercise/FestivalList.vue'
import { cities } from '@/components/exercise/cityList'
import RegionFilter from '@/components/exercise/RegionFilter.vue'

const status = ref('loading')
const allFestivals = ref([])
const selectedRegion = ref('전체')

const load = async () => {
  status.value = 'loading'
  try {
    const uniqueCodes = [...new Set(cities.map((c) => c.tourAreaCode))]
    const results = await Promise.all(
      uniqueCodes.map((code) =>
        fetchFestivalsByArea(code)
          .then((list) => ({ code, list }))
          .catch(() => ({ code, list: [] })),
      ),
    )
    const merged = []
    results.forEach(({ code, list }) => {
      const candidates = cities.filter((c) => c.tourAreaCode === code)
      list.forEach((f) => {
        const matched = candidates.find((c) => f.address?.includes(c.name))
        const target = matched || candidates[0]
        merged.push({ ...f, cityId: target?.id, cityName: target?.name })
      })
    })
    // 실제 API에 데이터가 없는 도시는 예시(실제 날짜 기반) 데이터로 보완
    cities.forEach((c) => {
      const hasRealData = merged.some((f) => f.cityId === c.id)
      if (!hasRealData) {
        const mock = getMockFestivals(c.name).map((f) => ({ ...f, cityId: c.id, cityName: c.name }))
        merged.push(...mock)
      }
    })
    allFestivals.value = sortFestivals(merged)
    status.value = 'ok'
  } catch (err) {
    console.error(err)
    status.value = 'error'
  }
}

onMounted(load)

const updateRegion = (val) => {
  selectedRegion.value = val
}

const filteredFestivals = computed(() => {
  if (selectedRegion.value === '전체') return allFestivals.value
  // 축제의 도시가 속한 지역(region)으로 필터링
  return allFestivals.value.filter((f) => {
    const city = cities.find((c) => c.id === f.cityId)
    return city?.region === selectedRegion.value
  })
})
</script>

<template>
  <header class="app-header">
    <div class="header-text">
      <h1 class="app-title">🎪 전국 축제 목록</h1>
      <p class="app-subtitle">전국의 진행 중 · 예정 축제를 확인해보세요</p>
    </div>
  </header>

  <div v-if="status === 'loading'" class="status-box loading">
    <i class="fa-solid fa-spinner fa-spin"></i> 축제 정보를 불러오는 중이에요...
  </div>
  <div v-else-if="status === 'error'" class="status-box error">
    <i class="fa-solid fa-triangle-exclamation"></i> 축제 정보를 불러오지 못했어요.
    <button class="retry-btn" @click="load">
      <i class="fa-solid fa-rotate-right"></i> 다시 시도
    </button>
  </div>
  <template v-else>
    <div class="region-filter-wrap">
      <RegionFilter :current-region="selectedRegion" @update-region="updateRegion" />
    </div>
    <FestivalList :festivals="filteredFestivals" :show-city-name="true" />
  </template>
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
.retry-btn {
  padding: 8px 18px;
  border: none;
  border-radius: 999px;
  background-color: #ff7faa;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.region-filter-wrap {
  margin-bottom: 18px;
}
</style>
