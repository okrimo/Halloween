exportData = function () { Android.saveBackup(JSON.stringify(db, null, 1)); };
printCodes = function () {
  Android.printHtml('<title>Codici</title><style>body{font-family:sans-serif;text-align:center}div{border-bottom:1px dashed #000;padding:18px;font-size:22px}b{font-size:32px;letter-spacing:5px}</style><h1>🎃 ' + esc(db.settings.eventName) + '</h1>' +
    db.participants.map(function (p) { return '<div>' + esc(p.name) + '<br>CODICE: <b>' + esc(p.code) + '</b></div>'; }).join(''));
};
