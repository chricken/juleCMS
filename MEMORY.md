# MEMORY.md – Langzeitspeicher für den Agenten

> Letzte Aktualisierung: Vollständige Projektanalyse nach User-Anfrage "Mach Dir ein Bild über das Projekt"

---

## Projekt: JuleCMS auf einen Blick

| Aspekt | Detail |
|--------|--------|
| Was | Dateibasiertes CMS ohne Datenbank, für eine Illustratorin (Fokus Bildverarbeitung) |
| Autor | C. Heisch (Christian Heisch) – für seine Frau Julia |
| Sprache | JavaScript ES Modules (`"type": "module"`), Vanilla JS + Vanilla CSS |
| Backend-Server | Node.js + Express 5, Port 80 (`settings.json`) |
| Admin-UI | `/public/backend` – komponentenbasiertes Vanilla JS, kein Framework |
| Público-Frontend | Theme-basiert (`/themes/default/`), wird nach `/public/` kopiert |
| Datenspeicher | JSON-Dateien unter `/contents/` – beim Serverstart in RAM geladen |
| Dependencies | express@5, formidable@3 (Upload), jimp@1 (Bild-Resize), better-opn@3 |

---

## Die .md Dateien im Projekt

| Datei | Zweck | Status |
|-------|-------|--------|
| `AGENTS.md` | Projektvorgaben, Coding Guidelines, Programmstruktur | Aktiv, verbindlich |
| `MEMORY.md` | Langzeitspeicher für den Agenten (diese Datei) | Wird gepflegt |
| `readme.md` | Projektbeschreibung für Menschen (soll zu `README.md` werden) | Vorhanden, lowercase |
| `TODO.md` | Offene Aufgaben, abgeleitet aus AGENTS.md | 12 Bereiche, teils abgehakt |

---

## Coding Guidelines (verbindlich aus AGENTS.md)

- **Vanilla JS + Vanilla CSS** – keine Frameworks, keine Build-Tools
- **DOM-Elemente als Components** – jede UI-Einheit ist eine Funktion, die DOM erstellt
- **Seiteninhalte als Views** – Views rendern ganze Bereiche
- Bevorzugte Techniken: Promises mit then-chaining, Destructuring, Spread, Named Arguments, Arrow-Funktionen, Template Literals, Default-Parameter, Lookup-Tables

---

## Projektstruktur (Dateibaum)

