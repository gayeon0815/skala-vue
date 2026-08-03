<script setup>
defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close'])

const formatHour = (isoString, index) => {
  if (index === 0) return '지금'
  const hour = Number(isoString.slice(11, 13))
  return `${hour}시`
}

const weatherIcon = (status) => {
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
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-box">
      <button class="close-btn" @click="emit('close')">
        <i class="fa-solid fa-xmark"></i>
      </button>

      <h3 class="modal-title">
        <i class="fa-solid fa-location-dot"></i> {{ cityItem.name }} 시간별 예보
      </h3>
      <p class="modal-subtitle">{{ cityItem.temp }}°C · {{ cityItem.status }}</p>

      <div class="hourly-scroll">
        <div v-for="(hour, index) in cityItem.hourly" :key="hour.time" class="hourly-item">
          <span class="hourly-time">{{ formatHour(hour.time, index) }}</span>
          <i :class="weatherIcon(hour.status)" class="hourly-icon"></i>
          <span class="hourly-temp">{{ hour.temp }}°</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background-color: rgba(69, 65, 95, 0.35);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-box {
  position: relative;
  width: 100%;
  max-width: 420px;
  background-color: #ffffff;
  border-radius: 24px;
  padding: 28px 24px;
  box-shadow: 0 24px 60px rgba(69, 65, 95, 0.25);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background-color: #f1ecff;
  color: #a6a0be;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn:hover {
  background-color: #ff7faa;
  color: #ffffff;
}

.modal-title {
  margin: 0 0 4px 0;
  font-family: 'Jua', 'Pretendard', sans-serif;
  font-size: 18px;
  font-weight: 400;
  color: #45415f;
}
.modal-subtitle {
  margin: 0 0 20px 0;
  font-size: 13px;
  font-weight: 600;
  color: #a6a0be;
}

.hourly-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 6px;
}
.hourly-item {
  flex-shrink: 0;
  width: 62px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
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
  font-size: 18px;
  color: #ffb648;
}
.hourly-temp {
  font-size: 14px;
  font-weight: 800;
  color: #45415f;
}
</style>
