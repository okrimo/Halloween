package it.halloween.awards;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.print.PrintManager;
import android.provider.MediaStore;
import android.webkit.*;
import android.widget.Toast;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

public class MainActivity extends Activity {
    private WebView web, printer;
    private ValueCallback<Uri[]> chooser;
    private Uri camUri;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        getWindow().addFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        web = new WebView(this);
        setContentView(web);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        web.addJavascriptInterface(new Bridge(), "Android");
        web.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView v, String url) {
                try (InputStream in = getAssets().open("android-patch.js")) {
                    ByteArrayOutputStream o = new ByteArrayOutputStream();
                    byte[] buf = new byte[4096]; int n;
                    while ((n = in.read(buf)) > 0) o.write(buf, 0, n);
                    v.evaluateJavascript(o.toString("UTF-8"), null);
                } catch (Exception e) { e.printStackTrace(); }
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onJsAlert(WebView v, String u, String msg, JsResult r) {
                new AlertDialog.Builder(MainActivity.this).setMessage(msg).setCancelable(false)
                    .setPositiveButton("OK", (d, w) -> r.confirm()).show();
                return true;
            }
            @Override public boolean onJsConfirm(WebView v, String u, String msg, JsResult r) {
                new AlertDialog.Builder(MainActivity.this).setMessage(msg).setCancelable(false)
                    .setPositiveButton("OK", (d, w) -> r.confirm())
                    .setNegativeButton("Annulla", (d, w) -> r.cancel()).show();
                return true;
            }
            @Override public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (chooser != null) chooser.onReceiveValue(null);
                chooser = cb;
                try {
                    Intent i;
                    if (p.isCaptureEnabled()) { // "Scatta foto": apre direttamente la fotocamera
                        ContentValues cv = new ContentValues();
                        cv.put(MediaStore.Images.Media.DISPLAY_NAME, "costume_" + System.currentTimeMillis() + ".jpg");
                        cv.put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg");
                        camUri = getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, cv);
                        i = new Intent(MediaStore.ACTION_IMAGE_CAPTURE).putExtra(MediaStore.EXTRA_OUTPUT, camUri);
                    } else { camUri = null; i = p.createIntent(); }
                    startActivityForResult(i, 1);
                } catch (Exception e) {
                    chooser = null; cb.onReceiveValue(null);
                    Toast.makeText(MainActivity.this, "Impossibile aprire fotocamera o galleria", Toast.LENGTH_LONG).show();
                }
                return true;
            }
        });
        web.loadUrl("file:///android_asset/index.html");
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        super.onActivityResult(req, res, data);
        if (req == 1 && chooser != null) {
            Uri[] r = null;
            if (camUri != null) {
                if (res == RESULT_OK) r = new Uri[]{camUri};
                else getContentResolver().delete(camUri, null, null);
                camUri = null;
            } else r = WebChromeClient.FileChooserParams.parseResult(res, data);
            chooser.onReceiveValue(r);
            chooser = null;
        }
    }

    class Bridge {
        @JavascriptInterface public void saveBackup(String json) {
            runOnUiThread(() -> {
                try {
                    ContentValues v = new ContentValues();
                    v.put(MediaStore.Downloads.DISPLAY_NAME, "halloween-backup.json");
                    v.put(MediaStore.Downloads.MIME_TYPE, "application/json");
                    Uri u = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                    try (OutputStream o = getContentResolver().openOutputStream(u)) { o.write(json.getBytes("UTF-8")); }
                    Toast.makeText(MainActivity.this, "Backup salvato nella cartella Download", Toast.LENGTH_LONG).show();
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Errore nel salvataggio del backup", Toast.LENGTH_LONG).show();
                }
            });
        }
        @JavascriptInterface public void printHtml(String html) {
            runOnUiThread(() -> {
                printer = new WebView(MainActivity.this);
                printer.setWebViewClient(new WebViewClient() {
                    @Override public void onPageFinished(WebView v, String url) {
                        ((PrintManager) getSystemService(PRINT_SERVICE)).print("Codici", v.createPrintDocumentAdapter("Codici"), null);
                    }
                });
                printer.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
            });
        }
    }
}