```
juleCMS/
├── AGENTS.md / MEMORY.md / readme.md / TODO.md
├── package.json              # express, formidable, jimp, better-opn; "type": "module"
├── cmsServer.js              # Einstieg: init() → manageContents.init → themes.init → listen → Browser öffnen
├── router.js                 # Express Router, alle /api/* Endpunkte (~15 Endpunkte)
├── manageContents.js         # Zentrale Datenverwaltung (pages, media, watermarks, items, convertImage mit Jimp)
├── settings.js / .json       # Port 80, Theme "default", Auflösungen [2200,1600,960,600,350,160], Debounce 1000ms
├── themes.js                 # Kopiert themes/<theme>/* nach public/* (beim Serverstart)
├── helpers.js                # createID(): Date.now().toString(36) + '_' + counter
├── classes/
│   ├── Page.js               # id, title, slug, visible, password, content[], children[], meta*, og*, crDate, chDate
│   ├── Item.js               # Content-Element: id, title, type, content, images[], links[], tags[], visible
│   ├── Image.js              # id, filename, resized[], tags, watermark, altName, description
│   └── Watermark.js          # id, filename, position, opacity, size, tiling, blendMode, resized[]
├── contents/
│   ├── structure.json        # pages[] flaches Array (10 Seiten), verknüpft über children[] + content[] (IDs)
│   ├── watermarks.json       # Aggregierte Wasserzeichen-Übersicht
│   ├── items/<id>.json       # 9 Content-Items als einzelne JSON-Dateien
│   ├── pages/                # (reserviert, aktuell leer)
│   ├── media/                # Bilder: <id>.jpg + <id>_<breite>.png + <id>.json + errors/404.jpg
│   └── watermarks/           # <id>.png + <id>_<breite>.png (5 Wasserzeichen)
├── public/
│   ├── backend/              # Admin-Oberfläche
│   │   ├── index.html        # Shell: header(h1 Jule CMS), nav, main, footer(© 2026)
│   │   └── assets/js/
│   │       ├── index.js      # Einstieg: loadJSON(/api/pages) → dom.mapping → viewTopNav → viewPages
│   │       ├── ajax.js       # Alle fetch()-Calls zu /api/*
│   │       ├── data.js       # Globaler State: pages[], currentPage, dropIndex, dragID, dragPageID
│   │       ├── dom.js        # dom.create({...}) + dom.mapping() – zentrales DOM-Helper
│   │       ├── elements.js   # Referenzen auf Haupt-DOM-Elemente
│   │       ├── helpers.js    # debouncer(), collapse()
│   │       ├── lang.js       # translations{phrase:{de,en}}, getPhrase(key), currentLanguage='de'
│   │       ├── settings.js   # elementTypes: [textOnly, titleOnly, textImageRight/Left/Bottom, slideshow, gallery, contactForm]
│   │       ├── components/   # 16 Komponenten-Ordner (Content, Page, NavPage, Input, Select, Checkbox, etc.)
│   │       │   ├── Content/  # Content.js (Haupt-Editor), Image.js (DnD), Link.js, types/
│   │       │   ├── Page/     # Page.js, Base.js, Contents.js, Meta.js, Content.css
│   │       │   ├── NavPage/  # Seitenbaum mit DnD
│   │       │   └── ...       # AddContent, DropContent, ImageInOverview, WatermarkInOverview, etc.
│   │       ├── views/        # Pages.js, Media.js, Watermarks.js, TopNav.js, Settings.js, Theme.js
│   │       └── modal/        # modal.js + AddImage/, EditImage/, EditWatermark/, LinkExternal/, LinkInternal/
│   ├── cms/                  # Vom Theme kopiert: css/styles.css, js/index.js
│   ├── index.html            # Frontend-Shell (vom Theme)
│   └── assets/               # Vom Theme kopiert
├── themes/
│   └── default/
│       ├── index.html        # Shell: <header>, <nav>, <main>, <footer> – leer, JS rendert hinein
│       └── assets/
│           ├── css/styles.css
│           └── js/index.js   # Leer: "This file should be empty by default..."
└── credentials.json          # {} (Passwort-Speicher, noch nicht implementiert)
```

---

## Datenmodell

### structure.json – 10 Seiten als flaches Array
- Root-Seite: `id: "root"`, children: [mrkll3pg_3, mrkljho1_1, m20938f5923mu023, ms7jddht_0]
- Eine Seite hat teils noch das alte Feld `childen` (Typo) neben `children`
- Verknüpfung: `children[]` (Seiten-IDs) + `content[]` (Item-IDs)
- Content-Items können auf mehreren Seiten referenziert werden

### Item (contents/items/<id>.json) – 9 Items
- Felder: id, title, type, content, images[], links[], tags[], visible, crDate, chDate

### Media (contents/media/) – Bilder
- Original: `<id>.jpg`, Resized: `<id>_<breite>.png` (160, 350, 600, 960, ...)
- Metadaten: `<id>.json` mit title, tags, description, altName, watermark, resized[]

### Watermarks (contents/watermarks/) – 5 Wasserzeichen
- `<id>.png` + `<id>_<breite>.png` (80, 150, 300, 600, 1200)

---

## API-Endpunkte (router.js)

| Methode | Pfad | Zweck |
|---------|------|-------|
| GET | `/api/pages` | Alle Seiten aus RAM |
| GET | `/api/content/:id` | Content-Item laden |
| POST | `/api/saveContent` | Content speichern |
| POST | `/api/moveContent` | Content per DnD verschieben |
| POST | `/api/movePage` | Seite per DnD verschieben (before/after/into) |
| POST | `/api/createContent` | Neues Item erstellen |
| POST | `/api/removeContent` | Item löschen |
| POST | `/api/savePage` | Seite speichern |
| POST | `/api/newPageAfter` / `/api/newPageIn` | Neue Seite erstellen |
| POST | `/api/removePage` | Seite + Kinder rekursiv löschen |
| POST | `/api/saveMedia` | Upload + Resize (Jimp) + JSON |
| POST | `/api/updateMedia` / `/api/deleteMedia` | Medien bearbeiten/löschen |
| POST | `/api/saveWatermark` / `/api/updateWatermark` / `/api/deleteWatermark` | Wasserzeichen CRUD |
| GET | `/api/loadMediaOverview` | Alle Media-JSONs |
| GET | `/api/loadWatermarkOverview` | Alle Wasserzeichen |
| GET | `/api/getImg/:folder/:filename` | Bild ausliefern (404-Fallback) |

