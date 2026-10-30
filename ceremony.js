/* 🎬 Presentazione dei risultati (solo admin): si guarda e si va avanti.
   Categoria -> partecipanti svelati dal fondo alla vetta -> ballottaggio in caso di parità. */
let CER = null;
const cerMedal = p => ['🥇', '🥈', '🥉'][p - 1] || p + '°';
const cerLimit = () => CER.mode === 'podium' ? 3 : Infinity;

async function cerStart() {
  if (db.settings.open) return alert('Chiudi prima la votazione (pulsante CHIUDI VOTAZIONI).');
  if (remote()) { // scarica i voti dal foglio senza mostrarli
    try {
      const r = await api('votes', { adminCode: db.settings.adminCode });
      if (r.error === 'auth') return alert('Codice admin non accettato dal foglio: pubblica prima la configurazione.');
      if (!r.votes) throw 0;
      db.votes = r.votes.filter(v => find(v.voter) && (find(v.candidate) || couples().some(x => x.id === v.candidate)) && db.categories.some(c => c.id === v.category));
      const cs = cats(); db.participants.forEach(p => p.voted = cs.length > 0 && cs.every(c => db.votes.some(v => v.voter === p.id && v.category === c.id)));
      save();
    } catch (e) { return alert('Errore di connessione: non riesco a scaricare i voti.'); }
  }
  const cs = cats();
  CER = { mode: 'podium', phase: 'start', ci: 0, cats: cs.filter(c => c.kind !== 'overall').concat(cs.filter(c => c.kind === 'overall')) };
  go('cer');
}
function cerGroups(c) { // gruppi di pari merito, dal peggiore al migliore, solo le posizioni da annunciare
  const t = tally(c).filter(x => x.n > 0), gs = []; let pos = 1;
  for (let i = 0; i < t.length;) { let j = i; while (j < t.length && t[j].n === t[i].n) j++; gs.push({ n: t[i].n, items: t.slice(i, j), start: pos }); pos += j - i; i = j; }
  return gs.filter(g => g.start <= cerLimit()).reverse();
}
function cerStep() {
  const C = CER;
  for (;;) {
    if (C.queue.length) { C.last = C.queue.shift(); C.shown.push(C.last); go('cer'); const n = document.querySelector('.cer-row.new'); if (n) n.scrollIntoView({ block: 'center' }); return; }
    if (++C.gi >= C.groups.length) { C.phase = 'catdone'; return go('cer'); }
    const g = C.groups[C.gi];
    if (g.items.length > 1) { C.phase = 'tie'; C.tie = { items: g.items, n: g.n, start: g.start, order: [] }; return go('cer'); }
    C.queue = [{ ...g.items[0], pos: g.start }];
  }
}
function cerNext() {
  const C = CER;
  if (C.phase === 'start') { C.phase = 'intro'; return go('cer'); }
  if (C.phase === 'intro') { C.groups = cerGroups(C.cats[C.ci]); C.gi = -1; C.queue = []; C.shown = []; C.last = null; C.phase = 'run'; return cerStep(); }
  if (C.phase === 'run') return cerStep();
  if (C.phase === 'catdone') { C.phase = ++C.ci >= C.cats.length ? 'end' : 'intro'; return go('cer'); }
}
function cerPick(i) { const o = CER.tie.order, k = o.indexOf(i); if (k < 0) o.push(i); else if (k === o.length - 1) o.pop(); go('cer'); }
function cerConfirm() { // l'ordine deciso a voce diventa la classifica del gruppo
  const C = CER, T = C.tie;
  C.queue = T.order.map((idx, k) => ({ ...T.items[idx], pos: T.start + k, tie: true })).filter(x => x.pos <= cerLimit()).reverse();
  C.phase = 'run'; cerStep();
}
function cerExit() { if (confirm('Uscire dalla presentazione?')) { CER = null; go('admin'); } }

V.cer = () => {
  const C = CER, c = C.cats[C.ci];
  const top = `<div class="top"><span class="muted">🎬 PRESENTAZIONE</span><button class="btn sm ghost" style="margin-left:auto" onclick="cerExit()">✕</button></div>`;
  if (C.phase === 'start') return top + `<div class="center"><div class="big">🎬</div><h1>PRESENTAZIONE<br>RISULTATI</h1>
    <p>Da qui puoi solo guardare e andare avanti.<br>Ogni categoria viene svelata dal fondo alla vetta; il premio assoluto per ultimo.</p><p>Annuncia:</p>
    <button class="btn ${C.mode === 'podium' ? '' : 'ghost'}" onclick="CER.mode='podium';go('cer')">SOLO PODIO</button><button class="btn ${C.mode === 'all' ? '' : 'ghost'}" onclick="CER.mode='all';go('cer')">TUTTI</button><br>
    <button class="btn" onclick="cerNext()">🎬 INIZIA</button></div>`;
  if (C.phase === 'end') return `<div class="center"><div class="big">🎉</div><h1>È TUTTO!</h1><p>Grazie a tutti per aver partecipato.</p><button class="btn" onclick="CER=null;go('admin')">ESCI</button></div>`;
  const head = `<div class="center" style="padding:8px 0"><div class="big" style="font-size:3.5rem">${esc(c.emoji)}</div><h1 style="font-size:2.2rem">${esc(c.name.toUpperCase())}</h1></div>`;
  if (C.phase === 'intro') return top + head + `<div class="dock"><button class="btn" onclick="cerNext()">SVELA ▶</button></div>`;
  if (C.phase === 'tie') {
    const T = C.tie;
    return top + head + `<section class="panel hero"><h2>⚖️ BALLOTTAGGIO</h2><p>${T.items.length} a pari merito con <b>${T.n} voti</b> per il ${T.start}° posto.<br>Decidete a voce, poi toccate i nomi dal MIGLIORE al peggiore.</p></section>
    <div class="grid">${T.items.map((x, i) => { const k = T.order.indexOf(i); return `<div class="card ${k >= 0 ? 'on' : ''}" onclick="cerPick(${i})"><b>${esc(x.p.name)}</b><span>${esc(x.p.costume || '')}</span>${k >= 0 ? `<em style="font-size:1.6rem">${cerMedal(T.start + k)}</em>` : ''}</div>`; }).join('')}</div>
    <div class="dock"><button class="btn ghost" onclick="CER.tie.order=[];go('cer')">↺ RICOMINCIA</button><button class="btn" ${T.order.length === T.items.length ? '' : 'disabled'} onclick="cerConfirm()">CONFERMA ORDINE ▶</button></div>`;
  }
  const rows = C.shown.slice().sort((a, b) => a.pos - b.pos).map(x => `<div class="cer-row ${x === C.last ? 'new' : ''} ${x.pos === 1 ? 'first' : ''}"><span class="pos">${cerMedal(x.pos)}</span>
    <div style="flex:1"><b>${esc(x.p.name)}${x.pos === 1 ? ' 👑' : ''}</b><br><span class="muted" style="font-size:1rem">${esc(x.p.costume || '')}${x.tie ? ' · ⚖️ ballottaggio' : ''}</span></div><b>${x.n} ${x.n === 1 ? 'voto' : 'voti'}</b></div>`).join('');
  const last = C.phase === 'catdone', more = C.ci + 1 < C.cats.length;
  return top + head + rows + (last && !C.shown.length ? '<p class="center muted">Nessun voto per questa categoria.</p>' : '') +
    `<div class="dock"><button class="btn" onclick="cerNext()">${last ? (more ? 'PROSSIMA CATEGORIA ▶' : 'FINE ▶') : 'AVANTI ▶'}</button></div>`;
};
