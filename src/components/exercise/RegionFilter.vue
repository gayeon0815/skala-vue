<script setup>
defineProps({
  currentRegion: { type: String, default: '전체' },
  regions: {
    type: Array,
    default: () => ['전체', '내 위치', '서울/경기', '강원', '충청', '전라', '경상', '제주'],
  },
})

const emit = defineEmits(['update-region'])

const iconFor = (region) => {
  if (region === '전체') return 'fa-solid fa-layer-group'
  if (region === '내 위치') return 'fa-solid fa-location-crosshairs'
  return 'fa-solid fa-location-dot'
}

const selectRegion = (value) => {
  emit('update-region', value)
}
</script>

<template>
  <div class="region-row">
    <button
      v-for="region in regions"
      :key="region"
      class="region-chip"
      :class="{ active: currentRegion === region }"
      @click="selectRegion(region)"
    >
      <i :class="iconFor(region)"></i>
      {{ region }}
    </button>
  </div>
</template>

<style scoped>
.region-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.region-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: 2px solid #f1ecff;
  border-radius: 999px;
  background-color: #ffffff;
  color: #a6a0be;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}
.region-chip:hover {
  border-color: #ff7faa;
  color: #ff7faa;
}
.region-chip.active {
  border-color: #45415f;
  background-color: #45415f;
  color: #ffffff;
}
</style>