---

## Stand der Umsetzung (aus TODO.md + Code-Analyse)

### Fertig
- [x] Seitenbaum mit Drag & Drop (before/after/into, Zirkelbezug-Prüfung)
- [x] Content-Editor mit Typ-Auswahl (8 Typen als SVG-Icons), Titel, Text, Bilder (DnD), Links, Tags
- [x] Auto-Save via Debouncer (1000ms)
- [x] Medien-Upload mit Jimp-Resize auf 6 Auflösungen
- [x] Wasserzeichen-Verwaltung (Upload + Resize)
- [x] Modal-System (AddImage, EditImage, EditWatermark, LinkExternal, LinkInternal)
- [x] i18n-Grundgerüst (de/en via lang.js)

### In Arbeit / Lücken
- [ ] Frontend ( público) komplett fehlt: kein Routing, kein Menüaufbau aus structure.json, keine Theme-Komponent

## Passwort-Feature (Settings) – umgesetzt

- **Input-Komponente** erweitert um `isPassword: true` – rendert echtes `<input type="password">` statt contenteditable span, mit Auge-Toggle-Button (👁) zum Umschalten auf Klartext. Methoden: `get()`, `set()`, `clear()`, `focus()` passen sich an.
- **Settings-View** (views/Settings.js): Zwei Passwort-Felder (neu + wiederholen) mit Live-Validierung – Speichern-Button nur aktiv bei Übereinstimmung und nicht leer. Feedback-Meldungen (match/mismatch/saved/error).
- **ajax.savePassword(password)** → POST /api/savePassword
- **router.js**: POST /api/savePassword – hasht mit Node crypto PBKDF2-SHA256 (100000 Iterationen, 16-byte Salt), speichert Hash+Salt in credentials.json. Leerós Passwort wird abgelehnt (400).
- **lang.js**: Neue Phrases: password, newPassword, repeatPassword, savePassword, passwordsMatch, passwordsDontMatch, passwordSaved, passwordSaveError (de/en)
- **CSS**: settings.css (neu, in styles.css importiert) + Input.css erweitert um .is-password, .eye-button

---


## Nachtrag: Passwort-Feature – Datei-Schreibweise wichtig!

Beim Schreiben von Dateien über `run_typescript`/`tools.file_system.write_file` wird der Windows-Pfad doppelt aufgelöst (`C:\c\Users\...`) – die Datei landet NICHT am Ziel. **Lösung: Dateien über `bash` + Heredoc (`cat > datei << 'EOF'`) schreiben.** Server danach neu starten (alten Prozess auf Port 80 töten: `tskill <PID>`), sonst liefert Express den alten Code aus dem RAM.

## Login-System – umgesetzt

- **Server (router.js)**: Session-Store `Map` (RAM), Session-ID = `crypto.randomUUID()`, Cookie `juleSession` (HttpOnly, SameSite=Strict). Middleware blockiert alle `/api/*` außer `/login`, `/checkAuth` und `/savePassword` (nur solange credentials.json leer = initiales Setup). Session-Timeout 8h Inaktivität. Login vergleicht PBKDF2-Hash mit `crypto.timingSafeEqual`.
- **Endpunkte**: `POST /api/login`, `POST /api/logout`, `GET /api/checkAuth`
- **Frontend**: `index.js` ruft zuerst `ajax.checkAuth()` – ohne Session wird nur `views/Login.js` gerendert (nav + main geleert, nur Passwortfeld + Button). Erst nach erfolgreichem Login läuft `init()` (TopNav + Pages). Kein DOM-Content ohne Auth.
- **Login-View**: `views/Login.js` + `login.css` – zentriertes Formular, Fehleranzeige, Button disabled bis Passwort eingegeben.
- **ajax.js**: `checkAuth()`, `login(password)`, `logout()`
- **lang.js**: loginTitle, loginButton, wrongPassword, loginError, logout (de/en)

