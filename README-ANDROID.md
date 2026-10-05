# Halloween Awards – APK Android

Wrapper nativo (WebView) che apre l'app web da dentro l'APK: niente browser, niente file da aprire.
`index.html`, `style.css`, `app.js`, `data.js` sono identici alla versione web e stanno in `app/src/main/assets/`.

## Creare l'APK
1. Installa Android Studio (gratis).
2. File → Open → scegli la cartella `halloween-android` e attendi la sincronizzazione di Gradle.
3. Menu Build → Build Bundle(s) / APK(s) → Build APK(s).
4. Il file è in `app/build/outputs/apk/debug/app-debug.apk`.
5. Copialo sul tablet (cavo, Drive, ecc.), aprilo e consenti "Installa app sconosciute". Serve Android 10 o superiore.

In alternativa, con il tablet collegato in debug USB, premi Run in Android Studio.

## Differenze rispetto al browser
- Lo schermo resta acceso mentre l'app è aperta.
- ESPORTA DATI salva `halloween-backup.json` nella cartella Download. IMPORTA DATI apre il selettore file.
- STAMPA CODICI usa il servizio di stampa di Android (puoi anche salvare in PDF).
- I dati restano nell'app: si perdono se disinstalli o cancelli i dati dell'app, quindi fai un backup prima.

## Se modifichi l'app web
Ricopia i 4 file in `app/src/main/assets/` e ricostruisci l'APK.
