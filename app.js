const $ = s => document.querySelector(s), ICONS = ['🎃', '👻', '🦇', '🕷️', '💀'];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cats = () => db.categories.filter(c => c.active !== false);
const find = id => db.participants.find(p => p.id === id);
let S = { view: 'home' }, RD = null; // RD = dati ricevuti dal foglio durante una votazione da telefono
function go(v, x = {}) { S = { voter: S.voter, idx: S.idx, sel: S.sel, ...x, view: v }; render(); scrollTo(0, 0); }
const photo = p => p.photo ? `<img src="${esc(p.photo)}" alt="">` : `<div class="ph">${ICONS[Math.max(0, (RD ? RD.candidates : db.participants).indexOf(p)) % 5]}</div>`;
const head = (t, back) => `<div class="top">${back ? `<button class="btn sm" onclick="go('${back}')">← Indietro</button>` : ''}<h2>${t}</h2></div>`;
const msgPage = (e, t, x) => `<div class="center"><div class="big">${e}</div><h1>${t}</h1><p>${x}</p><button class="btn" onclick="go('home',{voter:null})">TORNA ALL'INIZIO</button></div>`;

const V = {
  home: () => `<div class="center"><div class="big">🎃</div><h1>HALLOWEEN<br>AWARDS</h1><p class="muted">${esc(db.settings.eventName)}</p><p>Pronto a votare?</p>
    <input id="code" placeholder="INSERISCI IL TUO CODICE" autocomplete="off" autocapitalize="characters" onkeydown="if(event.key==='Enter')login()">
    <div class="err">${esc(S.err)}</div><button class="btn" onclick="login()">ACCEDI</button><br>
    <a class="small" onclick="$('#code').focus();$('.err').textContent='Inserisci il codice amministratore'">Amministratore</a></div>`,
  already: () => msgPage('🎃', 'HAI GIÀ VOTATO!', 'Il tuo voto è stato registrato.<br>Grazie!'),
  closed: () => msgPage('🔴', 'VOTAZIONE CHIUSA', 'Le votazioni non sono al momento aperte.'),
  done: () => msgPage('🎃', 'VOTAZIONE COMPLETATA!', 'Grazie per aver votato.<br>I risultati saranno mostrati<br>alla fine della serata.<br>👻'),
  vote: () => {
    const cs = RD ? RD.categories : cats(), c = cs[S.idx], me = RD ? RD.me : find(S.voter), parts = RD ? RD.candidates : db.participants, allow = RD ? RD.allowSelfVote : db.settings.allowSelfVote;
    return `<div class="top"><h3>🎃 HALLOWEEN AWARDS</h3></div>
    ${S.greet ? `<div class="ok">Ciao ${esc(me.name.split(' ')[0])}! 🎃</div>` : ''}
    <b>CATEGORIA ${S.idx + 1} / ${cs.length}</b><div class="prog"><i style="width:${(S.idx + 1) / cs.length * 100}%"></i></div>
    <div class="center" style="padding:8px 0"><div class="big" style="font-size:3.5rem">${c.emoji}</div><h1 style="font-size:2rem">${esc(c.name.toUpperCase())}</h1><p>Scegli il tuo preferito</p></div>
    <div class="grid">${parts.map(p => {
      const self = p.id === me.id && !allow;
      return `<div class="card ${self ? 'dis' : ''}" data-id="${p.id}" ${self ? '' : `onclick="pick('${p.id}')"`}><span class="chk">✓</span>${photo(p)}<b>${esc(p.name)}</b><span>${esc(p.costume)}</span>${self ? '<em>Questo sei tu</em>' : '<em class="sel">SELEZIONATO</em>'}</div>`;
    }).join('')}</div>
    <div class="dock"><button id="next" class="btn" hidden onclick="confirmVote()">${RD && S.idx + 1 >= cs.length ? 'INVIA I VOTI ✓' : 'CONFERMA VOTO →'}</button></div>`;
  },
  admin: () => {
    const o = db.settings.open;
    const items = [['👥', 'PARTECIPANTI', "go('parts')"], ['🏆', 'CATEGORIE', "go('cats')"], ['📊', 'RISULTATI', "go('results')"], ['⚙️', 'IMPOSTAZIONI', "go('settings')"], ['🎩', 'CAPPELLO PARLANTE', "go('hat')"],
      ['💾', 'ESPORTA DATI', 'exportData()'], ['📂', 'IMPORTA DATI', "$('#imp').click()"], ['⚠️', 'RESET VOTI', 'resetVotes()'], ['🚪', 'ESCI', "go('home',{voter:null})"]].concat(remote() ? [['☁️', 'PUBBLICA SU FOGLI', 'syncConfig()'], ['⬇️', 'SCARICA VOTI', 'pullVotes()']] : []);
    return `${S.msg ? `<div class="ok">${S.msg}</div>` : ''}<div class="center"><div class="big">🎃</div><h1>ADMIN PANEL</h1>
    <div class="state">${o ? '🟢 VOTAZIONE APERTA' : '🔴 VOTAZIONE CHIUSA'}</div><button class="btn" onclick="flip('open','admin')">${o ? 'CHIUDI VOTAZIONI' : 'RIAPRI VOTAZIONI'}</button></div>
    <div class="grid menu">${items.map(i => `<button onclick="${i[2]}"><span>${i[0]}</span>${i[1]}</button>`).join('')}</div>
    <input type="file" id="imp" accept=".json" hidden onchange="importData(this)">`;
  },
  parts: () => head('👥 PARTECIPANTI', 'admin') +
    `<div><button class="btn" onclick="go('partForm')">+ AGGIUNGI PARTECIPANTE</button><button class="btn ghost" onclick="genCodes()">GENERA CODICI</button><button class="btn ghost" onclick="printCodes()">🖨️ STAMPA CODICI</button><button class="btn ghost" onclick="hatReset()">🎩 AZZERA CAPPELLO</button></div>` +
    db.participants.map(p => `<div class="item"><div><b>${esc(p.name)}</b><br>${esc(p.costume)}<br>Codice: <code>${esc(p.code)}</code> ${p.voted ? '✅ ha votato' : ''}</div>
    <div><button class="btn sm" onclick="go('partForm',{edit:'${p.id}'})">MODIFICA</button><button class="btn sm danger" onclick="delPart('${p.id}')">ELIMINA</button></div></div>`).join(''),
  partForm: () => {
    const p = S.edit ? find(S.edit) : {};
    return head(S.edit ? 'MODIFICA PARTECIPANTE' : 'NUOVO PARTECIPANTE', 'parts') + `<div class="form">
    <label>Nome<input id="fn" value="${esc(p.name)}"></label><label>Costume<input id="fc" value="${esc(p.costume)}"></label>
    <label>Codice<input id="fk" value="${esc(p.code)}" autocapitalize="characters"></label>
    <label>Foto (facoltativa)</label>
    <div class="photoRow"><div class="pv" id="prev">${S.edit ? photo(p) : '<div class="ph">🎃</div>'}</div><div>
    <button class="btn sm ghost" onclick="$('#fg').click()">🖼️ SCEGLI DALLA GALLERIA</button>
    <button class="btn sm ghost" onclick="$('#fc2').click()">📷 SCATTA FOTO</button>
    <button class="btn sm ghost" onclick="removePhoto()">✖ RIMUOVI</button><p class="muted">Senza foto verrà usata un'icona Halloween.</p></div></div>
    <input type="hidden" id="fp" value="${esc(p.photo)}">
    <input type="file" id="fg" accept="image/*" hidden onchange="loadPhoto(this)">
    <input type="file" id="fc2" accept="image/*" capture="environment" hidden onchange="loadPhoto(this)">
    <div class="err" id="ferr"></div><button class="btn" onclick="savePart()">SALVA</button></div>`;
  },
  cats: () => head('🏆 CATEGORIE', 'admin') + `<button class="btn" onclick="go('catForm')">+ AGGIUNGI CATEGORIA</button>` +
    db.categories.map((c, i) => `<div class="item"><div><b>${c.emoji} ${esc(c.name)}</b></div><div>
    <button class="btn sm ghost" onclick="moveCat(${i},-1)">▲</button><button class="btn sm ghost" onclick="moveCat(${i},1)">▼</button>
    <button class="btn sm" onclick="go('catForm',{edit:'${c.id}'})">MODIFICA</button><button class="btn sm danger" onclick="delCat('${c.id}')">ELIMINA</button></div></div>`).join(''),
  catForm: () => {
    const c = S.edit ? db.categories.find(x => x.id === S.edit) : { emoji: '👻' };
    return head(S.edit ? 'MODIFICA CATEGORIA' : 'NUOVA CATEGORIA', 'cats') + `<div class="form">
    <label>Nome categoria<input id="fn" value="${esc(c.name)}"></label><label>Emoji<input id="fe" value="${esc(c.emoji)}"></label>
    <div class="err" id="ferr"></div><button class="btn" onclick="saveCat()">SALVA</button></div>`;
  },
  results: () => {
    const np = db.participants.length, nv = db.participants.filter(p => p.voted).length;
    const stat = (l, n) => `<div class="stat"><b>${n}</b>${l}</div>`;
    const rank = db.participants.map(p => ({ p, n: db.votes.filter(v => v.candidate === p.id && db.categories.some(c => c.id === v.category)).length })).sort((a, b) => b.n - a.n);
    return head('🏆 RISULTATI', 'admin') + (remote() ? '<button class="btn" onclick="pullVotes()">⬇️ AGGIORNA DAI FOGLI</button>' : '') + `<div class="stats">${stat('PARTECIPANTI', np)}${stat('HANNO VOTATO', nv)}${stat('NON HANNO VOTATO', np - nv)}${stat('VOTI TOTALI', db.votes.length)}${stat('CATEGORIE', db.categories.length)}</div>` +
      db.categories.map(c => {
        const t = tally(c.id), max = Math.max(1, ...t.map(x => x.n)), tot = t.reduce((s, x) => s + x.n, 0);
        return `<section class="panel"><h3>${c.emoji} ${esc(c.name.toUpperCase())}</h3>` +
          t.map((x, i) => `<div class="row"><span>${x.n && i < 3 ? ['🥇', '🥈', '🥉'][i] : ''} ${esc(x.p.name)}</span><div class="bar"><i style="width:${x.n / max * 100}%"></i></div><b>${x.n}</b></div>`).join('') +
          `${t[0] && t[0].n ? `<p class="win">👑 Vincitore: ${esc(t[0].p.name)}</p>` : ''}<p class="muted">Totale voti: ${tot}</p></section>`;
      }).join('') +
      `<section class="panel"><h3>👑 CLASSIFICA GENERALE</h3>` + rank.map((x, i) => `<div class="row"><span style="flex:1">${['🥇', '🥈', '🥉'][i] || (i + 1) + '°'} ${esc(x.p.name)}</span><b>${x.n} voti</b></div>`).join('') + `</section>`;
  },
  settings: () => {
    const s = db.settings;
    return head('⚙️ IMPOSTAZIONI', 'admin') + `<div class="form"><label>Nome evento<input id="se" value="${esc(s.eventName)}"></label><label>Codice admin<input id="sa" value="${esc(s.adminCode)}"></label>
    <label>Voto a se stessi<br><button class="btn ${s.allowSelfVote ? '' : 'ghost'}" onclick="flip('allowSelfVote','settings')">${s.allowSelfVote ? 'ON' : 'OFF'}</button></label>
    <label>Votazione<br><button class="btn ${s.open ? '' : 'ghost'}" onclick="flip('open','settings')">${s.open ? '🟢 APERTA' : '🔴 CHIUSA'}</button></label>
    <div class="err" id="ferr"></div><button class="btn" onclick="readSettings();go('admin',{msg:'Impostazioni salvate'})">SALVA</button></div>`;
  }
};
function render() { $('#app').innerHTML = V[S.view](); }