### Test-Ergebnisse (alle bestanden)
1. Setup ohne Passwort → savePassword erlaubt
2. checkAuth ohne Cookie → false
3. /api/pages ohne Cookie → 401
4. savePassword ohne Auth (Passwort existiert) → 401
5. Login falsch → 401
6. Login richtig → 200 + Cookie
7. checkAuth mit Cookie → true
8. /api/pages mit Cookie → 200
9. Logout → danach 401

## Logout-Button + Admin-E-Mail – umgesetzt

- **Logout**: `TopNav.js` rendert rechts einen Logout-Link → `ajax.logout()` → `window.location.reload()` → checkAuth false → Login-View. `tabindex="-1"`, CSS in nav.css (.logout-link float:right).
- **Admin-E-Mail**: Settings-View um E-Mail-Input erweitert (Auto-Save via debouncer 800ms, toLowerCase). Gespeichert in `settings.json` via `settings.set('adminEmail', ...)`. API: `GET /api/adminEmail` (try/catch wegen settings.get-Crash bei undefined), `POST /api/saveAdminEmail`. Beide auth-geschützt. Test: admin@example.com gespeichert und aus settings.json lesbar.
- **Bug gefixt**: `settings.get(key)` crasht bei undefined key (JSON.parse(undefined)) – im Router mit try/catch abgefangen.

## JWT-Auth (ersetzt Session) + Testmail – umgesetzt

- **JWT selbst gebaut** (HMAC-SHA256 via crypto, base64url) – kein externes Paket. Secret `jwtSecret` + `tokenVersion` in credentials.json.
- Cookie `juleToken` (HttpOnly, SameSite=Strict, Max-Age=30d). Payload: `{lastLogin, iat, v}`.
- **Kein Auto-Logout mehr**: gültig solange `Date.now() - lastLogin < loginValidityDays * 86400000`. Default 3 Tage, in settings.json einstellbar (Settings-View: Input + debounced Save). API: GET/POST `/api/loginValidityDays`.
- **Logout invalidiert serverseitig**: tokenVersion++ in credentials.json → alte JWTs ungültig (checkAuth false, API 401). Verifiziert.
- **Tamper-proof**: manipuliertes JWT → Signatur-Prüfung mit timingSafeEqual → false.
- **Testmail**: `POST /api/sendTestMail` → nodemailer wenn `smtpHost` in settings.json konfiguriert, sonst `.eml`-Datei in `contents/mails/`. Button im Settings-View mit Feedback.
- **Bugfix settings.js**: `get(key)` returnt undefined statt zu crashen bei JSON.parse(undefined).
- nodemailer installiert (SMTP optional via settings.json: smtpHost, smtpPort, smtpUser, smtpPass, smtpSecure).

## SMTP-Einstellungen in Settings – umgesetzt

- **Settings-View**: neuer Abschnitt SMTP mit Host, Port, User, Passwort (isPassword, leer = unverändert), SSL/TLS-Checkbox. Auto-Save debounced 800ms.
- **API**: `GET /api/smtpSettings` (Passwort nicht zurückgegeben, nur `smtpPassSet: true/false`), `POST /api/saveSmtpSettings` → settings.json. Beide auth-geschützt.
- **sendTestMail** nutzt smtpHost/smtpPort/smtpUser/smtpPass/smtpSecure aus settings.json via nodemailer; ohne smtpHost Fallback auf .eml-Datei in contents/mails/.
- **Checkbox.js gefixt**: `set()` hinzugefügt, `get()`/`focus()` Bugs (elInput existierte nicht) behoben.
- Test: saveSmtpSettings → settings.json persistiert, GET zeigt Werte ohne Passwort, sendTestMail versucht SMTP-Verbindung (535 bei falschem Passwort = nodemailer funktioniert).

