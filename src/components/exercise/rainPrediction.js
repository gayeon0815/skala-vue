// 강수 기준 취소 판정
const predictByRain = (hourly, gameTime) => {
  const rangeStart = new Date(gameTime.getTime() - 60 * 60 * 1000)
  const rangeEnd = new Date(gameTime.getTime() + 3 * 60 * 60 * 1000)
  const inRange = hourly.filter((h) => {
    const t = new Date(h.time)
    return t >= rangeStart && t <= rangeEnd
  })

  if (inRange.length === 0) return null

  const maxProb = Math.max(...inRange.map((h) => h.probability ?? 0))
  const totalPrecip = inRange.reduce((sum, h) => sum + (h.precip ?? 0), 0)
  const score = maxProb * 0.7 + Math.min(totalPrecip * 10, 30)

  return { score, maxProb, totalPrecip }
}

// 폭염 기준 판정: KBO는 '경기 시각'이 아니라 '그날 하루 중 최고' 체감온도로 판단해요
// (기상청 폭염특보 발효 기준 그대로: 33℃ 주의보 / 35℃ 경보 / 38℃ 중대경보)
const predictByHeat = (hourly, gameDateStr) => {
  const sameDay = hourly.filter((h) => h.time.slice(0, 10) === gameDateStr)
  if (sameDay.length === 0) return null

  const maxFeelsLike = Math.max(...sameDay.map((h) => h.feelsLike ?? -Infinity))
  if (!Number.isFinite(maxFeelsLike)) return null

  return { maxFeelsLike }
}

export function predictRainCancellation({ isDome, gameTime, hourly }) {
  if (isDome) {
    return { label: '실내구장 · 정상 개최', color: '#8b87a6', reason: '' }
  }
  if (!hourly || hourly.length === 0) {
    return { label: '예보 정보 없음', color: '#9ca3af', reason: '' }
  }

  const gameDateStr = `${gameTime.getFullYear()}-${String(gameTime.getMonth() + 1).padStart(2, '0')}-${String(gameTime.getDate()).padStart(2, '0')}`
  const heat = predictByHeat(hourly, gameDateStr)

  // 폭염중대경보 (체감 38℃↑): 취소 가능
  if (heat && heat.maxFeelsLike >= 38) {
    return {
      label: '폭염중대경보 · 취소 가능 🔴',
      color: '#e53935',
      reason: `오늘 최고 체감온도 ${Math.round(heat.maxFeelsLike)}°C`,
    }
  }
  // 폭염경보 (체감 35℃↑): 지연 개최 가능
  if (heat && heat.maxFeelsLike >= 35) {
    return {
      label: '폭염경보 · 지연개최 가능 🟠',
      color: '#fb8c00',
      reason: `오늘 최고 체감온도 ${Math.round(heat.maxFeelsLike)}°C`,
    }
  }
  // 폭염주의보 (체감 33℃↑): 정상 개최
  if (heat && heat.maxFeelsLike >= 33) {
    return {
      label: '폭염주의보 · 정상개최 🟡',
      color: '#fdd835',
      reason: `오늘 최고 체감온도 ${Math.round(heat.maxFeelsLike)}°C`,
    }
  }

  const rain = predictByRain(hourly, gameTime)
  if (!rain) {
    return {
      label: '예보 정보 없음',
      color: '#9ca3af',
      reason: '예보 제공 범위를 벗어난 경기예요.',
    }
  }

  const { score, maxProb, totalPrecip } = rain
  let label, color
  if (score >= 75) {
    label = '취소 유력 🔴'
    color = '#e53935'
  } else if (score >= 50) {
    label = '취소 가능성 높음 🟠'
    color = '#fb8c00'
  } else if (score >= 25) {
    label = '지켜봐야 함 🟡'
    color = '#fdd835'
  } else {
    label = '정상 개최 예상 🟢'
    color = '#43a047'
  }

  const reason =
    maxProb > 0 || totalPrecip > 0
      ? `강수확률 ${Math.round(maxProb)}% · 예상 강수량 ${totalPrecip.toFixed(1)}mm`
      : '강수 예보 없음'

  return { label, color, reason }
}
