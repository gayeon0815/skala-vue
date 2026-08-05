import { defineStore } from 'pinia'
import {
  songsByStatus,
  foodsByStatus,
  dailyQuestions,
  pickRandom,
} from '@/components/exercise/recommendData'

const STORAGE_KEY = 'weather-diary-daily'

// 오늘 날짜 문자열 (YYYY-MM-DD)
const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const loadDaily = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw)
    // 날짜가 오늘이 아니면 무효 처리 → 새로 뽑음
    return saved.date === todayStr() ? saved : null
  } catch {
    return null
  }
}

export const useMoodStore = defineStore('mood', {
  state: () => {
    const saved = loadDaily()
    return {
      currentStatus: saved?.status ?? '맑음',
      song: saved?.song ?? null,
      food: saved?.food ?? null,
      question: saved?.question ?? '',
      answer: saved?.answer ?? '',
      isSaved: saved?.isSaved ?? false,
      userPicked: saved?.userPicked ?? false,
      date: saved?.date ?? todayStr(),
    }
  },

  actions: {
    persist() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          date: this.date,
          status: this.currentStatus,
          song: this.song,
          food: this.food,
          question: this.question,
          answer: this.answer,
          isSaved: this.isSaved,
          userPicked: this.userPicked,
        }),
      )
    },

    // 앱 시작 시 호출 - 오늘 뽑은 게 없으면 새로 뽑음
    ensureDaily() {
      if (this.date !== todayStr()) {
        this.date = todayStr()
        this.song = null
        this.food = null
        this.question = ''
        this.answer = ''
        this.isSaved = false
        this.userPicked = false
      }
      if (!this.song || !this.food) this.rollRecommend()
      if (!this.question) this.rollQuestion()
    },

    // 사용자가 카드를 직접 클릭했을 때
    setStatus(status) {
      const changed = this.currentStatus !== status
      this.currentStatus = status
      this.userPicked = true
      if (changed) this.rollRecommend()
      else this.persist()
    },

    // '내 위치' 날씨가 로드됐을 때 (사용자가 아직 카드를 안 골랐을 때만 반영)
    setDefaultStatus(status) {
      if (this.userPicked) return
      const changed = this.currentStatus !== status
      this.currentStatus = status
      if (changed) this.rollRecommend()
      else this.persist()
    },

    rollRecommend() {
      const key = songsByStatus[this.currentStatus] ? this.currentStatus : '맑음'
      this.song = pickRandom(songsByStatus[key])
      this.food = pickRandom(foodsByStatus[key])
      this.persist()
    },

    rollQuestion() {
      this.question = pickRandom(dailyQuestions)
      this.answer = ''
      this.isSaved = false
      this.persist()
    },

    setAnswer(text) {
      this.answer = text
      this.persist()
    },

    markSaved() {
      this.isSaved = true
      this.persist()
    },
  },
})
