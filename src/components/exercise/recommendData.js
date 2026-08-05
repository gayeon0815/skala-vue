/* ─────────────────────────────────────────────
   날씨 상태별 추천 목록
   ───────────────────────────────────────────── */
export const songsByStatus = {
  맑음: [
    { title: 'Good Day', artist: '아이유' },
    { title: '여름 안에서', artist: '듀스' },
    { title: 'Palette', artist: '아이유' },
    { title: '벚꽃 엔딩', artist: '버스커 버스커' },
    { title: 'Butterfly', artist: '러브홀릭스' },
    { title: '오늘도 빛나는 너에게', artist: '마마무' },
    { title: 'Summer Days', artist: '잔나비' },
    { title: '작은 것들을 위한 시', artist: 'BTS' },
    { title: '해변으로 가요', artist: '키보이스' },
    { title: 'Sunny Days', artist: '볼빨간사춘기' },
  ],
  비: [
    { title: '비 오는 날 듣기 좋은 노래', artist: '에피톤 프로젝트' },
    { title: 'Rain', artist: '태연' },
    { title: '먼지가 되어', artist: '이승철' },
    { title: '비처럼 음악처럼', artist: '김현식' },
    { title: '창밖의 빗물', artist: '델리스파이스' },
    { title: 'Umbrella', artist: 'Rihanna' },
    { title: '빗속에서', artist: '이문세' },
    { title: '소나기', artist: '아이유' },
    { title: '장마', artist: '검정치마' },
    { title: 'Raindrops', artist: '백예린' },
  ],
  구름: [
    { title: '흐린 가을 하늘에 편지를 써', artist: '김광석' },
    { title: 'Cloud', artist: '오존' },
    { title: '구름', artist: '언니네 이발관' },
    { title: '흐릿한 오후', artist: '십센치' },
    { title: 'Grey', artist: '백예린' },
    { title: '나른한 오후', artist: '스탠딩 에그' },
    { title: '어떤가요', artist: '한로로' },
    { title: 'Blue', artist: '어반자카파' },
    { title: '구름이 지나가면', artist: '옥상달빛' },
    { title: '무중력', artist: '적재' },
  ],
}

export const foodsByStatus = {
  맑음: [
    { name: '냉면', emoji: '🍜' },
    { name: '샐러드 볼', emoji: '🥗' },
    { name: '빙수', emoji: '🍧' },
    { name: '피크닉 샌드위치', emoji: '🥪' },
    { name: '아이스 아메리카노', emoji: '🧊' },
    { name: '수박화채', emoji: '🍉' },
    { name: '초밥', emoji: '🍣' },
    { name: '콩국수', emoji: '🥛' },
    { name: '아이스크림', emoji: '🍦' },
    { name: '비빔국수', emoji: '🍝' },
  ],
  비: [
    { name: '김치전과 막걸리', emoji: '🥞' },
    { name: '칼국수', emoji: '🍲' },
    { name: '떡볶이', emoji: '🌶️' },
    { name: '순대국밥', emoji: '🍚' },
    { name: '해물파전', emoji: '🦐' },
    { name: '어묵탕', emoji: '🍢' },
    { name: '수제비', emoji: '🥣' },
    { name: '따뜻한 우동', emoji: '🍜' },
    { name: '만두전골', emoji: '🥟' },
    { name: '라면', emoji: '🍥' },
  ],
  구름: [
    { name: '크림 파스타', emoji: '🍝' },
    { name: '따뜻한 라떼', emoji: '☕' },
    { name: '치즈 토스트', emoji: '🧀' },
    { name: '단호박 스프', emoji: '🥣' },
    { name: '팬케이크', emoji: '🥞' },
    { name: '규동', emoji: '🍱' },
    { name: '마카롱과 홍차', emoji: '🍪' },
    { name: '리조또', emoji: '🍚' },
    { name: '샌드위치', emoji: '🥪' },
    { name: '핫초코', emoji: '🍫' },
  ],
}

/* ─────────────────────────────────────────────
   오늘의 질문 (랜덤 저널링)
   ───────────────────────────────────────────── */
export const dailyQuestions = [
  '오늘 날씨를 색깔로 표현한다면 무슨 색일까요?',
  '오늘 하루 중 가장 기억에 남는 순간은 언제였나요?',
  '이런 날씨엔 꼭 하고 싶은 일이 있나요?',
  '오늘 나에게 해주고 싶은 말은?',
  '최근에 웃었던 일을 하나 떠올려보세요.',
  '오늘 창밖 풍경은 어땠나요?',
  '지금 이 순간 가장 필요한 건 무엇인가요?',
  '오늘 만난 사람 중 고마운 사람이 있나요?',
  '이 날씨에 어울리는 향기가 있다면?',
  '내일의 나에게 한 줄 남긴다면?',
  '오늘 새롭게 알게 된 것이 있나요?',
  '요즘 자주 듣는 노래가 있다면 무엇인가요?',
  '오늘 하루를 한 단어로 정리한다면?',
  '지금 떠오르는 사람이 있나요? 왜 떠올랐을까요?',
  '오늘 나를 조금 힘들게 한 건 무엇이었나요?',
  '이번 주말에 하고 싶은 일 하나만 적어보세요.',
  '오늘 먹은 것 중 가장 맛있었던 건?',
  '최근에 마음이 편안했던 장소는 어디인가요?',
  '오늘 하루, 스스로에게 몇 점을 주고 싶나요?',
  '이 계절이 지나기 전에 꼭 해보고 싶은 일은?',
]

// 배열에서 랜덤으로 하나 뽑기
export const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]