/* ---- Votazione ---- */
function login() {
  const c = $('#code').value.trim().toUpperCase();
  RD = null;
  if (c && c === db.settings.adminCode.toUpperCase()) return go('admin');
  if (remote()) return remoteLogin(c);
  const p = db.participants.find(p => p.code.toUpperCase() === c);
  if (!c || !p) return go('home', { err: '❌ Codice non valido' });
  if (p.voted) return go('already');
  if (!db.settings.open) return go('closed');
  const cs = cats(), done = db.votes.filter(v => v.voter === p.id).map(v => v.category), i = cs.findIndex(x => !done.includes(x.id));
  if (!cs.length) return go('home', { err: 'Nessuna categoria configurata' });
  if (i < 0) { p.voted = true; save(); return go('already'); }
  go('vote', { voter: p.id, idx: i, sel: null, greet: true });
}
function pick(id) {
  S.sel = id;
  document.querySelectorAll('.card').forEach(c => c.classList.toggle('on', c.dataset.id === id));
  $('#next').hidden = false;
}
function confirmVote() {
  if (RD) return remoteVote();
  const p = find(S.voter), c = cats()[S.idx];
  if (!db.settings.open) return go('closed');
  if (!p || p.voted || !c || !find(S.sel) || (S.sel === p.id && !db.settings.allowSelfVote) || db.votes.some(v => v.voter === p.id && v.category === c.id))
    return go('home', { err: 'Errore nel voto, riprova' });
  db.votes.push({ voter: p.id, category: c.id, candidate: S.sel });
  if (S.idx + 1 >= cats().length) { p.voted = true; save(); return go('done', { voter: null }); }
  save(); go('vote', { idx: S.idx + 1, sel: null });
}

