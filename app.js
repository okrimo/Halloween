const $ = s => document.querySelector(s), ICONS = ['🎃', '👻', '🦇', '🕷️', '💀'];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cats = () => db.categories.filter(c => c.active !== false && (c.kind !== 'couple' || couples().length) && (c.kind !== 'makeup' || db.participants.some(p => p.makeup)));
// Coppie = due partecipanti che si sono scelti a vicenda. id coppia = "idA|idB"
const couples = () => { const o = []; db.participants.forEach(a => { const b = find(a.partner); if (b && b.partner === a.id && a.id < b.id) o.push({ id: a.id + '|' + b.id, name: a.name + ' & ' + b.name, costume: a.costume === b.costume ? a.costume : a.costume + ' & ' + b.costume, members: [a.id, b.id] }); }); return o; };
const candsFor = c => { const L = RD ? RD.candidates : db.participants; return c.kind === 'couple' ? (RD ? RD.couples : couples()) : c.kind === 'makeup' ? L.filter(p => p.makeup) : L; };
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
    const cs = RD ? RD.categories : cats(), c = cs[S.idx], me = RD ? RD.me : find(S.voter), P = RD ? RD.candidates : db.participants, parts = candsFor(c), allow = RD ? RD.allowSelfVote : db.settings.allowSelfVote;
    return `<div class="top"><h3>🎃 HALLOWEEN AWARDS</h3></div>
    ${S.greet ? `<div class="ok">Ciao ${esc(me.name.split(' ')[0])}! 🎃</div>` : ''}
    <b>CATEGORIA ${S.idx + 1} / ${cs.length}</b><div class="prog"><i style="width:${(S.idx + 1) / cs.length * 100}%"></i></div>
    <div class="center" style="padding:8px 0"><div class="big" style="font-size:3.5rem">${c.emoji}</div><h1 style="font-size:2rem">${esc(c.name.toUpperCase())}</h1><p>Scegli il tuo preferito</p></div>
    <div class="grid">${parts.map(p => {
      const self = !allow && (p.members ? p.members.includes(me.id) : p.id === me.id);
      return `<div class="card ${self ? 'dis' : ''}" data-id="${p.id}" ${self ? '' : `onclick="pick('${p.id}')"`}><span class="chk">✓</span>${p.members ? `<div class="duo">${p.members.map(m => photo(P.find(q => q.id === m))).join('')}</div>` : photo(p)}<b>${esc(p.name)}</b><span>${esc(p.costume)}</span>${self ? (p.members ? '<em>Siete voi</em>' : '<em>Questo sei tu</em>') : '<em class="sel">SELEZIONATO</em>'}</div>`;
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
    db.participants.map(p => `<div class="item"><div><b>${esc(p.name)}</b><br>${esc(p.costume)}${p.partner && find(p.partner) ? `<br>💑 in coppia con ${esc(find(p.partner).name)}` : ''}${p.makeup ? '<br>💄 truccato/a' : ''}<br>Codice: <code>${esc(p.code)}</code> ${p.voted ? '✅ ha votato' : ''}</div>
    <div><button class="btn sm" onclick="go('partForm',{edit:'${p.id}'})">MODIFICA</button><button class="btn sm danger" onclick="delPart('${p.id}')">ELIMINA</button></div></div>`).join(''),
  partForm: () => {
    const p = S.edit ? find(S.edit) : {};
    return head(S.edit ? 'MODIFICA PARTECIPANTE' : 'NUOVO PARTECIPANTE', 'parts') + `<div class="form">
    <label>Nome<input id="fn" value="${esc(p.name)}"></label><label>Costume<input id="fc" value="${esc(p.costume)}"></label>
    <label>Costume di coppia?<select id="fcp" onchange="$('#fpw').hidden=this.value!=='1'"><option value="0">No</option><option value="1" ${p.partner ? 'selected' : ''}>Sì, gareggia in coppia</option></select></label>
    <label id="fpw" ${p.partner ? '' : 'hidden'}>Con chi?<select id="fpa">${db.participants.filter(x => x.id !== p.id && (!x.partner || x.partner === p.id)).map(x => `<option value="${x.id}" ${p.partner === x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
    <label>Truccato/a?<select id="fmk"><option value="0">No</option><option value="1" ${p.makeup ? 'selected' : ''}>Sì, partecipa al miglior trucco</option></select></label>
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
    db.categories.map((c, i) => `<div class="item"><div><b>${c.emoji} ${esc(c.name)}</b>${c.kind === 'couple' ? ' 💑 solo coppie' : c.kind === 'makeup' ? ' 💄 solo truccati' : c.kind === 'overall' ? ' 👑 premio assoluto' : ''}</div><div>
    <button class="btn sm ghost" onclick="moveCat(${i},-1)">▲</button><button class="btn sm ghost" onclick="moveCat(${i},1)">▼</button>
    <button class="btn sm" onclick="go('catForm',{edit:'${c.id}'})">MODIFICA</button><button class="btn sm danger" onclick="delCat('${c.id}')">ELIMINA</button></div></div>`).join(''),
  catForm: () => {
    const c = S.edit ? db.categories.find(x => x.id === S.edit) : { emoji: '👻' };
    return head(S.edit ? 'MODIFICA CATEGORIA' : 'NUOVA CATEGORIA', 'cats') + `<div class="form">
    <label>Nome categoria<input id="fn" value="${esc(c.name)}"></label><label>Emoji<input id="fe" value="${esc(c.emoji)}"></label>
    <label>Tipo di categoria<select id="fk2"><option value="normal">Normale (tutti i partecipanti)</option><option value="couple" ${c.kind === 'couple' ? 'selected' : ''}>Solo coppie (es. Miglior coppia)</option><option value="makeup" ${c.kind === 'makeup' ? 'selected' : ''}>Solo truccati (es. Miglior trucco)</option><option value="overall" ${c.kind === 'overall' ? 'selected' : ''}>Premio assoluto (miglior costume della serata)</option></select></label>
    <div class="err" id="ferr"></div><button class="btn" onclick="saveCat()">SALVA</button></div>`;
  },
  results: () => {
    const np = db.participants.length, nv = db.participants.filter(p => p.voted).length;
    const stat = (l, n, k) => `<div class="stat" ${k ? `onclick="showStat('${k}')" style="cursor:pointer;border:2px solid var(--pur2)"` : ''}><b>${n}</b>${l}${k ? ' ▾' : ''}</div>`;
    return head('🏆 RISULTATI', 'admin') + (remote() ? '<button class="btn" onclick="pullVotes()">⬇️ AGGIORNA DAI FOGLI</button>' : '') + `<div class="stats">${stat('PARTECIPANTI', np, 'all')}${stat('HANNO VOTATO', nv, 'voted')}${stat('NON HANNO VOTATO', np - nv, 'not')}${stat('VOTI TOTALI', db.votes.length)}${stat('CATEGORIE', db.categories.length)}</div><div id="statlist"></div>` +
      db.categories.map(c => {
        const t = tally(c), max = Math.max(1, ...t.map(x => x.n)), tot = t.reduce((s, x) => s + x.n, 0);
        return `<section class="panel"><h3>${c.emoji} ${esc(c.name.toUpperCase())}</h3>` +
          t.map((x, i) => `<div class="row"><span>${x.n && i < 3 ? ['🥇', '🥈', '🥉'][i] : ''} ${esc(x.p.name)}</span><div class="bar"><i style="width:${x.n / max * 100}%"></i></div><b>${x.n}</b></div>`).join('') +
          `${t[0] && t[0].n ? `<p class="win">👑 Vincitore: ${esc(t[0].p.name)}</p>` : ''}<p class="muted">Totale voti: ${tot}</p></section>`;
      }).join('') + heroPanels(); // premio assoluto in fondo
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
  const p = find(S.voter), c = cats()[S.idx], cd = c && candsFor(c).find(x => x.id === S.sel);
  if (!db.settings.open) return go('closed');
  if (!p || p.voted || !c || !cd || (!db.settings.allowSelfVote && (cd.members ? cd.members.includes(p.id) : cd.id === p.id)) || db.votes.some(v => v.voter === p.id && v.category === c.id))
    return go('home', { err: 'Errore nel voto, riprova' });
  db.votes.push({ voter: p.id, category: c.id, candidate: S.sel });
  if (S.idx + 1 >= cats().length) { p.voted = true; save(); return go('done', { voter: null }); }
  save(); go('vote', { idx: S.idx + 1, sel: null });
}

/* ---- Admin ---- */
const tally = c => (c.kind === 'couple' ? couples() : c.kind === 'makeup' ? db.participants.filter(p => p.makeup) : db.participants).map(p => ({ p, n: db.votes.filter(v => v.category === c.id && v.candidate === p.id).length })).sort((a, b) => b.n - a.n);
function showStat(k) { // tocca un numero delle statistiche per vedere i nomi (tocca di nuovo per chiudere)
  const L = { all: ['PARTECIPANTI', db.participants], voted: ['HANNO VOTATO', db.participants.filter(p => p.voted)], not: ['NON HANNO VOTATO', db.participants.filter(p => !p.voted)] }[k], el = $('#statlist');
  if (el.dataset.k === k) { el.dataset.k = ''; return el.innerHTML = ''; }
  el.dataset.k = k;
  el.innerHTML = `<section class="panel"><h3>${L[0]} (${L[1].length})</h3>${L[1].length ? L[1].map(p => `<div class="row"><span style="flex:1">${k === 'all' ? (p.voted ? '✅ ' : '⏳ ') : ''}${esc(p.name)}</span><span class="muted">${esc(p.costume)}</span></div>`).join('') : '<p class="muted">Nessuno</p>'}</section>`;
}
function heroPanels() { // premio assoluto: categoria a sé, non una somma di punti
  return db.categories.filter(c => c.kind === 'overall').map(c => {
    const t = tally(c), top = t.filter(x => x.n > 0 && x.n === t[0].n);
    return top.length ? `<section class="panel hero"><h3>🏆 ${c.emoji} ${esc(c.name.toUpperCase())}</h3><div class="winner">${top.map(x => esc(x.p.name)).join(' · ')}</div><p class="muted">${t[0].n} voti</p></section>` : '';
  }).join('');
}
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
  const d = { name: n, costume: $('#fc').value.trim(), code: k, photo: $('#fp').value.trim(), makeup: $('#fmk').value === '1' };
  const id = S.edit || 'p' + Date.now(), np = $('#fcp').value === '1' && find($('#fpa').value) ? $('#fpa').value : '';
  if (S.edit) Object.assign(find(S.edit), d); else db.participants.push({ id, ...d, voted: false });
  db.participants.forEach(x => { if (x.partner === id) x.partner = ''; }); // il legame è sempre reciproco
  find(id).partner = np;
  if (np) { const t = find(np); if (t.partner && t.partner !== id) { const o = find(t.partner); if (o) o.partner = ''; } t.partner = id; }
  save(); go('parts');
}
function delPart(id) {
  const p = find(id);
  if (!confirm(`Sei sicuro di voler eliminare ${p.name}?`)) return;
  db.participants = db.participants.filter(x => x.id !== id);
  db.participants.forEach(x => { if (x.partner === id) x.partner = ''; });
  db.votes = db.votes.filter(v => v.voter !== id && v.candidate !== id);
  save(); render();
}
function saveCat() {
  const n = $('#fn').value.trim(), e = $('#fe').value.trim() || '🎃', k = $('#fk2').value;
  if (!n) return $('#ferr').textContent = 'Inserisci il nome della categoria';
  if (S.edit) Object.assign(db.categories.find(c => c.id === S.edit), { name: n, emoji: e, kind: k });
  else db.categories.push({ id: 'cat' + Date.now(), name: n, emoji: e, kind: k, active: true });
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
  const s = db.settings, parts = db.participants.map(p => ({ id: p.id, name: p.name, costume: p.costume, code: p.code, partner: p.partner || '', makeup: !!p.makeup, photo: (p.photo || '').length <= 30000 ? p.photo : '' }));
  try {
    const r = await api('push', { adminCode: s.adminCode, config: { eventName: s.eventName, allowSelfVote: !!s.allowSelfVote, open: !!s.open, participants: parts, categories: cats().map(c => ({ id: c.id, name: c.name, emoji: c.emoji, kind: c.kind || 'normal' })) } });
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
    db.votes = r.votes.filter(v => find(v.voter) && (find(v.candidate) || couples().some(x => x.id === v.candidate)) && db.categories.some(c => c.id === v.category));
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
      db = migrate(d); save(); go('admin', { msg: 'Backup importato' });
    } catch (e) { alert('File di backup non valido'); }
  };
  r.readAsText(f);
}
render();