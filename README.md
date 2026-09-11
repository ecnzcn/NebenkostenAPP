# NebenkostenAPP

Single-File HTML/JS PWA zur Verwaltung von Nebenkosten pro Wohnung und Jahr —
kein Build-Step, keine Abhängigkeiten außer zwei CDN-Skripten (Firebase,
jsPDF), die direkt im `<head>`/Body der Datei per `<script src>` eingebunden
sind.

## Nutzung

Die App besteht aus **einer einzigen Datei**: `nebenkosten.html`.

- **Mac / Desktop:** Datei im Browser öffnen.
- **iPhone:** Datei in Safari öffnen (z.B. via iCloud Drive) → Teilen-Button →
  „Zum Home-Bildschirm“. Läuft danach als eigenständige App, Daten liegen
  lokal in `localStorage` auf dem Gerät.

Ein ausführlicher Setup-Kommentarblock (Firebase-Konfiguration, minimale
Firestore-Regeln) befindet sich außerdem direkt am Kopf von `nebenkosten.html`.

## Sync zwischen Geräten (optional)

1. Firebase-Projekt anlegen, Firestore aktivieren, Web-App registrieren.
2. Die von Firebase angezeigte Konfiguration in der App unter
   **Einstellungen → Sync** einfügen (das komplette JS-Objekt aus der
   Firebase-Konsole kann 1:1 hineinkopiert werden, auch mit unquoted keys).
   Alternativ kann sie fest in die Konstante `FIREBASE_CONFIG` im `<script>`
   am Kopf der Datei eingetragen werden.
3. Einen frei wählbaren **Haushalts-Code** vergeben (z.B.
   `mueller-hauptstr-12`) und denselben Code auf allen Geräten eintragen.
4. Minimale Firestore-Regeln:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /households/{code} {
         allow read, write: if code is string && code.size() > 0;
       }
     }
   }
   ```

   Sicherheitshinweis: Der Haushalts-Code ist das einzige „Geheimnis“ —
   ausreichend für den privaten Gebrauch, aber jede Person, die den Code
   kennt, kann die Daten lesen und schreiben.

Beleg-Anhänge (Fotos/PDFs) werden bewusst **nur lokal** auf dem jeweiligen
Gerät gespeichert und **nicht** über Firestore synchronisiert (Base64 würde
das Dokumentenlimit sprengen). Alle anderen Felder werden per
Last-Write-Wins synchronisiert (letzter Schreibvorgang gewinnt bei
gleichzeitigen Änderungen auf zwei Geräten).

## Design

„Liquid Glass“-Designsprache (transluzente, geblurrte Flächen, dünne helle
Konturen, große Rundungen), fließend-responsives Layout ohne feste
Pixel-Breiten (Grid mit `minmax(min(...,100%),1fr)`, `clamp()` für
Schriftgrößen/Abstände), funktioniert von kleinem iPhone bis zu großen
Mac-Fenstern ohne horizontales Scrollen. Dunkelmodus mit drei Zuständen
(System / Hell / Dunkel), umschaltbar über den Mond/Sonne-Button im Header.

Alle Bestätigungen (Speichern/Abbrechen/Löschen) laufen über ein eigenes
In-App-Modal im Glass-Stil — es werden bewusst **keine** nativen
`confirm()`/`alert()`/`prompt()`-Dialoge und kein `window.print()` /
`window.open()` verwendet, da diese in einer als iOS-Home-Bildschirm-App
installierten PWA unzuverlässig sind. PDF-Exporte werden client-seitig mit
jsPDF erzeugt und per `Blob` + `<a download>` heruntergeladen.

## Manuelle Test-Checkliste

Diese Punkte vor jedem Release einmal manuell durchklicken (auf iPhone
*und* im Desktop-Browser):

- [ ] **Jahr anlegen**: „+ Jahr hinzufügen“, alle Felder ausfüllen (Strom,
      Internet, Müll, Abschlag, mind. 2 NK-Positionen, 1 Beleg-Foto),
      Speichern-Bestätigung erscheint, Jahreskarte zeigt korrekte Summe.
- [ ] **Jahr bearbeiten**: Werte ändern, Speichern-Bestätigung erscheint,
      Änderung wird übernommen.
- [ ] **Jahr abbrechen**: Im Bearbeiten-Formular etwas ändern, „Abbrechen“ →
      Bestätigung „Ohne Speichern schließen?“ erscheint, „Zurück“ hält das
      Formular offen, „Verwerfen“ schließt es ohne zu speichern.
- [ ] **Jahr löschen**: Löschen-Bestätigung erscheint, Jahr verschwindet aus
      Übersicht und Diagramm.
- [ ] **JSON-Export/Import**: Backup exportieren, App-Daten löschen
      (z.B. über Browser-Entwicklertools `localStorage.clear()`), Backup
      importieren, „Ersetzen“ wählen → alle Wohnungen/Jahre sind wieder da.
- [ ] **CSV-Export**: Datei in Excel/Numbers öffnen, Umlaute korrekt,
      Spalten sinnvoll befüllt.
- [ ] **PDF-Export pro Jahr**: Es wird eine echte PDF-Datei heruntergeladen
      (kein Druckdialog!) mit großem Gesamtbetrag, Balkendiagramm der
      Kostenverteilung, Jahresvergleich (falls Vorjahr existiert),
      Detailtabelle, Nachzahlung/Guthaben und Notiz.
- [ ] **Firebase-Sync**: Auf Gerät A Haushalts-Code + Config eintragen,
      „Verbinden“, Sync-Punkt wird grün. Auf Gerät B denselben Code
      eintragen → Daten von Gerät A erscheinen auf Gerät B automatisch
      (Snapshot-Listener).
- [ ] **Dark Mode**: Umschalten zwischen System/Hell/Dunkel über den
      Header-Button, Wahl bleibt nach Neuladen erhalten, alle Flächen
      (Header, Karten, Sheets) sind im Dark Mode gut lesbar.
- [ ] **Wohnung hinzufügen/umbenennen/löschen**: Über den Haus-Button im
      Header, Löschen fragt nach Bestätigung, die letzte verbleibende
      Wohnung kann nicht gelöscht werden.
- [ ] **Kein horizontales Scrollen**: Auf kleinem iPhone (z.B. iPhone SE,
      375px Breite) alle Sheets/Formulare inkl. dynamisch hinzugefügter
      NK-Positionen-Zeilen öffnen — nirgends darf horizontal gescrollt
      werden können.
- [ ] **Erinnerungs-Banner**: Ab März ohne Abrechnung des Vorjahres
      erscheint ein Banner; bei einem Kündigungsdatum (Strom/Internet)
      innerhalb der nächsten 60 Tage erscheint ebenfalls ein Banner.

### Automatisierter Smoke-Test (optional, nur für Entwicklung)

Ein Playwright-Skript, das die wichtigsten Flows (Jahr-CRUD,
Wohnung-CRUD, Export/Import, Dark Mode, Responsive-Overflow-Check über
mehrere Breakpoints) headless durchklickt, kann bei Bedarf lokal
geschrieben werden (`playwright-core` + der mitgelieferte Chromium reichen,
kein vollständiges `npm`-Projekt in der App selbst nötig). Dieses Skript ist
reines Entwicklungswerkzeug und nicht Teil der ausgelieferten
`nebenkosten.html`.