/* ---- Admin ---- */
const tally = cid => db.participants.map(p => ({ p, n: db.votes.filter(v => v.category === cid && v.candidate === p.id).length })).sort((a, b) => b.n - a.n);
function readSettings() {
  const e = $('#se'), a = $('#sa');
  if (e && e.value.trim()) db.settings.eventName = e.value.trim();
  if (a && a.value.trim()) db.settings.adminCode = a.value.trim();
  save();
}
function flip(k, back) { if (back === 'settings') readSettings(); db.settings[k] = !db.settings[k]; save(); if (remote() && k === 'open' && back === 'admin') return syncConfig(); go(back); }
function loadPhoto(inp) {
  const f = inp.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, 256 / Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      const d = c.toDataURL('image/jpeg', 0.7);
      $('#fp').value = d; $('#prev').innerHTML = `<img src="${d}" alt="">`;
    };
    im.onerror = () => $('#ferr').textContent = 'Immagine non valida';
    im.src = r.result;
  };
  r.readAsDataURL(f); inp.value = '';
}
function removePhoto() { $('#fp').value = ''; $('#prev').innerHTML = '<div class="ph">🎃</div>'; }
function savePart() {
  const n = $('#fn').value.trim(), k = $('#fk').value.trim().toUpperCase(), e = $('#ferr');
  if (!n || !k) return e.textContent = 'Nome e codice sono obbligatori';
  if (k === db.settings.adminCode.toUpperCase() || db.participants.some(p => p.id !== S.edit && p.code.toUpperCase() === k)) return e.textContent = 'Codice già in uso';
  const d = { name: n, costume: $('#fc').value.trim(), code: k, photo: $('#fp').value.trim() };
  if (S.edit) Object.assign(find(S.edit), d); else db.participants.push({ id: 'p' + Date.now(), ...d, voted: false });
  save(); go('parts');
}
function delPart(id) {
  const p = find(id);
  if (!confirm(`Sei sicuro di voler eliminare ${p.name}?`)) return;
  db.participants = db.participants.filter(x => x.id !== id);
  db.votes = db.votes.filter(v => v.voter !== id && v.candidate !== id);
  save(); render();
}
function saveCat() {
  const n = $('#fn').value.trim(), e = $('#fe').value.trim() || '🎃';
  if (!n) return $('#ferr').textContent = 'Inserisci il nome della categoria';
  if (S.edit) Object.assign(db.categories.find(c => c.id === S.edit), { name: n, emoji: e });
  else db.categories.push({ id: 'cat' + Date.now(), name: n, emoji: e, active: true });
  save(); go('cats');
}
function delCat(id) {
  const c = db.categories.find(x => x.id === id);
  if (!confirm(`Sei sicuro di voler eliminare "${c.name}"? Anche i suoi voti verranno eliminati.`)) return;
  db.categories = db.categories.filter(x => x.id !== id);
  db.votes = db.votes.filter(v => v.category !== id);
  save(); render();
}
function moveCat(i, d) {
  const j = i + d; if (j < 0 || j >= db.categories.length) return;
  [db.categories[i], db.categories[j]] = [db.categories[j], db.categories[i]];
  save(); render();
}
function resetVotes() {
  if (!confirm('ATTENZIONE\n\nStai per cancellare tutti i voti.\nI partecipanti e le categorie NON verranno eliminati.')) return;
  if (remote()) api('reset', { adminCode: db.settings.adminCode }).then(r => { if (r.error) alert('Il foglio non ha azzerato i voti'); }).catch(() => alert('Errore di connessione: i voti sul foglio NON sono stati azzerati'));
  db.votes = []; db.participants.forEach(p => p.voted = false); save(); go('admin', { msg: 'Voti azzerati' });
}
function genCodes() {
  if (!confirm('Generare nuovi codici per tutti i partecipanti? I vecchi codici non funzioneranno più.')) return;
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', used = new Set([db.settings.adminCode.toUpperCase()]);
  db.participants.forEach(p => { let c; do { c = Array.from({ length: 4 }, () => A[Math.random() * A.length | 0]).join(''); } while (used.has(c)); used.add(c); p.code = c; });
  save(); render();
}
function printCodes() {
  const w = window.open('', '_blank'); if (!w) return alert('Consenti i popup per stampare');
  w.document.write(`<title>Codici</title><style>body{font-family:sans-serif;text-align:center}div{border-bottom:1px dashed #000;padding:18px;font-size:22px}b{font-size:32px;letter-spacing:5px}</style><h1>🎃 ${esc(db.settings.eventName)}</h1>` +
    db.participants.map(p => `<div>${esc(p.name)}<br>CODICE: <b>${esc(p.code)}</b></div>`).join(''));
  w.document.close(); w.print();
}
function exportData() {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(db, null, 1)], { type: 'application/json' }));
  a.download = 'halloween-backup.json'; a.click();
}
/* ---- Votazione da telefono con Fogli Google ---- */
const remote = () => typeof SHEETS_URL === 'string' && SHEETS_URL.trim() !== '';
async function api(action, data = {}) {
  const r = await fetch(SHEETS_URL, { method: 'POST', body: JSON.stringify({ action, ...data }) });
  return r.json();
}
async function remoteLogin(c) {
  if (!c) return go('home', { err: '❌ Codice non valido' });
  $('.err').textContent = 'Attendi…';
  try {
    const r = await api('login', { code: c });
    if (r.error === 'invalid') return go('home', { err: '❌ Codice non valido' });
    if (r.error === 'closed') return go('closed');
    if (r.error === 'voted') return go('already');
    if (r.error) throw 0;
    RD = { ...r, code: c };
    go('vote', { voter: r.me.id, idx: Math.max(0, r.categories.findIndex(x => !r.done.includes(x.id))), sel: null, greet: true });
  } catch (e) { go('home', { err: 'Errore di connessione, riprova' }); }
}
async function remoteVote() {
  const c = RD.categories[S.idx];
  RD.picks = RD.picks || {}; RD.picks[c.id] = S.sel;
  if (S.idx + 1 < RD.categories.length) return go('vote', { idx: S.idx + 1, sel: null }); // niente invio: si passa alla categoria dopo
  const b = $('#next'); b.disabled = true; b.textContent = 'Invio…';
  try {
    const picks = RD.categories.filter(x => RD.picks[x.id]).map(x => ({ category: x.id, candidate: RD.picks[x.id] }));
    const r = await api('voteAll', { code: RD.code, picks });
    if (r.error === 'closed') { RD = null; return go('closed'); }
    if (!r.ok) throw 0;
    RD = null; go('done', { voter: null });
  } catch (e) { b.disabled = false; b.textContent = 'RIPROVA INVIO →'; alert('Errore di connessione: i tuoi voti NON sono ancora stati inviati. Premi di nuovo il pulsante.'); }
}
async function syncConfig() {
  const s = db.settings, parts = db.participants.map(p => ({ id: p.id, name: p.name, costume: p.costume, code: p.code, photo: (p.photo || '').length <= 30000 ? p.photo : '' }));
  try {
    const r = await api('push', { adminCode: s.adminCode, config: { eventName: s.eventName, allowSelfVote: !!s.allowSelfVote, open: !!s.open, participants: parts, categories: cats().map(c => ({ id: c.id, name: c.name, emoji: c.emoji })) } });
    if (r.error === 'auth') return go('admin', { msg: '❌ Il foglio ha già un codice admin diverso da quello dell\'app' });
    if (!r.ok) throw 0;
    go('admin', { msg: '✅ Configurazione pubblicata su Fogli Google' });
  } catch (e) { go('admin', { msg: '❌ Errore di connessione' }); }
}
async function pullVotes() {
  try {
    const r = await api('votes', { adminCode: db.settings.adminCode });
    if (r.error === 'auth') return go('admin', { msg: '❌ Codice admin non accettato dal foglio (pubblica prima la configurazione)' });
    if (!r.votes) throw 0;
    db.votes = r.votes.filter(v => find(v.voter) && find(v.candidate) && db.categories.some(c => c.id === v.category));
    const cs = cats();
    db.participants.forEach(p => p.voted = cs.length > 0 && cs.every(c => db.votes.some(v => v.voter === p.id && v.category === c.id)));
    save(); go('results');
  } catch (e) { go('admin', { msg: '❌ Errore di connessione' }); }
}
function importData(inp) {
  const f = inp.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!d.settings || !Array.isArray(d.participants) || !Array.isArray(d.categories) || !Array.isArray(d.votes)) throw 0;
      if (!confirm('Sostituire tutti i dati attuali con il backup?')) return;
      db = d; save(); go('admin', { msg: 'Backup importato' });
    } catch (e) { alert('File di backup non valido'); }
  };
  r.readAsText(f);
}
render();
