# 🎃 Halloween Awards

App di votazione per una festa, 100% locale (HTML + CSS + JavaScript + localStorage).

## Come avviare
Non serve installare nulla: apri `index.html` nel browser del tablet.

## Come utilizzare
1. Apri l'app sul tablet e inserisci il codice admin (predefinito: `ADMIN2026`).
2. Configura partecipanti (anche "Genera codici") e categorie.
3. Con "Stampa codici" prepara i biglietti da distribuire.
4. Controlla che la votazione sia aperta.
5. Ogni invitato inserisce il proprio codice e vota tutte le categorie (un codice = una sola votazione).
6. A fine serata l'admin apre "Risultati": vincitori, grafici, classifica generale.

Le foto sono facoltative: indica un percorso relativo (es. `foto/mario.jpg`, con la cartella `foto` accanto a `index.html`) o un URL.
Per modificare i dati iniziali (solo al primo avvio) edita `data.js`.

## Backup
I dati stanno nel localStorage di QUEL browser su QUEL tablet: non cancellare i dati di navigazione e usa sempre lo stesso browser.
- **ESPORTA DATI** (pannello admin): scarica `halloween-backup.json`.
- **IMPORTA DATI**: ripristina un backup scegliendo il file.
Fai un backup prima della festa e uno a fine votazione.
