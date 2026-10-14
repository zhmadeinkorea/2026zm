(() => {
  const C = window.BIRTHDAY_CONFIG || {};
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const pad2 = (n) => String(n).padStart(2, "0");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Names ----------
  const dogName = C.dogName || "우리 강아지";
  const fullName = C.fullName || dogName;
  // 받침 유무에 따라 "지미야" / "콩순아"
  function vocative(n) {
    const code = n.charCodeAt(n.length - 1) - 0xac00;
    if (code < 0 || code > 11171) return n;
    return n + (code % 28 ? "아" : "야");
  }
  const callName = vocative(dogName);
  $("#titleName").textContent = callName;
  $("#coverTitle").textContent = `${dogName}.jpg`;
  $("#albumTitle").textContent = `📁 ${dogName} 사진첩`;
  $("#albumSub").textContent = `반짝반짝 우리 ${dogName}`;
  $("#gbSub").textContent = `${dogName}에게 한마디 남겨 주세요`;
  if (C.speech) $("#speech").textContent = C.speech;

  // ---------- Birthday ----------
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const DAY = 86400000;
  let isToday = false;
  let ageNow = 0;
  const tags = [`#${fullName}`];

  if (/^\d{4}-\d{2}-\d{2}$/.test(C.birthDate || "")) {
    const [y, m, d] = C.birthDate.split("-").map(Number);
    const birth = new Date(y, m - 1, d);
    const next = new Date(today.getFullYear(), m - 1, d);
    if (next < today) next.setFullYear(today.getFullYear() + 1);
    const daysLeft = Math.round((next - today) / DAY);
    const age = next.getFullYear() - y;
    ageNow = age;
    isToday = daysLeft === 0;

    document.title = `${next.getFullYear()} ${callName} 생일 축하해`;
    tags.push(`#${age}번째생일`, `#${next.getFullYear()}.${pad2(m)}.${pad2(d)}`);
    $("#ribbon").textContent = `♡ ${age}번째 생일 파티 ♡`;
    $("#ageBurstText").replaceChildren(String(age), el("small", null, "살"));

    const together = Math.round((today - birth) / DAY) + 1;
    const cards = [
      ["태어난 날", `${y}.${pad2(m)}.${pad2(d)}`, ""],
      ["생일까지", isToday ? "오늘!" : `D-${daysLeft}`, isToday ? "생일 축하해 ★" : `${m}월 ${d}일`],
      ["세상에 온 지", `${together.toLocaleString("ko-KR")}일`, "오늘까지"],
    ];
    for (const [h, big, small] of cards) {
      const card = el("div", "info-card");
      const p = el("p");
      p.append(el("b", null, big), small);
      if (h === "생일까지") {
        const g = el("span", "gauge");
        const fill = el("i");
        fill.style.width = `${Math.round(((365 - daysLeft) / 365) * 100)}%`;
        g.append(fill);
        p.append(g);
      }
      card.append(el("h3", null, h), p);
      $("#info").append(card);
    }
  } else {
    $("#ribbon").textContent = "♡ 생일 파티 ♡";
    $("#ageBurst").hidden = true;
  }
  $("#tags").textContent = tags.join("  ");

  // ---------- Marquee ----------
  const phrase = [`★ ${callName} 생일 축하해`, "♡ 오래오래 건강하자", "★ 사랑해"];
  const marquee = $("#marquee");
  for (let i = 0; i < 18; i++) marquee.append(el("span", null, phrase[i % phrase.length]));

  // ---------- Letter ----------
  if (C.letter) {
    const box = $("#letter");
    for (const line of String(C.letter).split("\n")) box.append(el("p", null, line || " "));
    if (C.letterFrom) box.append(el("p", "from", `— ${C.letterFrom}`));
    $("#letterSection").hidden = false;
  }

  // ---------- Confetti (stars & hearts) ----------
  const confetti = (() => {
    const cv = $("#confetti");
    const ctx = cv.getContext("2d");
    const colors = ["#ff4fa8", "#ffe95c", "#c9b7ff", "#8fd3ff", "#ffffff", "#a9f0d2"];
    let parts = [];
    let raf = 0;
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      cv.width = innerWidth * dpr;
      cv.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    addEventListener("resize", resize);
    resize();
    function star(r) {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const rr = i % 2 ? r * 0.45 : r;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath();
    }
    function heart(r) {
      ctx.beginPath();
      ctx.moveTo(0, r * 0.9);
      ctx.bezierCurveTo(-r * 1.4, 0, -r * 0.6, -r * 1.1, 0, -r * 0.35);
      ctx.bezierCurveTo(r * 0.6, -r * 1.1, r * 1.4, 0, 0, r * 0.9);
      ctx.closePath();
    }
    function burst(n = 120, x = innerWidth / 2, y = innerHeight * 0.35) {
      if (reducedMotion) return;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 3 + Math.random() * 9;
        parts.push({
          x, y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s - 6,
          size: 5 + Math.random() * 7,
          r: Math.random() * 6,
          vr: (Math.random() - 0.5) * 0.25,
          c: colors[i % colors.length],
          shape: i % 3,
          life: 0,
        });
      }
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function tick() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter((p) => p.y < innerHeight + 40 && p.life < 420);
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = "#3b2370";
      for (const p of parts) {
        p.vy += 0.17;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        p.life++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        if (p.shape === 0) star(p.size);
        else if (p.shape === 1) heart(p.size * 0.8);
        else { ctx.beginPath(); ctx.rect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66); }
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      raf = parts.length ? requestAnimationFrame(tick) : 0;
    }
    return { burst };
  })();

  $("#partyBtn").addEventListener("click", (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    confetti.burst(160, r.left + r.width / 2, r.top);
  });
  setTimeout(() => confetti.burst(isToday ? 220 : 110), 500);

  // ---------- Photos ----------
  const SKIP_CAPTION = /^(img|dsc|pxl|kakaotalk|screenshot|photo|image|\d)/i;
  function captionFor(name) {
    if (C.captions && C.captions[name]) return C.captions[name];
    const base = name.replace(/\.[^.]+$/, "");
    return SKIP_CAPTION.test(base) ? "" : base.replace(/[_-]+/g, " ");
  }

  // 내 PC 서버(api/...)가 있으면 그걸 쓰고, 없으면(GitHub Pages) 미리 만든 json 파일을 읽음
  async function getJson(...urls) {
    for (const url of urls) {
      try {
        const r = await fetch(url, { cache: "no-store" });
        if (r.ok) return { url, data: await r.json() };
      } catch { /* try next */ }
    }
    return null;
  }

  let photos = [];
  async function loadPhotos() {
    const res = await getJson("api/photos", "photos.json");
    if (res && Array.isArray(res.data)) photos = res.data;
    renderAlbum();
    renderCover();
  }

  function renderCover() {
    const pick = photos.find((p) => p.name === C.coverPhoto) || photos.find((p) => !p.video);
    if (!pick) return;
    const img = el("img");
    img.src = pick.large || pick.url;
    img.alt = `${dogName} 대표 사진`;
    $("#cover").replaceChildren(img);
  }

  // ---------- Album slideshow ----------
  const track = $("#track");
  const thumbs = $("#thumbs");
  const playBtn = $("#carPlay");
  let slides = [];
  let thumbEls = [];
  let carIdx = 0;
  let playing = !reducedMotion;
  let hovering = false;
  let pausedUntil = 0;

  function renderAlbum() {
    $("#galleryEmpty").hidden = photos.length > 0;
    $("#carousel").hidden = photos.length === 0;
    track.replaceChildren();
    thumbs.replaceChildren();

    slides = photos.map((p, i) => {
      const s = el("button", "slide");
      s.type = "button";
      s.setAttribute("aria-label", `사진 ${i + 1} 크게 보기`);
      if (p.video) {
        const v = el("video");
        v.muted = true;
        v.playsInline = true;
        v.preload = "metadata";
        v.src = p.url + "#t=0.1";
        s.append(v, el("span", "play", "▶ 영상"));
      } else {
        const img = el("img");
        img.loading = i < 3 ? "eager" : "lazy";
        img.decoding = "async";
        img.src = p.thumb || p.url;
        img.alt = captionFor(p.name) || `${dogName} 사진 ${i + 1}`;
        s.append(img);
      }
      s.addEventListener("click", () => {
        if (i === carIdx) openLightbox(i);
        else { goTo(i); holdAutoplay(); }
      });
      track.append(s);
      return s;
    });

    thumbEls = photos.map((p, i) => {
      const t = el("button", "thumb");
      t.type = "button";
      t.setAttribute("aria-label", `${i + 1}번째 사진`);
      if (p.video) t.append(el("span", null, "▶"));
      else {
        const img = el("img");
        img.loading = "lazy";
        img.src = p.thumb || p.url;
        img.alt = "";
        t.append(img);
      }
      t.addEventListener("click", () => { goTo(i); holdAutoplay(); });
      thumbs.append(t);
      return t;
    });

    if (photos.length) setActive(0);
    updatePlayBtn();
  }

  function setActive(i) {
    slides[carIdx]?.classList.remove("is-active");
    thumbEls[carIdx]?.classList.remove("is-active");
    carIdx = i;
    slides[i].classList.add("is-active");
    thumbEls[i].classList.add("is-active");
    $("#carCount").textContent = `${pad2(i + 1)} / ${pad2(photos.length)}`;
    $("#carCap").textContent = captionFor(photos[i].name);
    const t = thumbEls[i];
    // 즉시 이동: 크롬은 부드러운 스크롤이 두 개 겹치면 슬라이드 쪽 이동을 취소함
    thumbs.scrollLeft = t.offsetLeft - (thumbs.clientWidth - t.offsetWidth) / 2;
  }

  function goTo(i, behavior) {
    if (!photos.length) return;
    i = (i + photos.length) % photos.length;
    const s = slides[i];
    track.scrollTo({
      left: s.offsetLeft - (track.clientWidth - s.offsetWidth) / 2,
      behavior: behavior || (reducedMotion ? "auto" : "smooth"),
    });
    setActive(i);
  }

  // 스와이프/스크롤로 넘겼을 때 가운데 사진을 활성화
  let scrollRaf = 0;
  track.addEventListener("scroll", () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      const center = track.scrollLeft + track.clientWidth / 2;
      let best = carIdx;
      let bestD = Infinity;
      slides.forEach((s, i) => {
        const dist = Math.abs(s.offsetLeft + s.offsetWidth / 2 - center);
        if (dist < bestD) { bestD = dist; best = i; }
      });
      if (best !== carIdx) setActive(best);
    });
  }, { passive: true });

  const holdAutoplay = () => { pausedUntil = Date.now() + 8000; };
  for (const ev of ["pointerdown", "wheel", "touchstart"]) track.addEventListener(ev, holdAutoplay, { passive: true });
  track.addEventListener("mouseenter", () => { hovering = true; });
  track.addEventListener("mouseleave", () => { hovering = false; });

  $("#carPrev").addEventListener("click", () => { goTo(carIdx - 1); holdAutoplay(); });
  $("#carNext").addEventListener("click", () => { goTo(carIdx + 1); holdAutoplay(); });

  function updatePlayBtn() {
    playBtn.textContent = playing ? "❚❚ 멈춤" : "▶ 자동 넘기기";
  }
  playBtn.addEventListener("click", () => { playing = !playing; updatePlayBtn(); });

  setInterval(() => {
    if (!playing || hovering || document.hidden || !lb.hidden || Date.now() < pausedUntil || photos.length < 2) return;
    goTo(carIdx + 1);
  }, 3800);

  addEventListener("resize", () => { if (photos.length) goTo(carIdx, "auto"); });

  // ---------- Lightbox ----------
  const lb = $("#lightbox");
  let cur = 0;
  function openLightbox(i) {
    cur = i;
    showCurrent();
    lb.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lb.hidden = true;
    $("#lbMedia").replaceChildren();
    document.body.style.overflow = "";
    if (cur !== carIdx) goTo(cur, "auto");
  }
  function showCurrent() {
    const p = photos[cur];
    let media;
    if (p.video) {
      media = el("video");
      media.controls = true;
      media.autoplay = true;
      media.playsInline = true;
      media.src = p.url;
    } else {
      media = el("img");
      media.src = p.large || p.url;
      media.alt = captionFor(p.name) || `${dogName} 사진 ${cur + 1}`;
    }
    $("#lbMedia").replaceChildren(media);
    $("#lbTitle").textContent = `사진_${pad2(cur + 1)}.jpg`;
    $("#lbCaption").textContent = captionFor(p.name) || `${pad2(cur + 1)} / ${pad2(photos.length)}`;
    // 다음 사진 미리 불러오기
    const nx = photos[(cur + 1) % photos.length];
    if (nx && !nx.video) new Image().src = nx.large || nx.url;
  }
  const step = (d) => {
    cur = (cur + d + photos.length) % photos.length;
    showCurrent();
  };
  $("#lbClose").addEventListener("click", closeLightbox);
  $("#lbPrev").addEventListener("click", () => step(-1));
  $("#lbNext").addEventListener("click", () => step(1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
  let touchX = null;
  lb.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    touchX = null;
  });

  // ---------- Guestbook ----------
  const list = $("#messages");
  function renderMessage(m, prepend) {
    const li = el("li", "msg");
    const foot = el("footer");
    foot.append(el("b", null, `♡ ${m.name}`), el("span", null, m.time || ""));
    li.append(el("p", null, m.text), foot);
    prepend ? list.prepend(li) : list.append(li);
  }

  // 메시지 저장 방식: "server"(내 PC) / "google"(구글 폼) / null(읽기 전용)
  const G = C.guestbook || {};
  const googleReady = Boolean(G.formAction && G.nameField && G.textField);
  let saveMode = null;

  // 구글 시트 시간("2026. 10. 13 오후 3:21:00" 등)을 "2026-10-13 15:21"로 통일
  function normalizeTime(s) {
    const pad = (n) => String(n).padStart(2, "0");
    let m = s.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?\s*(오전|오후)?\s*(\d{1,2}):(\d{2})/);
    if (m) {
      let h = Number(m[5]);
      if (m[4] === "오후" && h < 12) h += 12;
      if (m[4] === "오전" && h === 12) h = 0;
      return `${m[1]}-${pad(m[2])}-${pad(m[3])} ${pad(h)}:${m[6]}`;
    }
    m = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/);
    if (m) return `${m[3]}-${pad(m[1])}-${pad(m[2])} ${pad(m[4])}:${m[5]}`;
    return s;
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (quoted) {
        if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (ch === '"') quoted = false;
        else cell += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ",") { row.push(cell); cell = ""; }
      else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); rows.push(row); row = []; cell = "";
      } else cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }

  async function loadSheetMessages() {
    if (!G.sheetCsv) return [];
    try {
      const r = await fetch(G.sheetCsv, { cache: "no-store" });
      if (!r.ok) return [];
      // 시트 열 순서: 타임스탬프, 이름, 메시지
      return parseCsv(await r.text())
        .slice(1)
        .filter((c) => c[1] && c[2])
        .map((c) => ({ name: c[1].trim().slice(0, 20), text: c[2].trim().slice(0, 300), time: normalizeTime(c[0]) }));
    } catch {
      return [];
    }
  }

  async function loadMessages() {
    let msgs = [];
    const res = await getJson("api/messages", "messages.json");
    if (res && Array.isArray(res.data)) {
      msgs = res.data;
      if (res.url.startsWith("api/")) saveMode = "server";
    }
    if (!saveMode) {
      msgs = msgs.concat(await loadSheetMessages());
      if (googleReady) saveMode = "google";
    }
    $("#gbForm").closest(".win").hidden = !saveMode;
    if (!msgs.length && !saveMode) {
      $("#guestbookSection").hidden = true;
      return;
    }
    msgs.sort((a, b) => String(b.time).localeCompare(String(a.time)));
    list.replaceChildren();
    msgs.forEach((m) => renderMessage(m, false));
  }

  async function saveMessage(name, text) {
    if (saveMode === "server") {
      const r = await fetch("api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, text }),
      });
      if (!r.ok) throw new Error();
      return r.json();
    }
    // 구글 폼은 응답을 읽을 수 없는 방식(no-cors)이라 보낸 것으로 간주
    const body = new URLSearchParams();
    body.append(G.nameField, name);
    body.append(G.textField, text);
    await fetch(G.formAction, { method: "POST", mode: "no-cors", body });
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return { name, text, time: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}` };
  }

  $("#gbForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.currentTarget.querySelector("button");
    const status = $("#gbStatus");
    const name = $("#gbName").value.trim();
    const text = $("#gbText").value.trim();
    if (!name || !text || !saveMode) return;
    btn.disabled = true;
    status.textContent = "보내는 중…";
    try {
      renderMessage(await saveMessage(name, text), true);
      $("#gbText").value = "";
      status.textContent = "고마워요 ♡";
      const rect = btn.getBoundingClientRect();
      confetti.burst(80, rect.left + rect.width / 2, rect.top);
    } catch {
      status.textContent = "앗, 저장하지 못했어요. 다시 시도해 주세요.";
    } finally {
      btn.disabled = false;
    }
  });

  // ---------- 8비트 생일 BGM (음원 파일 없이 브라우저에서 직접 연주) ----------
  const bgm = (() => {
    const box = $("#bgm");
    const btn = $("#bgmPlay");
    const freq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
    const M = { F2: 41, G2: 43, C3: 48, G4: 67, A4: 69, B4: 71, C5: 72, D5: 74, E5: 76, F5: 77, G5: 79 };
    // 생일 축하합니다 [음, 박]
    const melody = [
      ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
      ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
      ["G4", .75], ["G4", .25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
      ["F5", .75], ["F5", .25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 3],
    ];
    // 못갖춘마디(1박) 다음부터의 베이스 [시작 박, 음]
    const bass = [[0, "C3"], [3, "G2"], [6, "G2"], [9, "C3"], [12, "C3"], [15, "F2"], [18, "C3"], [21, "G2"], [22, "C3"]];
    const BEAT = 0.4;
    let ctx = null;
    let master = null;
    let timer = 0;
    let nextStart = 0;

    function tone(f, t, dur, type, vol) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
      g.gain.setValueAtTime(vol, t + dur * 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(master);
      o.start(t);
      o.stop(t + dur + 0.02);
    }

    function scheduleSong(t0) {
      let t = t0;
      for (const [n, b] of melody) {
        tone(freq(M[n]), t, b * BEAT * 0.9, "square", 0.06);
        t += b * BEAT;
      }
      bass.forEach(([start, n], i) => {
        const end = i + 1 < bass.length ? bass[i + 1][0] : 25;
        for (let k = start; k < end; k++) tone(freq(M[n]), t0 + (k + 1) * BEAT, BEAT * 0.45, "triangle", 0.16);
      });
      return t + BEAT * 2; // 한 바퀴 끝나고 잠깐 쉬기
    }

    function loop() {
      nextStart = scheduleSong(nextStart);
      timer = setTimeout(loop, (nextStart - ctx.currentTime - 0.5) * 1000);
    }

    function play() {
      if (ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.7;
      master.connect(ctx.destination);
      nextStart = ctx.currentTime + 0.1;
      loop();
      box.classList.add("playing");
      btn.textContent = "❚❚";
      btn.setAttribute("aria-label", "생일 노래 멈춤");
    }

    function stop() {
      if (!ctx) return;
      clearTimeout(timer);
      ctx.close();
      ctx = null;
      box.classList.remove("playing");
      btn.textContent = "▶";
      btn.setAttribute("aria-label", "생일 노래 재생");
    }

    btn.addEventListener("click", () => (ctx ? stop() : play()));
    return { play, stop };
  })();

  // ---------- 케이크 촛불 끄기 ----------
  (() => {
    const wrap = $("#candles");
    const msg = $("#cakeMsg");
    const blowBtn = $("#blowBtn");
    const relightBtn = $("#relightBtn");
    const count = Math.min(Math.max(ageNow || 1, 1), 20);
    const defaultMsg = msg.textContent;
    $("#cakeSub").textContent = `촛불 ${count}개를 모두 꺼 주세요`;

    const candles = Array.from({ length: count }, (_, i) => {
      const c = el("button", "candle");
      c.type = "button";
      c.setAttribute("aria-label", `${i + 1}번째 촛불 끄기`);
      c.append(el("span", "flame"));
      c.addEventListener("click", () => blowOut(c));
      wrap.append(c);
      return c;
    });

    const lit = () => candles.filter((c) => !c.classList.contains("out"));

    function blowOut(c) {
      if (c.classList.contains("out")) return;
      c.classList.add("out");
      const left = lit().length;
      if (left === 0) celebrate();
      else if (!msg.classList.contains("done")) msg.textContent = `남은 촛불 ${left}개!`;
    }

    function celebrate() {
      stopMic();
      msg.classList.add("done");
      msg.textContent = `🎉 소원 빌었어? ${callName} ${count}살 축하해! ♡`;
      relightBtn.hidden = false;
      blowBtn.hidden = true;
      const r = wrap.getBoundingClientRect();
      confetti.burst(180, r.left + r.width / 2, r.top);
      setTimeout(() => confetti.burst(120, innerWidth * 0.2, innerHeight * 0.3), 350);
      setTimeout(() => confetti.burst(120, innerWidth * 0.8, innerHeight * 0.3), 650);
      bgm.play();
    }

    relightBtn.addEventListener("click", () => {
      candles.forEach((c) => c.classList.remove("out"));
      msg.classList.remove("done");
      msg.textContent = defaultMsg;
      relightBtn.hidden = true;
      blowBtn.hidden = false;
    });

    // 마이크로 "후~" 불기
    let stream = null;
    let actx = null;
    let raf = 0;
    let stopAt = 0;

    function stopMic() {
      cancelAnimationFrame(raf);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (actx) actx.close();
      stream = null;
      actx = null;
      blowBtn.textContent = "🎤 후~ 불기";
      blowBtn.disabled = false;
    }

    blowBtn.addEventListener("click", async () => {
      if (stream) { stopMic(); return; }
      if (!navigator.mediaDevices?.getUserMedia) {
        msg.textContent = "이 브라우저에서는 마이크를 쓸 수 없어요. 촛불을 직접 눌러 주세요!";
        return;
      }
      blowBtn.disabled = true;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        blowBtn.disabled = false;
        msg.textContent = "마이크를 쓸 수 없어요. 촛불을 직접 눌러서 꺼 주세요!";
        return;
      }
      const AC = window.AudioContext || window.webkitAudioContext;
      actx = new AC();
      const analyser = actx.createAnalyser();
      analyser.fftSize = 1024;
      actx.createMediaStreamSource(stream).connect(analyser);
      const buf = new Float32Array(analyser.fftSize);
      blowBtn.disabled = false;
      blowBtn.textContent = "🎤 듣는 중… (그만)";
      msg.textContent = "지금 마이크에 대고 \"후~\" 불어 보세요!";
      stopAt = Date.now() + 20000;
      let last = 0;
      const listen = () => {
        analyser.getFloatTimeDomainData(buf);
        let sum = 0;
        for (const v of buf) sum += v * v;
        const rms = Math.sqrt(sum / buf.length);
        const now = Date.now();
        if (rms > 0.12 && now - last > 110) {
          const remaining = lit();
          if (remaining.length) blowOut(remaining[Math.floor(Math.random() * remaining.length)]);
          last = now;
        }
        if (!stream) return;
        if (now > stopAt) { stopMic(); return; }
        raf = requestAnimationFrame(listen);
      };
      listen();
    });
  })();

  // ---------- 반짝이 커서 ----------
  if (!reducedMotion) {
    const glyphs = ["★", "♡", "✦", "♥", "✧"];
    const colors = ["#ff4fa8", "#ffe95c", "#c9b7ff", "#8fd3ff", "#ffffff"];
    let lastSpark = 0;
    addEventListener("pointermove", (e) => {
      const now = performance.now();
      if (now - lastSpark < 45) return;
      lastSpark = now;
      const s = el("span", "spark", glyphs[Math.floor(Math.random() * glyphs.length)]);
      s.style.left = `${e.clientX + (Math.random() - 0.5) * 14}px`;
      s.style.top = `${e.clientY + (Math.random() - 0.5) * 14}px`;
      s.style.color = colors[Math.floor(Math.random() * colors.length)];
      s.style.fontSize = `${10 + Math.random() * 10}px`;
      s.addEventListener("animationend", () => s.remove());
      document.body.append(s);
    }, { passive: true });
  }

  // ---------- 비밀 코드: 대표 사진 5번 연타 or 키보드로 jimmy ----------
  (() => {
    const svgNS = "http://www.w3.org/2000/svg";
    const pawColors = ["#ff4fa8", "#c9b7ff", "#8fd3ff", "#ffe95c", "#ffffff"];
    let busy = false;

    function pawWalk() {
      if (busy) return;
      busy = true;
      const toast = $("#eggToast");
      const code = dogName.charCodeAt(dogName.length - 1) - 0xac00;
      const ga = code >= 0 && code <= 11171 && code % 28 ? "이" : "가";
      toast.textContent = `🐾 ${dogName}${ga} 지나갔어요!`;
      toast.hidden = false;
      toast.style.animation = "none";
      void toast.offsetWidth;
      toast.style.animation = "";

      const steps = 16;
      const startY = innerHeight * (0.55 + Math.random() * 0.3);
      const endY = innerHeight * (0.15 + Math.random() * 0.25);
      const angle = Math.atan2(endY - startY, innerWidth) * 180 / Math.PI + 90;
      for (let i = 0; i < steps; i++) {
        setTimeout(() => {
          const t = i / (steps - 1);
          const side = i % 2 ? 1 : -1;
          const x = -20 + t * (innerWidth + 10);
          const y = startY + (endY - startY) * t + side * 18;
          const svg = document.createElementNS(svgNS, "svg");
          svg.setAttribute("class", "paw-stamp");
          svg.style.left = `${x}px`;
          svg.style.top = `${y}px`;
          svg.style.rotate = `${angle + side * 12}deg`;
          svg.style.fill = pawColors[i % pawColors.length];
          const use = document.createElementNS(svgNS, "use");
          use.setAttribute("href", "#paw");
          svg.append(use);
          svg.addEventListener("animationend", (e) => { if (e.animationName === "stamp-out") svg.remove(); });
          document.body.append(svg);
        }, i * 110);
      }
      setTimeout(() => { busy = false; toast.hidden = true; }, steps * 110 + 4000);
    }

    let taps = [];
    $("#cover").addEventListener("click", () => {
      const now = Date.now();
      taps = taps.filter((t) => now - t < 2500);
      taps.push(now);
      if (taps.length >= 5) { taps = []; pawWalk(); }
    });

    let typed = "";
    addEventListener("keydown", (e) => {
      if ((e.target instanceof Element && e.target.closest("input, textarea")) || e.key.length !== 1) return;
      typed = (typed + e.key.toLowerCase()).slice(-5);
      if (typed === "jimmy") pawWalk();
    });
  })();

  loadPhotos();
  loadMessages();
})();
