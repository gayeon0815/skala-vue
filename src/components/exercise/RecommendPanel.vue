<script setup>
import { computed, onMounted } from 'vue'
import { useMoodStore } from '@/stores/moodStore'

const props = defineProps({
  status: { type: String, default: '맑음' },
})

const moodStore = useMoodStore()

onMounted(() => {
  moodStore.ensureDaily()
})

const statusLabel = computed(() => `${props.status} 날엔`)

const answerModel = computed({
  get: () => moodStore.answer,
  set: (val) => moodStore.setAnswer(val),
})

const saveAnswer = () => {
  if (!moodStore.answer.trim()) return
  const KEY = 'weather-diary-journal'
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? JSON.parse(raw) : []
    // 같은 날 같은 질문이면 덮어쓰기
    const today = new Date().toLocaleDateString('ko-KR')
    const existing = list.findIndex((e) => e.date === today && e.question === moodStore.question)
    const entry = {
      id: Date.now(),
      question: moodStore.question,
      answer: moodStore.answer.trim(),
      date: today,
    }
    if (existing !== -1) list[existing] = entry
    else list.unshift(entry)
    localStorage.setItem(KEY, JSON.stringify(list))
    moodStore.markSaved()
  } catch (err) {
    console.warn('일기 저장 실패', err)
  }
}
</script>

<template>
  <aside class="recommend-panel">
    <div class="panel-box">
      <div class="box-header">
        <h3 class="box-title"><i class="fa-solid fa-wand-magic-sparkles"></i> 오늘의 추천</h3>
        <button class="refresh-btn" @click="moodStore.rollRecommend()">
          <i class="fa-solid fa-shuffle"></i>
        </button>
      </div>
      <p class="status-hint">{{ statusLabel }}</p>

      <div class="rec-item">
        <span class="rec-label"><i class="fa-solid fa-music"></i> 노래</span>
        <p class="rec-main">{{ moodStore.song?.title }}</p>
        <p class="rec-sub">{{ moodStore.song?.artist }}</p>
      </div>

      <div class="rec-item">
        <span class="rec-label"><i class="fa-solid fa-utensils"></i> 음식</span>
        <p class="rec-main">{{ moodStore.food?.emoji }} {{ moodStore.food?.name }}</p>
      </div>
    </div>

    <div class="panel-box">
      <div class="box-header">
        <h3 class="box-title"><i class="fa-solid fa-feather-pointed"></i> 오늘의 질문</h3>
        <button class="refresh-btn" @click="moodStore.rollQuestion()">
          <i class="fa-solid fa-shuffle"></i>
        </button>
      </div>

      <p class="question-text">{{ moodStore.question }}</p>

      <textarea
        v-model="answerModel"
        class="answer-input"
        placeholder="자유롭게 적어보세요..."
        rows="4"
      ></textarea>

      <button class="save-btn" :disabled="!moodStore.answer.trim()" @click="saveAnswer">
        <i :class="moodStore.isSaved ? 'fa-solid fa-pen-to-square' : 'fa-solid fa-pen'"></i>
        {{ moodStore.isSaved ? '수정하기' : '기록하기' }}
      </button>
    </div>
  </aside>
</template>

<style scoped>
.recommend-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 260px;
  flex-shrink: 0;
}

.panel-box {
  padding: 20px;
  background-color: #ffffff;
  border-radius: 24px;
  box-shadow: 0 12px 30px rgba(69, 65, 95, 0.08);
}

.box-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.box-title {
  margin: 0;
  font-family: 'Jua', 'Pretendard', sans-serif;
  font-size: 15px;
  font-weight: 400;
  color: #45415f;
}
.box-title i {
  color: #ff7faa;
  margin-right: 4px;
}
.refresh-btn {
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 50%;
  background-color: #f1ecff;
  color: #a6a0be;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.refresh-btn:hover {
  background-color: #ff7faa;
  color: #ffffff;
  transform: rotate(180deg);
}

.status-hint {
  margin: 6px 0 14px 0;
  font-size: 12px;
  font-weight: 700;
  color: #a6a0be;
}

.rec-item {
  padding: 12px 14px;
  margin-bottom: 10px;
  background-color: #fbfaff;
  border-radius: 14px;
}
.rec-item:last-child {
  margin-bottom: 0;
}
.rec-label {
  display: inline-block;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #ff7faa;
}
.rec-main {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #45415f;
  line-height: 1.4;
}
.rec-sub {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #a6a0be;
}

.question-text {
  margin: 12px 0;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.6;
  color: #45415f;
}
.answer-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #f1ecff;
  border-radius: 14px;
  font-size: 12px;
  font-family: 'Pretendard', sans-serif;
  color: #45415f;
  background-color: #fbfaff;
  box-sizing: border-box;
  resize: vertical;
  transition: all 0.2s ease;
}
.answer-input::placeholder {
  color: #c7c2de;
}
.answer-input:focus {
  outline: none;
  border-color: #ff7faa;
}

.save-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  border: none;
  border-radius: 999px;
  background-color: #ff7faa;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}
.save-btn:hover:not(:disabled) {
  background-color: #ff5c8a;
}
.save-btn:disabled {
  background-color: #f1ecff;
  color: #c7c2de;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .recommend-panel {
    width: 100%;
  }
}
</style>
