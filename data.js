// Dati iniziali (usati solo al primo avvio). Poi tutto vive nel localStorage.
const KEY = 'halloweenAwards';
// Per votare da telefono: incolla qui l'URL /exec di Google Apps Script. Vuoto = app solo locale.
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxOpsNm8s0HYdAOEqvkAwEtdtokW_fhjT1qVh4-ORqNZqLxTRRTktFK1UguJwqINRXtRQ/exec';
const DEFAULT = {
  settings: { eventName: 'Halloween Awards 2026', adminCode: 'ADMIN2026', allowSelfVote: false, open: true },
  participants: [
    { id: 'p1', name: 'Mario Rossi', code: 'A123', costume: 'Dracula', photo: '', voted: false },
    { id: 'p2', name: 'Giulia Bianchi', code: 'B456', costume: 'Strega', photo: '', voted: false },
    { id: 'p3', name: 'Luca Verdi', code: 'C789', costume: 'Joker', photo: '', voted: false },
    { id: 'p4', name: 'Francesca Neri', code: 'D234', costume: 'Scheletro', photo: '', voted: false }
  ],
  categories: [
    { id: 'cat1', name: 'Costume più spaventoso', emoji: '👻', active: true },
    { id: 'cat2', name: 'Costume più divertente', emoji: '😂', active: true },
    { id: 'cat3', name: 'Costume più creativo', emoji: '🎨', active: true },
    { id: 'cat4', name: 'Costume più originale', emoji: '🔥', active: true },
    { id: 'cat5', name: 'Costume della serata', emoji: '👑', active: true }
  ],
  votes: []
};
function load() {
  try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.settings) return migrate(d); } catch (e) {}
  return migrate(JSON.parse(JSON.stringify(DEFAULT)));
}
// Aggiunge i campi nuovi ai dati vecchi: tipo categoria (normal / couple / overall) e partner di coppia.
function migrate(d) {
  d.categories.forEach(c => { if (!c.kind) c.kind = /della serata|assolut/i.test(c.name) ? 'overall' : 'normal'; });
  d.participants.forEach(p => { if (p.partner === undefined) p.partner = ''; });
  return d;
}
function save() { localStorage.setItem(KEY, JSON.stringify(db)); }
let db = load();