## Test-Nachricht für Testmail – umgesetzt

- Settings-View: multiline Input "Zusätzliche Test-Nachricht" (unter dem Testmail-Button), Auto-Save debounced in settings.json als `testMailMessage`.
- API: `GET /api/testMailMessage`, `POST /api/saveTestMailMessage` (auth-geschützt).
- `sendTestMail` hängt die Nachricht nach `---` an den Standardtext an (Datei-Fallback verifiziert: .eml enthält beide Texte).
- Hinweis: Beim Testen wurde settings.json ohne smtpHost wiederhergestellt – smtpHost/Port/User/Secure neu gesetzt, smtpPass muss in den Settings neu eingetragen werden.

## Settings-Redesign: 3 Bereiche + sticky Menü + Scrollspy + echtes Textarea

- **Input.js**: `multiline: true` rendert jetzt echtes `<textarea class="input textarea-input">` (statt contenteditable span). get/set/clear nutzen `.value`.
- **Settings.js** komplett neu (509 Zeilen): Layout `.settings-layout` = aside `.settings-menu` (sticky, left, 180px) + `.settings-content` mit 3 `<section>` (ids: settings-cms, settings-personal, settings-tech).
  - Menü-Punkte CMS / Persönlich / Tech, Klick → `scrollIntoView({behavior:'smooth'})`.
  - Scrollspy: window scroll-Handler (in `elements.settingsScrollHandler` gespeichert, bei View-Wechsel entfernt), markiert aktiven Punkt wenn Section-Top <= 140px.
  - Zuordnung: CMS = Max Bild-Auflösung; Persönlich = Passwort, Admin-E-Mail, Testmail-Button, Test-Nachricht (textarea), Login-Gültigkeit; Tech = SMTP (Host/Port/User/Pass/SSL).
- **settings.css**: Layout-Stile (.settings-menu sticky, .settings-menu-item.active blau, .textarea-input min-height 120px).
- Desktop only (kein Mobile-Handling nötig).

## Max Bild-Auflösung – funktional

- `settings.json`: `maxImageResolution: 2200` (default). API: `GET /api/maxImageResolution`, `POST /api/saveMaxImageResolution` (160–8000, auth-geschützt).
- **Server-seitig**: `manageContents.convertImage({..., maxRes})` filtert `defRes` mit `val <= w && val <= maxRes`. Beide Media-Aufrufe (saveMedia, updateMedia) übergeben `maxRes: settings.get('maxImageResolution')`. Watermarks unverändert (eigene watermarkResolutions, maxRes=Infinity default).
- **Settings CMS-Bereich**: Input mit debounced Auto-Save + Feedback.
- **Verifiziert**: Upload 2000x1000 Bild mit maxRes=1000 → resized nur 960/600/350/160, keine 1600/2200-Dateien auf Disk.

## Resize-System umgestellt: dynamische Stufen

- `convertImage({path, filename, maxRes})` berechnet Auflösungen dynamisch: `[maxRes, round(maxRes*2/3), round(maxRes/3), 160]`, dedupliziert, filtert `<= Originalbreite && <= maxRes`, sortiert absteigend.
- Media-Aufrufe (saveMedia/updateMedia) übergeben nur noch `maxRes` aus settings – kein defRes mehr. Watermarks behalten feste `watermarkResolutions` (defRes-Pfad, maxRes=Infinity).
- `defaultResolutions` in settings.json ist damit obsolet für Media.
- Verifiziert: maxRes=1000, Upload 2000x1000 → resized 1000, 667, 333, 160 + passende PNGs auf Disk.

## Konvention: Test-Server nach Test beenden

- User möchte NICHT, dass der Node-Server nach Tests weiterläuft. Nach jedem Test-Server-Start: PID auf Port 80 ermitteln (`netstat -ano | grep "0.0.0.0:80 " | grep ABH`) und mit `tskill <PID>` beenden. Port danach prüfen (frei).

## Fixes: Original nach Resize löschen + DeleteMedia-Crash

