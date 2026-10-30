# 🎃 Halloween Awards – versione GitHub Pages + Fogli Google

## Pubblicazione (una tantum)
1. Crea un Foglio Google → Estensioni → Apps Script → incolla `apps-script/Code.gs`.
2. Distribuisci → Nuova distribuzione → ingranaggio → **App web** → Esegui come **Me** → Accesso **Chiunque** → Distribuisci e autorizza.
3. Copia l'URL che finisce con `/exec` e incollalo in `data.js` al posto di `SHEETS_URL = ''`.
4. Carica tutti i file nella radice del repository (repository pubblico), poi Settings → Pages → branch → `/ (root)`.
5. Il link `https://TUO-UTENTE.github.io/REPO/` è quello da dare agli invitati.

Se aggiorni un repository già pubblicato, NON sovrascrivere `data.js` (contiene il tuo URL). Se cambi `Code.gs` ripubblicalo come **Nuova versione**.

## Durante la festa
- Admin: configura partecipanti/categorie, poi **PUBBLICA SU FOGLI** (ripeti dopo ogni modifica). Usa sempre lo stesso dispositivo.
- Invitati: aprono il link, inseriscono il codice e votano (i voti partono tutti insieme alla fine).
- Admin: **SCARICA VOTI** per controllare chi ha votato; i numeri nelle statistiche sono cliccabili.

## Fine del contest
- In Impostazioni puoi indicare data e ora di fine: da quel momento non si vota più e chi apre il link vede i risultati.
- Oppure usa **PUBBLICA RISULTATI** nel pannello admin (e **NASCONDI RISULTATI** per tornare indietro).

## Presentazione in diretta (solo admin)
Chiudi la votazione, poi **🎬 PRESENTAZIONE**: categoria per categoria, i partecipanti compaiono dal fondo alla vetta, il premio assoluto per ultimo.
In caso di parità compare un **ballottaggio**: scegli a voce l'ordine e tocca i nomi dal migliore al peggiore.
