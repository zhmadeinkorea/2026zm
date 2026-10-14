// ✏️ 이 파일만 고치면 페이지 내용이 바뀝니다. (저장 후 브라우저 새로고침)
window.BIRTHDAY_CONFIG = {
  dogName: "지미",             // 이름
  fullName: "최지미",          // 성 + 이름
  birthDate: "2011-10-19",     // 태어난 날 (YYYY-MM-DD)

  // 생일 편지 (선택, 비워 두면 숨김 / 줄바꿈은 \n)
  letter: "",
  letterFrom: "",

  // 사진첩 창 제목 / 사진첩 아래 문구
  albumTitle: "째지미 사진첩",
  albumSub: "말랑유과아기강아지",

  // 대표 사진 옆 말풍선
  speech: "와 줘서 고마워 멍! 𐔌՞. .՞𐦯",

  // 케이크: 애칭, 촛불을 다 껐을 때 문구 ({age}는 나이로 바뀜)
  nickname: "째지미",
  cakeMessage: "째지미 {age}살 생일 축하해 💕",

  // 대표 사진 (photos 폴더 안 파일명). 비워 두면 첫 번째 사진
  coverPhoto: "KakaoTalk_20261012_151417164.jpg",

  // GitHub에 올렸을 때 새 축하 메시지를 받는 구글 폼 연결 (비워 두면 받은 메시지만 보여 줌)
  // 내 PC 서버(start.bat)로 열 때는 이 설정 없이도 메시지를 받습니다.
  guestbook: {
    formAction: "https://docs.google.com/forms/d/e/1FAIpQLSd7J70TKuYn147LOm3LwFDVq8FERyVCNbJxeqTVYNBEGrrwUA/formResponse",
    nameField: "entry.1160195069",   // 이름
    textField: "entry.959843970",    // 메시지
    sheetCsv: "https://docs.google.com/spreadsheets/d/e/2PACX-1vREj_3xUoo4wkhJUXpxzr55VymTLmIKtZkImtKF6Uor4cKjpuVCiOJQgP6w2OnmnLUvZohuS38G3FB4/pub?gid=1559182781&single=true&output=csv",
  },

  // 사진 설명 (선택) — "파일명": "설명"
  captions: {
    // "01.jpg": "처음 산책 나간 날",
  },
};