- saveMedia: nach JSON-write wird das Original (`<id>.<ext>`) per fs.unlink gelöscht (catch ignoriert ENOENT). Resized-Dateien + JSON bleiben.
- deleteMedia: löscht Original (falls vorhanden), alle resized UND die `<id>.json`; jedes unlink mit .catch(() => {}) – fehlende Dateien crashen nicht mehr.
- Crash-Ursache: `manageContents.media` war undefined (init() auskommentiert) → `Object.keys(undefined)` TypeError in router.js:447 und manageContents.js. Gefixt: init() setzt `media = {}`, router.js nutzt `|| {}` Guards, deleteMedia guarded.
- Verifiziert: Upload → .jpg weg, resized da; Delete → HTTP 200, filesDeleted, keine TypeErrors im Log.

## Fix: Bild-Anzeige lädt höchstes resized statt Original

- Problem: Original (`<id>.jpg`) wird nach Resize gelöscht → EditImage zeigte 404-Fallback.
- Fix: `EditImage.js` lädt `image.resized[0].filename` (resized ist absteigend sortiert = höchstes). Fallback auf filename.
- `ImageInOverview.js`: kleinstes resized via reduce (crash-sicher, war `find` auf undefined möglich).
- `AddImage/Image.js`: gt400-Fallback auf kleinstes resized.
- Verifiziert: Upload 1500px → resized[0]=_400.png HTTP 200 (837B); Original .jpg → 404-Fallback-Bild.

## Resize: Basis = min(maxRes, Originalbreite)

- convertImage: `base = Math.min(maxRes, w)` → Stufen `[base, round(base*2/3), round(base/3), 160]`, Filter nur noch `val <= w` (keine Vergrößerung).
- Verifiziert: 1500px bei maxRes=2200 → 1500, 1000, 500, 160; 2000px bei maxRes=1000 → 1000, 667, 333, 160.

## AddImage-Modal: Volltext-Filter + Tag-Auswahl

- `modal/AddImage/AddImage.js` neu: Filter-Bar mit CompInput (Volltext über title/description/altName/tags, case-insensitive) + Tag-Leiste (alle Tags aus allen Bildern, klickbar, multi-select, .active). applyFilter() blendet Bilder per display:none ein/aus. Tag-Logik: ODER (Bild sichtbar wenn mind. ein gewählter Tag passt; keiner gewählt = alle).
- Bugfix `AddImage/Image.js`: Fallback nutzte `image` statt `img` (undefined crash) → gefixt.
- CSS: .add-image-filter, .add-image-tag(.active), .add-image-list in AddImage.css.

## Medien-Übersicht: Drag & Drop Reihenfolge

- **Server**: `POST /api/saveMediaOrder {order:[ids]}` speichert `order: index` in jedem `contents/media/<id>.json`. `loadMediaOverview` liefert jetzt ein **Array sortiert nach order** (Fallback chDate; ohne order ans Ende).
- **Frontend**: `ImageInOverview` mit `draggable:true` + dragstart/dragover/drop/dragend (CSS: .dragging opacity, .drag-over dashed outline). `Media.js overview()`: `moveMedia(fromID,toID)` spoupeeld payload um, re-rendert, sendet `ajax.saveMediaOrder`. BtnSort (title/chDate) überschreibt die manuelle Reihenfolge beim Klick.
- Verifiziert: reorder umgedreht → loadMediaOverview liefert umgekehrt, order in JSON persistiert. Wieder zurückgesetzt.

## "Bild hochladen" im Content-Editor (Multi-Upload-Modal)

- Neuer Button neben "Bild hinzufügen" (Content.js) → `modal/UploadImages/UploadImages.js`.
- Modal: File-Input multiple → pro Datei eine Karte (Vorschau via FileReader, Titel=Dateiname ohne Extension, Beschreibung (textarea), Alt-Name, Tags, Entfernen-Button ✖).
- Speichern-Button disabled solange eine Karte keinen Titel hat. Upload sequentiell pro Karte via `ajax.saveMedia(FormData mit image[0])`, sammelt `payload.id`s → `onUploaded(ids)` → Content.js hängt ids an `data.images` an + saveContent + renderImages.
- Fix: `manageContents.saveMedia` gab undefined zurück → jetzt `.then(() => payload)` damit `res.payload.id` verfügbar ist.
