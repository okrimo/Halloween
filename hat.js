/* 🎩 Cappello Parlante – assegna il codice a ogni invitato (sezione OPZIONALE).
   Riconoscimento del volto con MediaPipe (caricato da internet, elaborazione sul dispositivo). */
const HAT_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
const HAT_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';
let HAT = null, hatDet = null, hatTried = false, hatTimer = 0, hatOpts = { voice: false, photo: false };
const hpick = a => a[Math.random() * a.length | 0];
const hatWait = ms => new Promise(r => setTimeout(r, ms));

const H_THINK = [
  "Hmm… vedo una testa. Una testa piuttosto interessante!",
  "{name}… {name}… questo nome mi ricorda un incantesimo venuto male.",
  "Che fantasia in quel {costume}! Fammi pensare…",
  "Frugo nella tua mente… quanta pizza c'è là dentro!",
  "Difficile, difficile… ah no, è solo il peso dei capelli.",
  "Sono le {ora}: l'ora perfetta per smistare le anime!",
  "Vedo un grande futuro… o forse è solo un grande buffet.",
  "Sei il {n}° che smisto stasera, e il più coraggioso. Forse.",
  "Non muoverti, sto consultando le stelle. E il Wi-Fi.",
  "Silenzio! Sto pensando. Ci metto poco: ho un solo neurone, ed è di feltro.",
  "Bel coraggio presentarti a questa festa, {name}…"
];
const H_VERDICT = [
  "Ho deciso, {name}! Questo è il tuo codice sacro: custodiscilo con la vita!",
  "Il verdetto è arrivato: sei destinato a votare! Ecco il tuo codice.",
  "Il cappello ha parlato! {name}, ricordalo bene: io non lo ripeto.",
  "Ti vedo bene… ti vedo molto bene. Ecco il tuo codice segreto.",
  "Nessun dubbio: per un {costume} come te serve proprio questo codice!",
  "Simsalabim! Un codice è apparso. Non dirlo a nessuno, nemmeno al tuo gatto.",
  "Ho consultato le stelle, il buffet e il mio istinto: ecco il tuo codice.",
  "Vota con saggezza, {name}, e non farti corrompere con le patatine. Codice assegnato!",
  "Sei il {n}° smistato e meriti questo codice. Gli altri erano meno belli.",
  "Ho scelto per te: ecco il codice. Se lo perdi, pagherai con un ballo."
];
const H_COSTUME = [
  [/strega|stregone|mago|maga/i, "Concorrenza sleale tra colleghi di cappello!"],
  [/dracula|vampir/i, "Bel mantello! Ma stai alla larga dal mio buffet all'aglio."],
  [/zombie|scheletro|morto/i, "Sei in splendida forma, considerando tutto."],
  [/fantasma/i, "Ti vedo male… ah no, sei fatto così."],
  [/joker|clown|pagliaccio/i, "Ridi pure, ma i voti sono una cosa seria!"],
  [/mummia/i, "Quante bende! Spero che tu respiri."],
  [/zucca/i, "Una zucca? Finalmente qualcuno con la testa sulle spalle. Più o meno."],
  [/gatto|gatta/i, "Miao? Sì, ti capisco perfettamente."],
  [/diavol|demon/i, "Un diavolo? Allora siamo colleghi nell'ombra."],
  [/frankenstein/i, "Che bei bulloni! Ti hanno montato proprio bene."],
  [/lupo|licantrop/i, "Occhio alla luna piena: i voti non si mordono."]
];
function hatFill(t, p) {
  return t.replace(/{name}/g, p.name.split(' ')[0]).replace(/{costume}/g, (p.costume || 'travestimento').toLowerCase())
    .replace(/{n}/g, db.participants.filter(x => x.hat).length + 1)
    .replace(/{ora}/g, new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
}
function hatSpeak(t) {
  if (!hatOpts.voice || !window.speechSynthesis) return;
  speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'it-IT'; u.pitch = .6; u.rate = .95; speechSynthesis.speak(u);
}

/* ---- Schermate ---- */
V.hat = () => {
  const todo = db.participants.filter(p => !p.hat), n = db.participants.length - todo.length;
  return `<div class="center"><div class="big">🎩</div><h1>CAPPELLO<br>PARLANTE</h1>
  <p>${todo.length ? 'Tocca il tuo nome per scoprire il tuo codice!' : 'Tutti smistati! 🎉'}</p><p class="muted">Smistati: ${n} / ${db.participants.length}</p></div>
  <div class="grid">${todo.map(p => `<button class="btn" style="min-height:90px" onclick="startHat('${p.id}')">${esc(p.name)}</button>`).join('')}</div>
  <div class="center"><label><input type="checkbox" style="width:auto;min-height:0" ${hatOpts.voice ? 'checked' : ''} onchange="hatOpts.voice=this.checked"> 🔊 Voce</label> &nbsp;&nbsp;
  <label><input type="checkbox" style="width:auto;min-height:0" ${hatOpts.photo ? 'checked' : ''} onchange="hatOpts.photo=this.checked"> 📸 Usa lo scatto come foto</label>
  <br><a class="small" onclick="$('#lock').hidden=false">🔒 Admin</a>
  <div id="lock" hidden style="max-width:360px;margin:auto"><input id="lc" type="password" placeholder="Codice admin"><button class="btn sm" onclick="hatUnlock()">ESCI</button><div class="err" id="lerr"></div></div></div>`;
};
V.hatCam = () => `<div class="center" style="padding:8px 0"><div class="stage"><video id="hv" autoplay playsinline muted></video><canvas id="hc"></canvas></div>
  <div id="hsay" class="say">Accendo la fotocamera…</div><div id="hcode" class="codebig" hidden></div>
  <button id="hgo" class="btn" disabled onclick="hatSort()">🎩 SMISTAMI!</button>
  <button id="hdone" class="btn" hidden onclick="stopHat();go('hat')">FATTO ✓</button>
  <button class="btn ghost" onclick="stopHat();go('hat')">INDIETRO</button></div>`;
function hatUnlock() {
  if ($('#lc').value.trim().toUpperCase() === db.settings.adminCode.toUpperCase()) { stopHat(); go('admin'); }
  else $('#lerr').textContent = 'Codice errato';
}
function hatReset() {
  if (!confirm('Rimettere tutti i partecipanti in lista per il Cappello Parlante?')) return;
  db.participants.forEach(p => p.hat = false); save(); render();
}

/* ---- Fotocamera e riconoscimento volto ---- */
async function hatLoad() {
  if (hatDet || hatTried) return hatDet; hatTried = true;
  try {
    const m = await import(HAT_CDN + '/vision_bundle.mjs'), fs = await m.FilesetResolver.forVisionTasks(HAT_CDN + '/wasm');
    const mk = d => m.FaceDetector.createFromOptions(fs, { baseOptions: { modelAssetPath: HAT_MODEL, delegate: d }, runningMode: 'VIDEO' });
    try { hatDet = await mk('GPU'); } catch (e) { hatDet = await mk('CPU'); }
  } catch (e) { hatDet = null; }
  return hatDet;
}
async function startHat(id) {
  stopHat(); go('hatCam');
  const H = HAT = { p: find(id), on: true, seen: 0, talk: false, busy: false }, v = $('#hv'), say = $('#hsay');
  try {
    H.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    v.srcObject = H.stream; await v.play();
  } catch (e) { say.textContent = 'Non riesco ad accendere la fotocamera. Consenti l\'accesso (serve una pagina https) e riprova.'; return; }
  say.textContent = 'Carico il cappello…';
  await hatLoad(); if (HAT !== H) return;
  say.textContent = hatDet ? 'Avvicinati e guardami negli occhi…' : 'Modalità semplice: mettiti sotto il cappello e tocca SMISTAMI!';
  $('#hgo').disabled = !!hatDet; hatLoop();
}
function stopHat() {
  clearTimeout(hatTimer); if (window.speechSynthesis) speechSynthesis.cancel();
  if (HAT) { HAT.on = false; if (HAT.stream) HAT.stream.getTracks().forEach(t => t.stop()); }
  HAT = null;
}
function hatLoop() {
  const H = HAT; if (!H || !H.on) return;
  const v = $('#hv'), c = $('#hc'); if (!v || !c) return stopHat();
  if (v.videoWidth && c.width !== v.videoWidth) { c.width = v.videoWidth; c.height = v.videoHeight; }
  const g = c.getContext('2d'), t = performance.now(); g.clearRect(0, 0, c.width, c.height);
  if (hatDet && v.readyState >= 2 && v.currentTime !== H.lt) {
    H.lt = v.currentTime;
    try {
      const b = (hatDet.detectForVideo(v, t).detections[0] || {}).boundingBox;
      if (b) { H.seen = t; H.tg = { x: b.originX + b.width / 2, y: b.originY + b.height * .08, w: b.width }; }
    } catch (e) {}
  }
  if (!hatDet) H.tg = { x: c.width / 2, y: c.height * .38, w: c.width * .3 };
  if (H.tg) H.cur = H.cur ? { x: H.cur.x + (H.tg.x - H.cur.x) * .35, y: H.cur.y + (H.tg.y - H.cur.y) * .35, w: H.cur.w + (H.tg.w - H.cur.w) * .35 } : { ...H.tg };
  const vis = !hatDet || t - H.seen < 800;
  if (vis && H.cur) hatDraw(g, H.cur.x, H.cur.y, H.cur.w, t, H.talk);
  if (hatDet && !H.busy) $('#hgo').disabled = !vis;
  requestAnimationFrame(hatLoop);
}
function hatDraw(g, x, y, w, t, talk) {
  const bw = w * 1.7, h = w * 1.5, sw = Math.sin(t / 400) * w * .04;
  g.save(); g.translate(x, y); g.lineWidth = w * .02; g.strokeStyle = '#1a0b2e';
  g.fillStyle = '#3b1b66'; g.beginPath(); g.moveTo(-bw * .36, 0);
  g.quadraticCurveTo(-bw * .2, -h * .55, bw * .05 + sw, -h * .95);
  g.quadraticCurveTo(bw * .3 + sw * 2, -h * 1.0, bw * .32 + sw * 3, -h * .78);
  g.quadraticCurveTo(bw * .2, -h * .45, bw * .36, 0); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#ff7a1a'; g.fillRect(-bw * .31, -h * .13, bw * .62, h * .06);
  g.fillStyle = '#e8b923'; g.fillRect(-bw * .05, -h * .15, bw * .1, h * .1);
  g.fillStyle = '#2a1248'; g.beginPath(); g.ellipse(0, 0, bw * .55, bw * .09, 0, 0, 7); g.fill(); g.stroke();
  const m = talk ? Math.abs(Math.sin(t / 120)) : 0;
  [-1, 1].forEach(s => { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(s * bw * .1, -h * .4, bw * .035, bw * .045, 0, 0, 7); g.fill();
    g.fillStyle = '#000'; g.beginPath(); g.arc(s * bw * .1, -h * .39, bw * .015, 0, 7); g.fill(); });
  g.fillStyle = '#120818'; g.beginPath(); g.ellipse(0, -h * .27, bw * .09, bw * (.012 + .05 * m), 0, 0, 7); g.fill();
  g.restore();
}
function hatShot(p) {
  const v = $('#hv'), s = Math.min(v.videoWidth, v.videoHeight), c = document.createElement('canvas'); c.width = c.height = 256;
  c.getContext('2d').drawImage(v, (v.videoWidth - s) / 2, (v.videoHeight - s) / 2, s, s, 0, 0, 256, 256);
  p.photo = c.toDataURL('image/jpeg', 0.7);
}
async function hatSort() {
  const H = HAT, p = H.p, say = $('#hsay'); H.busy = true; H.talk = true; $('#hgo').hidden = true;
  for (const s of [...H_THINK].sort(() => Math.random() - .5).slice(0, 3)) {
    say.textContent = hatFill(s, p); hatSpeak(say.textContent); await hatWait(2800); if (HAT !== H) return;
  }
  const q = H_COSTUME.find(a => a[0].test(p.costume || ''));
  const text = hatFill(hpick(H_VERDICT), p) + (q ? ' ' + hatFill(q[1], p) : '');
  say.textContent = text; $('#hcode').textContent = p.code.split('').join(' '); $('#hcode').hidden = false;
  hatSpeak(text + ' Il tuo codice è: ' + p.code.split('').join(', '));
  if (hatOpts.photo && !p.photo) hatShot(p);
  p.hat = true; save(); $('#hdone').hidden = false;
  setTimeout(() => { H.talk = false; }, 3000);
  hatTimer = setTimeout(() => { if (HAT === H) { stopHat(); go('hat'); } }, 30000);
}
