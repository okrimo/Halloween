# Votare dal proprio telefono (Fogli Google)

Configurazione (partecipanti, categorie, codici) e risultati restano nell'app dell'admin, come prima.
Solo i voti passano da un Foglio Google tuo, tramite uno script gratuito. Nessun database o servizio terzo.

## Una tantum
1. Crea un Foglio Google nuovo → Estensioni → Apps Script → incolla il contenuto di `Code.gs` → salva.
2. Distribuisci → Nuova distribuzione → tipo "App web" → Esegui come: **Me** → Chi ha accesso: **Chiunque** → Distribuisci e autorizza.
3. Copia l'URL che finisce con `/exec` e incollalo in `data.js` al posto di `SHEETS_URL = ''`.
4. Pubblica i file dell'app su GitHub Pages (repository → Settings → Pages → branch main, cartella root).

## Durante la festa
- Usa SEMPRE lo stesso dispositivo/browser per l'admin (la configurazione sta lì).
- Admin: inserisci partecipanti e categorie, poi **PUBBLICA SU FOGLI**. Ripeti dopo ogni modifica o cambio dei codici.
- Gli invitati aprono il link GitHub Pages, inseriscono il codice e votano. I voti compaiono nel foglio "Voti".
- Admin: **SCARICA VOTI** (o "Aggiorna dai fogli" in Risultati) per vedere chi ha votato, i voti e la classifica.
- Chiudi/riapri e Reset voti agiscono anche sul foglio.

## Note
- Serve internet su ogni telefono. Ogni azione impiega circa 1-2 secondi.
- Le foto scattate vengono ridotte (256 px) per entrare nel foglio; foto troppo pesanti vengono sostituite dall'icona.
- Il codice admin viene salvato nel foglio alla prima pubblicazione. Se lo cambi dopo, modificalo anche nella scheda "Impostazioni" del foglio.
- Se modifichi `Code.gs`, devi ripubblicare: Distribuisci → Gestisci distribuzioni → modifica → Nuova versione.
