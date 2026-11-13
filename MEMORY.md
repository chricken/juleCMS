# MEMORY.md – Langzeitspeicher für den Agenten

> Letzte Aktualisierung: 2026-05-18 – "Mach Dir ein Bild über das Projekt" (vollständige Re-Analyse aller Dateien)

---

## Projekt: JuleCMS auf einen Blick

| Aspekt | Detail |
|--------|--------|
| Was | Dateibasiertes CMS ohne Datenbank, für eine Illustratorin (Fokus Bildverarbeitung) |
| Autor | C. Heisch (Christian Heisch) – für seine Frau Julia |
| Sprache | JavaScript ES Modules (`"type": "module"`), Vanilla JS + Vanilla CSS |
| Backend-Server | Node.js + Express 5, Port **8654** (`settings.json`), startet Browser auf `/backend` |
| Admin-UI | `/public/backend` – komponentenbasiertes Vanilla JS, kein Framework |
| Público-Frontend | Theme-basiert (`/themes/default/`), wird nach `/public/` kopiert; **noch leer** (index.js ist Stub) |
| Datenspeicher | JSON-Dateien unter `/contents/` – beim Serverstart in RAM geladen |
| Dependencies | express@5, formidable@3 (Upload), jimp@1 (Bild-Resize), better-opn@3, **nodemailer@10** (Mail) |
| Auth | JWT in Cookie `juleToken` (HS256), Secret in `credentials.json`, Passwort PBKDF2-SHA256 100k Iterationen, gültig `loginValidityDays` (default 3) |

---

## Einstiegs- und Datenfluss (heute verifiziert)

```
cmsServer.js → manageContents.init() (lädt structure.json + watermarks.json in RAM)
             → themes.init() (kopiert themes/<theme>/ → public/)
             → server.listen(8654) → opn(http://localhost:8654/backend)

Backend index.js → ajax.checkAuth() → JWT prüfen
                → authenticated? → init(): /api/pages laden → viewTopNav → viewPages
                → nicht auth?       → viewLogin (Login-Formular)

Datenfluss: JSON-Dateien ↔ manageContents (RAM) ↔ router.js (/api/*) ↔ ajax.js ↔ Views/Components
```

## Wichtige Korrekturen gegenüber älterer Analyse

- Port ist **8654**, nicht 80
- `nodemailer` ist als Dependency vorhanden (SMTP + .eml-Fallback in contents/mails/)
- `contents/media.json` ist `{}` (leer) — Medien liegen nur als Einzel-JSONs in `contents/media/<id>.json`
- `contents/watermarks.json` ist ein Objekt keyed by ID (nicht Array)
- structure.json hat 10 Seiten, eine davon mit Tippfehler `"childen"` statt `"children"` (id=m20938f5923mu023)
- `themes/default/assets/js/index.js` ist ein leerer Stub — das öffentliche Frontend fehlt komplett
- `themes/default/index.html` lädt `cms/js/index.js` (existiert nicht) + `assets/js/index.js` (leer)
- Page.moveChild() und Page.moveContent() sind leere Stubs in classes/Page.js
- Login-System: JWT-basiert, Middleware schützt alle /api/* außer login/checkAuth/savePassword

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

---

## Upload-Architektur (2026-05-18, korrigiert nach User-Feedback)

- **Media-View** (`views/Media.js`): Button "Medien hochladen" → `ModalUploadImages` (modal/UploadImages/UploadImages.js). Multi-File-Input, pro Datei eine Card mit Preview + Titel/Beschreibung/Alt/Tags, sequentieller Upload via `ajax.saveMedia`, danach Overview neu rendern.
- **Content-Editor** (`components/Content/Content.js`): Button "Bilder hochladen" → Modal mit `UploadMedia` (components/UploadMedia/UploadMedia.js). Einzel-Upload wie früher die linke Spalte im Media-View (Titel/Beschreibung/Alt/Wasserzeichen/Tags/Datei/Upload-Button). `onUploaded(res)` hängt `res.payload.id` an `data.images`.
- `UploadMedia` ist die wiederverwendbare Einzel-Upload-Komponente; `UploadImages` das Multi-Upload-Modal. Beide nutzen `ajax.saveMedia` (FormData mit `image[0]`).

## Korrektur 2026-05-18 (2): Upload-Button + Content-Upload

- Media-View-Button hat jetzt `button button-small` (gleiche Höhe wie alle anderen Buttons; vorher nur `button` = padding 0.8rem/1.5rem).
- Content-Editor "Bilder hochladen" öffnet wieder `ModalUploadImages` (Multi-Upload-Modal, identisch mit Media-View); `onUploaded(ids)` hängt alle IDs an `data.images`.
- `components/UploadMedia/` ist derzeit ungenutzt (liegt brach).

## Auth auf localStorage umgestellt (2026-05-18, keine Cookies mehr)

- `router.js getToken()` liest `Authorization: Bearer <jwt>` statt Cookie `juleToken`.
- `POST /api/login` liefert Token im JSON-Body (`{status, authenticated, token}`), kein Set-Cookie mehr. `POST /api/logout` löscht serverseitig nichts (nur tokenVersion++), kein Set-Cookie.
- `ajax.js`: zentrale `apiFetch(url, options)` hängt automatisch `Authorization: Bearer` aus `localStorage.getItem('juleToken')` an alle Requests. `login()` speichert `result.token` im localStorage, `logout()` entfernt ihn.
- Verifiziert: ohne Token → 401/false; mit signiertem Bearer → checkAuth true, /api/pages 200; keine Set-Cookie-Header in Antworten.

## Vorschaubild pro Seite (2026-05-18)

- `components/Page/Base.js`: Sektion "Vorschaubild" (Feld `previewImage` existiert in Page-Klasse + structure.json). Ohne Bild: Buttons "Bild auswählen" (ModalAddImage) + "Bilder hochladen" (ModalUploadImages, erste ID gewinnt). Mit Bild: Thumbnail (kleinstes resized >= 150px, lazy) + "Bild ändern" + "Hochladen" + "Löschen" (setzt ''). Speichern via saveDebounced → savePage übernimmt komplettes Objekt.
- Neue lang-Phrases: previewImage, selectImage, changeImage.
- accept eingeschränkt auf `image/*,.webp,.avif` in `modal/UploadImages/UploadImages.js` und `components/InputFile/InputFile.js`.
- CSS: `.preview-image` in page.css (Thumb 160px).

## Template-System fürs Frontend (2026-05-18)

- `themes/<name>/` = Theme-Ordner (index.html, assets/, components/, views/, favicon). Aktuell nur `default`.
- `themes.js`: `list()` listet Theme-Ordner; `init()` löscht `public/theme` (fs.rm recursive force) und kopiert `themes/<settings.theme>/*` nach `public/theme/`.
- `cmsServer.js`: `express.static('public')` + `GET /` → `sendFile('theme/index.html')`. Altlasten `public/index.html|assets|favicon.png` (vom alten Kopier-nach-public-Mechanismus) wurden entfernt.
- `public/cms/js/` = theme-unabhängig: ajax.js (loadJSON, getImg), helpers.js, index.js (lädt `/api/structure`, feuert `jule:structure` Event).
- Theme-index lädt `/cms/js/index.js` (Boot) + `/theme/assets/js/index.js` (theme-eigen), CSS `/theme/assets/css/styles.css` — alles absolute Pfade.
- API: `GET /api/themes` → {themes, current}; `POST /api/selectTheme {theme}` → prüft Existenz, `settings.set('theme', …)`, greift beim nächsten Server-Start. `GET /api/structure` ist öffentlich (wie getImg) fürs Frontend-Routing.
- Theme-View (`views/Theme.js`): Card pro Theme, Klick → selectTheme → re-render, aktives mit "✓ aktiv". ajax.loadThemes/selectTheme. CSS `.theme-list/.theme-card` in styles.css.
- Verifiziert: themes.init kopiert+leert public/theme, Theme-Wechsel nach public/theme, GET / liefert theme/index.html, /cms + /theme statisch 200, /api/structure ohne Token 200, selectTheme schreibt settings.json.

## Theme default – erste vollständige Struktur (2026-05-18)

- `themes/default/assets/js/`: `index.js` (wartet auf `jule:structure`, rendert Header/Nav/Footer, startet Router), `router.js` (`findPage` nach slug||id, `/`→root, history pushState/popstate, `pageURL`), `components/` (Header, Footer, Navigation, Content), `views/Page.js`.
- Navigation: flaches Menü = sichtbare children von root; hat die aktuelle Seite children → nested `<ul class="nav-sub">` (rekursiv). Klick → router.navigate (kein Reload).
- Page-View: h1 Titel + pro content-ID `GET /api/content/:id` → `res.payload` → Content-Komponente.
- Content-Komponente: Typen titleOnly, textOnly/default, textImageLeft/Right (flex row, Reihenfolge via append), textImageBottom, gallery/slideshow (as-is Bilder), contactForm (Platzhalter), Links als Liste. Bilder "as is": größtes resized (`resized[0]`, Original wird serverseitig gelöscht) via `/api/getImgMetaData/media/<id>` → `/api/getImg/media/<filename>`.
- Öffentlich freigegeben: `/api/structure`, `/api/content/*`, `/api/getImgMetaData/*`, `/api/getImg/*`.
- `cmsServer.js`: SPA-Fallback `server.get('/*splat')` → theme/index.html (Express 5 Syntax); `/api` + `/backend` matchen vorher.
- `public/cms/js/`: dom.js (create-Helper), ajax.js, helpers.js, index.js (Boot feuert `jule:structure`).
- Verifiziert: /, /homeristderkrass → theme index 200; /api/structure, /api/content/:id, /api/getImgMetaData ohne Token 200; /theme + /cms statisch 200; /backend/ 200.

## Theme default – Detailkorrekturen (2026-05-18)

- Nested Routing: `findPage` verfolgt Pfad segmentweise durch den Baum (`/vorfahr-slug/child-slug`); `pageURL` baut verschachtelte URLs aus den Vorfahren-slugs (root → `/`).
- Untermenü persistent im Zweig: `topLevelOf(page)` = direkter root-Vorfahre; `Navigation` rendert dessen children in `<aside id="subnav">` (links neben main, flex layout) — auch auf allen Unterseiten des Zweigs sichtbar.
- Header-Titel ist Link auf `/` (Home). Klickbares Breadcrumb (`components/Breadcrumb.js`): Home / Vorfahr / … / aktuelle Seite, letzte ohne Link, Rendern in PageView oben.
- Verifiziert: findPage('/homeristderkrass/mrj8m969_0') → "Die zweite Seite", topLevelOf(Unterseite) → "Eine Seite", pageURL → '/homeristderkrass/mrj7te8m_1', Breadcrumb-Kette Wurzel > Eine Seite > Unterseite; HTTP: / + nested path → index 200, theme-Dateien frisch kopiert.

## Markdown im Frontend (2026-05-18)

- `public/cms/plugins/marked.esm.js` (marked v18, vom User abgelegt) wird über `public/cms/js/markdown.js` gewrappt: `renderMD(text)` = `marked.parse` mit `{gfm:true, breaks:true}` (einzelne Zeilenumbrüche → <br>).
- `themes/default`: Content.js rendert `item.content` in allen Typen als Markdown (div.content-md statt p mit Rohtext); Page.js rendert `page.description` als Markdown unter dem Seitentitel. Titel bleiben Klartext.
- CSS `.content-md` in theme styles.css (Überschriften, Listen, code/pre, blockquote, Tabellen, Bilder max-width 100%).
- Verifiziert: marked.parse in node liefert korrektes HTML; /cms/plugins/marked.esm.js + /cms/js/markdown.js → 200 text/javascript.

## Markdown-Fix (2026-05-18): public/theme war veraltet + Zeilenumbruch-Normalisierung

- Symptom: Listen rendern nicht. Ursache u.a.: `public/theme` enthielt noch das alte Theme (Kopie erst beim Serverstart) — manuell via themes.init() aktualisiert, Content.js enthält jetzt renderMD (5 Stellen).
- `markdown.js renderMD()` normalisiert jetzt CRLF/CR → LF vor `marked.parse` (marked v18 verkraftet CRLF zwar, Normalisierung schadet nicht). breaks:true bleibt (einzelnes \n → <br> im Fließtext; Listen brauchen kein <br> davor — verifiziert mit echtem Item mtsmh6r6_0: rendert sauberes <ul>).
- Test: renderMD('Dies ist eine Liste:\n- Merkur\n...') → <p>..</p><ul><li>Merkur</li>...</ul><p><code>x = 100</code></p>.

---

## Vollständige Re-Analyse (2026-05-18, "mach Dir ein Bild über das Projekt")

### Technologie-Stack
- **Node.js + Express 5** (`"type": "module"`, ES Modules überall)
- **Vanilla JS + Vanilla CSS** — keine Frameworks, keine Build-Tools
- **JSON-Dateien als Datenspeicher** — keine Datenbank, alles unter `/contents/`
- Dependencies: `express@5`, `formidable@3` (Multipart-Uploads), `jimp@1` (Bild-Resize/Wasserzeichen), `better-opn@3` (Browser öffnen), `nodemailer@10` (SMTP + .eml-Fallback)
- Port **8654** (settings.json), Server startet Browser auf `/backend`

### Einstiegsfluss
```
cmsServer.js
  → manageContents.init()   // lädt structure.json + watermarks.json in RAM, legt Ordner an
  → themes.init()           // kopiert themes/<aktives Theme>/ nach public/theme/
  → server.listen(8654)     // express.static('public'), /api → router, SPA-Fallback → theme/index.html
  → opn(http://localhost:8654/backend)
```

### Backend (Admin-UI unter /public/backend/)
Komponentenbasiertes Vanilla JS. Einstieg: `assets/js/index.js`
→ `ajax.checkAuth()` (JWT in localStorage `juleToken`)
→ authentifiziert: `init()` lädt `/api/pages` → `viewTopNav` + `viewPages`
→ nicht authentifiziert: `viewLogin`

**Views:** Pages, Media, Watermarks, Theme, Settings, Login, TopNav

**Zentrale Konzepte:**
- `dom.create({...})` — universeller DOM-Builder mit Named Arguments (in dom.js)
- `ajax.js` — alle API-Calls mit Bearer-Token
- `data.js` — globales State-Objekt (pages, currentPage, dragID, etc.)
- `elements.js` — gemappte DOM-Referenzen (nav, main, pages, page)
- `lang.js` — i18n mit `translations` Objekt + `getPhrase(key)`, Sprachen: de/en
- Custom Events: `jule:rerenderNav`, `jule:renderPage` (vermeidet zirkuläre Imports)

**Seiten-Verwaltung:**
- Linke Spalte: Baum aller Seiten als `<pages>` mit DnD (before/after/into, Zirkelbezug-Prüfung via `manageContents.isDescendant`)
- Rechte Spalte: `<page>` mit Page-Komponente (Base, Contents, Meta)
- Content-Elemente pro Seite: DnD-Reihenfolge, Hinzufügen/Entfernen
- Content-Editor: Typ-Auswahl via SVG-Icons (8 Typen), Titel, Text, Bilder, Links, Tags

**Medien:** Upload via Modal (mehrere Bilder), serverseitig Resize mit Jimp auf `defaultResolutions` oder dynamisch nach `maxImageResolution`, JSON-Metadaten pro Bild, Übersicht mit Filter/Sort/Tags/DnD-Reihenfolge

**Wasserzeichen:** Ähnlich wie Medien — Upload, Resize auf `watermarkResolutions`, Bearbeitung in Modal. Noch nicht beim Bild-Resize angewendet (TODO)

**Einstellungen:** Passwort (PBKDF2-SHA256, 100k Iterationen in credentials.json), SMTP-Konfig, Admin-E-Mail, Login-Gültigkeit (Tage), max. Bildauflösung, Testmail (nodemailer oder .eml-Datei in contents/mails/)

**Auth:** JWT (HS256), Secret + tokenVersion in credentials.json, Middleware schützt alle `/api/*` außer `login`, `checkAuth`, `savePassword` (erstes Setup), `structure`, `content/*`, `getImgMetaData/*`, `getImg/*` (öffentlich fürs Frontend)

### Frontend (Theme default, unter /public/theme/ = Kopie aus /themes/default/)
Zwei-Schicht-System:
1. **Theme-unabhängiger Boot** (`/public/cms/js/`): `index.js` lädt `/api/structure`, setzt `window.jule = {structure}`, feuert `jule:structure` Event. Gemeinsame Helfer: `dom.js`, `ajax.js`, `helpers.js` (createID, debouncer), `markdown.js` (marked v18, gfm+breaks, CRLF-Normalisierung)
2. **Theme-eigene Logik** (`/public/theme/assets/js/`): `index.js` wartet auf `jule:structure`, rendert Header/Nav/Footer, startet Router

**Routing** (`router.js`): History API, `findPage(path)` verfolgt Segmente durch Baum (slug||id), `pageURL(page)` baut verschachtelte URLs, `topLevelOf(page)` für Zweig-Unismenü. SPA-Fallback in cmsServer.js liefert theme/index.html für alle Nicht-API-Pfade.

**Komponenten:** Header (Titel-Link auf /), Navigation (flaches Hauptmenü aus root.children + persistent Untermenü in `<aside id="subnav">`), Breadcrumb (klickbar, Home/Vorfahren/aktuell), Content (8 Typen: titleOnly, textOnly/default, textImageLeft/Right/Bottom, gallery, slideshow, contactForm — alle mit Markdown-Rendering via renderMD), Page-View (Breadcrumb + h1 + description + Content-Elemente via `/api/content/<id>`)

**Bilder im Frontend:** `/api/getImgMetaData/media/<id>` → größtes `resized[0]` (absteigend sortiert) via `/api/getImg/media/<filename>`

### Datenmodell (/contents/)
```
contents/
├── structure.json          # {pages: [...]} — alle Seiten flach, mit children[] und content[] (IDs)
├── items/<id>.json         # Einzelnes Content-Element (Item-Klasse)
├── media/<id>.json         # Bild-Metadaten (Image-Klasse) + <id>_<breite>.png (resized) + <id>.<ext> (Original, wird gelöscht)
├── media/errors/404.jpg    # Fehlerbild
├── media.json              # {} (leer, Debouncer-Ziel)
├── watermarks.json         # {<id>: {...}} — Wasserzeichen-Metadaten (Watermark-Klasse)
├── watermarks/<id>.png + <id>_<breite>.png  # Original + resized Stufen
└── mails/*.eml             # Gespeicherte Testmails (Fallback ohne SMTP)
```

**Page:** id, title, slug, visible, password, content[], children[], description, previewImage, metaTitle/Description/Keywords, ogTitle/Description/Image, crDate, chDate
**Item:** id, title, type, content, images[], tags[], links[], visible, crDate, chDate
**Image:** id, title, filename, tags[], resized[], description, altName, type, visible, watermark, order, crDate, chDate
**Watermark:** id, title, description, filename, resized[], tiling, size, position, opacity, blendMode, crDate, chDate

### Server-Klassen (/classes/)
- `Page.js`, `Item.js`, `Image.js`, `Watermark.js` — Konstruktoren mit Destructuring + Default-Parametern, `helpers.createID()` für IDs
- `manageContents.js` — zentrale Datenverwaltung: init (lädt JSONs in RAM), CRUD für Pages/Contents/Media/Watermarks, `convertImage()` (Jimp-Resize), Debouncer für Datei-Saves, `isDescendant()` (Zirkelbezug-Prüfung)

### API-Endpunkte (router.js, alle /api/*)
Auth: `login`, `logout`, `checkAuth`, `savePassword`
Seiten: `pages`, `savePage`, `newPageAfter`, `newPageIn`, `removePage`, `movePage`
Content: `content/:id`, `createContent`, `saveContent`, `removeContent`, `moveContent`
Media: `saveMedia`, `updateMedia`, `deleteMedia`, `loadMediaOverview`, `saveMediaOrder`, `getImgMetaData/:folder/:id`, `getImg/:folder/:filename`
Watermarks: `saveWatermark`, `updateWatermark`, `deleteWatermark`, `loadWatermarkOverview`
Themes: `themes`, `selectTheme`
Settings: `smtpSettings`, `saveSmtpSettings`, `testMailMessage`, `saveTestMailMessage`, `sendTestMail`, `maxImageResolution`, `saveMaxImageResolution`, `adminEmail`, `saveAdminEmail`, `loginValidityDays`, `saveLoginValidityDays`
Öffentlich: `structure`

### befundende Besonderheiten / Auffälligkeiten
- `structure.json` enthält Tippfehler: `"childen"` statt `"children"` bei id=m20938f5923mu023
- `contents/media.json` ist `{}` — Medien liegen nur als Einzel-JSONs
- `Page.moveChild()` und `Page.moveContent()` sind leere Stubs
- Wasserzeichen werden gespeichert, aber noch nicht beim Bild-Resize eingebrannt
- `themes/default/index.html` lädt `/cms/js/index.js` (Boot) + `/theme/assets/js/index.js` (Theme)
- `marked.esm.js` liegt in `/public/cms/plugins/` (vom User abgelegt, v18)
- `settings.js` macht Settings immutable (get gibt Deep-Copy zurück)
- Login-Token: JWT mit `lastLogin` + `tokenVersion`, gültig `loginValidityDays` Tage

### .md Dateien
- `AGENTS.md` — Projektvorgaben (verbindlich)
- `MEMORY.md` — dieser Langzeitspeicher
- `readme.md` — Projektbeschreibung (soll README.md werden)
- `TODO.md` — 12 Aufgabenbereiche aus AGENTS.md

---

## Backend UX-Details (2026-05-18)

- **Page-Segmente** (Contents/Base/Meta): Indikator-Pfeil (`⯈`) ist jetzt klickbar und klappt das Segment auf/zu — genau wie die h3-Überschrift. Vorher nur die Überschrift.
- **Content-Elemente**: Klick auf das Element (nicht auf Eingabefelder/Buttons/Icons) öffnet es. Zuklappen nur über den Pfeil (`.content-opener`). Der Container-Click prüft `evt.target.closest('input, textarea, select, button, a, .type-icon, .btn-delete, .dragger, .content-opener, .container-inner, img')` und ignoriert solche Klicks.
- **Main-Container**: `styles.css` — `main` von `width: 1500px` auf `max-width: 1500px; width: 100%` umgestellt, passt sich jetzt der Bildschirmbreite an.

---

## Seiten-Übersicht als Baumstruktur (2026-05-18)

- **NavPage.js**: Kinder werden jetzt in einem eigenen `<div class="page-children">` gerendert (statt direkt im Parent-Container). Rekursion bleibt, Parent für Kinder ist der childrenContainer.
- **pages.css**: Baum-Styling — `.page-children` hat `margin-left: 18px; padding-left: 12px; border-left: 2px solid` (vertikale Baumlinie). Jedes Kind bekommt via `::before` eine horizontale Verbindungslinie (14px breit, 2px hoch). Aktiver Knoten färbt Verbinder in Akzentfarbe.
- **styles.css**: `pages` Spalte von 250px auf `width: 320px; min-width: 280px` verbreitert.
- DnD (before/after/into) bleibt unverändert funktionsfähig — Drop-Zonen liegen weiterhin am `.page`-Container.

---

## Aktions-Icons im Seiten-Menü (2026-05-18)

- **NavPage.js**: Jeder `.page`-Eintrag hat rechts oben einen `.page-actions` Container mit 4 Icons: ✖ löschen (nur nicht bei root, mit `confirm()`), ↳ into (newPageIn), ↑ before (newPageBefore), ↓ after (newPageAfter). Alle mit `evt.stopPropagation()` und title-Tooltips via lang.
- **pages.css**: `.page-actions` ist `opacity: 0`, bei `pages .page:hover .page-actions` → `opacity: 1`. Icons 22×22px, weißer Grund, Hover akzentblau (löschen: rot).
- **Neu hinzugefügt**: `POST /api/newPageBefore` in router.js (analog newPageAfter, splice(index, 0)), `ajax.newPageBefore()` in ajax.js, lang-Phrase `newPageBefore` (de/en).

---

## Settings: Segment-Wechsel + API-Segment (2026-05-18)

- **Settings.js umgebaut**: Menü links (CMS/Persönlich/Tech/API) wechselt jetzt per `showSection(key)` das sichtbare Segment — alle anderen `display:none`. Scrollspy entfernt. Initial wird `cms` angezeigt.
- **Neues API-Segment** (`settings-api`): LLM-Anbieter-Select (mistral, gemini, claude, openai, langdock), Modell-Select (Lookup-Table `llmModels` pro Anbieter, wird bei Anbieter-Wechsel neu gerendert), API-Key Input (password, leer = unverändert). Debounced save.
- **router.js**: `GET /api/llmSettings` (liefert provider/model/hasApiKey — nie den Key selbst), `POST /api/saveLlmSettings` (speichert in settings.json unter `llm`, Key nur bei nicht-leer überschreiben).
- **ajax.js**: `loadLlmSettings()`, `saveLlmSettings(llm)`.
- **lang.js**: Phrases settingsApi, llmProvider, llmModel, llmApiKey, llmApiKeyHint, llmSaved, llmSelectProvider, llmSelectModel.

---

## AI-Segment + automatische Übersetzung (2026-05-18)

- **Settings-Segment "API" umbenannt in "AI"** (lang.js Label).
- **llm.js** (neu, serverseitig): `callLLM({provider, model, apiKey, system, user})` — generischer Aufruf für mistral, openai, langdock (chat/completions), claude (anthropic messages API), gemini (generateContent). `translateText(text, lang)` — prüft `llm.autoTranslate[lang]`, ruft LLM auf, de→en/nl/fr. `translateFields(data, fields)` — schreibt `<field>_<lang>` (Arrays elementweise).
- **router.js**: `saveContent` (title, content, tags + links_<lang> mit übersetzter legend), `savePage` (title, description, metaTitle, metaDescription, metaKeywords), `updateMedia` (title, description, altName, tags) — jeweils `llm.translateFields` vor dem Speichern via `.finally()`. `GET /api/llmSettings` liefert jetzt auch `autoTranslate`, `POST /api/saveLlmSettings` speichert es in `settings.json` unter `llm.autoTranslate` ({en,nl,fr}).
- **Settings.js AI-Segment**: 3 Checkboxen (de→en, de→nl, de→fr) mit debounced save.
- **TranslationButtons** (neu, `components/TranslationButtons/`): `addTranslationButtons({parent, data, field, saveFn, isArray, index, original})` — rendert en/nl/fr-Buttons (nur aktive Sprachen, gecacht via loadLlmSettings). Button mit Übersetzung = akzentblau. Klick öffnet Modal mit Original (de) + Textarea + Speichern → schreibt `data[field+'_'+lang]` und ruft saveFn.
- **CompInput** hat neuen optionalen Parameter `translation: {...}` — Buttons erscheinen im `.buttons`-Container.
- **Eingebunden in**: Content.js (title, content, tags), Page.js (Titel-h2), Meta.js (metaTitle, metaDescription, metaKeywords), Link.js (legend), EditImage.js (title, description, altName, tags — saveFn schreibt in image + FormData).
- Übersetzte Felder landen als `<field>_en`, `<field>_nl`, `<field>_fr` (bzw. `links_en` als Array) im jeweiligen JSON-Datensatz.

---

## Übersetzungs-Feedback (2026-05-18)

- **Flow**: Textänderung im Input → `TranslationButtons.markPending(wrap)` → Buttons rot (pulsierend). Server übersetzt bei `saveContent` und liefert `payload` (aktualisiertes Item inkl. `*_en/nl/fr`) zurück. `ajax.saveContent` merged payload in data + feuert `jule:translationsUpdated`. TranslationButtons hört Event, matched nach `data.id`, refresht Buttons → blau (`has-translation`).
- **router.js**: `saveContent` antwortet jetzt mit `payload: req.body`.
- **ajax.js**: `saveContent` returnt Promise, merged `result.payload` in data, dispatched Event.
- **Input.js**: `onInput` gewrappt — ruft `markPending(translation._wrap)` vor orig onInput. `translation._wrap` wird gesetzt wenn `addTranslationButtons` resolved.
- **TranslationButtons.js**: `registered[]` hält alle Button-Gruppen {wrap, data, field, isArray, index}; `refreshButtons(entry)` setzt pending/has-translation. CSS `.translation-btn.pending` = rot + pulse.

---

## Auto-Übersetzung entfernt (2026-05-18, auf Wunsch des Users)

- `llm.js` gelöscht, `TranslationButtons/`-Komponente gelöscht.
- router.js: `llm` Import + translateFields-Aufrufe in saveContent/savePage/updateMedia entfernt; llmSettings ohne autoTranslate. AI-Segment (Anbieter/Modell/API-Key) bleibt erhalten.
- Frontend: translation-Parameter aus Input/Content/Page/Meta/Link/EditImage entfernt; ajax.saveContent ohne payload/Event.
- lang.js: autoTranslate/translate-Phrases entfernt. Settings.js: Checkboxen entfernt.
- **Behalten**: Textarea/Password `elInput.value = value` Fix in Input.js (war echter Bug).
- Verbleibende `*_en` Felder in bestehenden Content-JSONs sind harmlos (werden nicht mehr geschrieben/angezeigt).

---

## Manuelle Übersetzung mit Ampelsystem (2026-05-18)

- **Kein Auto-Translate mehr** — Speichern übersetzt nichts automatisch.
- **Settings AI-Segment**: Checkboxen de→en/nl/fr (gespeichert als `llm.autoTranslate`, = aktivierte Sprachen).
- **POST /api/translate** {text, lang} → llm.js `translate()` (callLLM für 5 Anbieter, content-Array-sicher) → {status, translation}.
- **TranslationButtons** (neu): pro aktivem Sprache pro Feld ein Ampel-Icon (文A) + ↻-Button. Status: rot = keine/veraltete Übersetzung (Vergleich `field_lang_src` vs. aktuellem `field`), gelb = LLM läuft (pulse), grün = ok. Icon-Klick → Modal (Original + Textarea + ↻ auto + Speichern). Manuelles Editieren → grün. ↻ neben Feld startet LLM direkt.
- **Eingebunden**: Input.js (`translation`-Param, onInput → markOutdated), Content.js (title/content/tags), Page.js (Titel), Meta.js, Link.js (legend), EditImage.js (title/description/altName/tags + FormData-Übertragung der _en Felder; router konvertiert tags_en/nl/fr zu Arrays).
- Übersetzungen landen als `<field>_en` + `<field>_en_src` im Datensatz.

---

## Info-Bar am unteren Rand (2026-05-18)

- `public/backend/assets/js/infoBar.js` + `.css`: fixierte Leiste unten zentriert, slide-up + fade. Zeigt Nachricht + Timestamp (`toLocaleTimeString`), blendet nach 2s aus. hört `jule:info` Event; `infoBar.notify(msg)` feuert es.
- `index.js`: `infoBar.init()` beim Start.
- `ajax.js`: notify bei erfolgreichem saveContent („Inhalt gespeichert"), savePage („Seite gespeichert"), saveMedia/updateMedia („Medium gespeichert"), saveWatermark/updateWatermark („Wasserzeichen gespeichert“).

---

## Content-Editor: typabhängige Felder (2026-05-18)

- **Content.js neu geschrieben**: Lookup-Table `typeFields` mappt jeden Typ auf sichtbare Felder:
  - titleOnly → [title]; textOnly → [title, content, links, tags]; textImage* → [title, content, images, links, tags]; gallery/slideshow → [title, images, tags]; contactForm → [title, content, tags]; default → alle
- **renderFields()** rendert nur die passenden Felder in `fieldsEl`; bei Typ-Wechsel (Icon-Klick) wird `renderFields()` aufgerufen → Maske aktualisiert sich sofort. Info (ID/Daten) immer unten.
- Alle Unter-Editoren (Images-DnD, Links) rufen nach Änderungen `renderFields()` auf.

---

## Neue Inhaltstypen (2026-05-18): Trenner, Bildraster-Layouts, Kontaktformular, Newsletter, Filedownload

Beschluss: Akkordeon, Tabelle, Blog, Karte (OSM) kommen NICHT (erstmal). Umgesetzt in dieser Reihenfolge: Trenner → Bildraster 2/4/9 mit 5 Layout-Vorschlägen → Kontaktformular (funktioniert) → Newsletter (nur FE-Text) → Filedownload mit PDF-Vorschau (pdfjs).

### Backend
- `settings.js` elementTypes ergänzt: `divider`, `newsletter`, `fileDownload` (contactForm war schon drin). Icons: `public/backend/assets/img/icons/{divider,newsletter,fileDownload}.svg`.
- `lang.js`: Phrasen `divider`, `newsletter`, `fileDownload`, `layout`, `file`, `fileHint`, `newsletterEmail`, `newsletterSubscribe` u.a.
- `Content.js`: `typeFields` erweitert — `divider: []`, `newsletter: ['content','tags']`, `fileDownload: ['file','tags']`, `gallery: ['images','layout','tags']`. Neue Spezialfelder in renderFields():
  - `layout`: Lookup-Table `galleryLayouts` (5 Presets mit Icon-Buttons: grid-equal ▦, grid-first-big ▣, grid-last-big ▤, grid-center-big ▩, grid-mixed ▥); Klick setzt `data.layout` + saveContent.
  - `file`: Datei-Input → `ajax.uploadFile(FormData)` → `data.file = res.file` + saveContent + renderFields(). Anzeige: 📎 filename (KB).
- `ajax.js`: `uploadFile(fd)` → POST /api/uploadFile (kein Content-Type-Header, Browser setzt boundary); `sendContact(data)` → POST /api/contact (öffentlich, plain fetch).

### Server (router.js)
- **POST /api/uploadFile** (auth): formidable → `contents/files/`, keepExtensions. Antwort `{status:'success', file:{id, filename(original), storedFilename, size, mimetype}}`. id = newFilename ohne Ext.
- **POST /api/contact** (öffentlich, Whitelist `req.path === '/contact'`): nutzt `req.body` (express.json() läuft global in router — NIEMALS req.on('data') verwenden, das hängt!). Validierung: name/email/message Pflicht, consent Pflicht, E-Mail-Regex. Versand: nodemailer via smtpHost aus settings an adminEmail (replyTo = Absender), Fallback .eml nach `contents/mails/contact_<ts>.eml`.
- **GET /api/getFile/:id/:filename** (öffentlich, Whitelist `startsWith('/getFile/')`): id/filename sanitized; readdir `contents/files`, match `id.*`; PDFs inline (`application/pdf`), sonst attachment; `?download=1` erzwingt attachment. **WICHTIG**: `fs` in router.js ist `import {promises as fs}` — `fs.createReadStream` existiert NICHT (kostete Debugging); Route nutzt `fs.readFile` + `res.end(buf)`.
- saveContent speichert `layout`/`file` automatisch mit (req.body wird 1:1 durchgereicht).

### Frontend (Theme)
- `public/cms/js/ajax.js`: `sendContact(data)` ergänzt.
- `public/theme/assets/js/components/Content.js` neu: Fälle `divider` (hr.content-divider), `newsletter` (Titel+Text+E-Mail-Input+Button, nur FE-Feedback „Danke“, keine Backend-Funktion), `contactForm` (voll funktionsfähig: Name/E-Mail/Nachricht/DSGVO-Checkbox → POST /api/contact, Status ok/err, pageID wird mitgeschickt), `fileDownload` (Download-Link `/api/getFile/<id>/<filename>?download=1` + Größe; bei .pdf zusätzlich Vorschau Seite 1 via pdfjs), `gallery` rendert jetzt `gallery-layout-<layout>`-Klasse.
- pdfjs wird lazy per CDN geladen (cdnjs pdf.js 3.11.174, pdf.min.js + worker), rendert Seite 1 in Canvas (Skalierung auf Containerbreite, max 1.5).
- `views/Page.js`: reicht `pageID: page.id` an Content durch (für Kontaktformular).
- `public/theme/assets/css/styles.css`: CSS für divider, 5 gallery-layout-* Grid-Varianten (span 2 für big), contact-form/newsletter-form/form-field/form-status, content-filedownload, content-pdf-preview canvas.

### Getestet (curl gegen localhost:8654)
- contact: 400 bei leer/ohne consent/bad email; success mit gültigen Daten (SMTP konfiguriert → sent:true).
- uploadFile: 401 ohne Token; mit Token success + Datei in contents/files.
- getFile: 200 inline application/pdf mit Inhalt; ?download=1 → attachment; unbekannt → 404.

### Achtung: Heredoc-Falle
Beim Schreiben von JS mit Backslash-Escapes (`\n` in Strings, `\s` in Regex) über bash-Heredocs werden `\` im Tool-Layer kollabiert — Strings bekamen echte Zeilenumbrüche (SyntaxError). Workaround: `const BS = String.fromCharCode(92)` und Escapes per Konkatenation bauen, oder node-Script mit indexOf-Slicing statt Regex. Immer `node --check` danach.

---

## Fix: Übersetzungs-Checkboxen in Settings → AI (2026-05-18)

- Symptom: Checkboxen en/nl/fr zeigten trotz `autoTranslate:{en:true,nl:true}` in settings.json immer OFF.
- Ursache: in `views/Settings.js` wurden die CompCheckboxen VOR `ajax.loadLlmSettings()` gerendert (llm startet leer) und im Load-Callback nie aktualisiert.
- Fix: Referenzen `cbEn/cbNl/cbFr` halten und im loadLlmSettings-Callback `cbEn.set(!!llm.autoTranslate.en)` etc. — `set()` feuert nicht `onChanged`, also kein Save-Loop.
- Verifiziert: GET /api/llmSettings liefert `autoTranslate` korrekt; Settings.js per node --check OK.

---

## Fix: Übersetzungs-Buttons immer EN+NL (2026-05-18)

- Ursache: `TranslationButtons.js` cached `activeLangs` lebenslang im Modul — Änderungen an `llm.autoTranslate` in den Settings griffen nie (SPA, kein Reload), `invalidateCache()` wurde nirgends aufgerufen.
- Fix: Cache mit TTL 5s (`LANGS_CACHE_TTL`) + `invalidateCache()` wird in Settings.js nach erfolgreichem `saveLlmSettings` (autoTranslate) aufgerufen. Buden-Gruppen rendern sich beim nächsten Rendern (z.B. Seitenwechsel) mit den aktuellen Sprachen neu; bei 0 aktiven Sprachen werden gar keine Buttons gerendert (`addTranslationButtons` → null).

---

## Floating Button „Show FE“ im Backend (2026-05-18)

- Neue Komponente `components/ShowFE/ShowFE.js` + `.css` + Icon `assets/img/icons/showFE.svg` (Browser-Fenster-SVG).
- Wird in `index.js` direkt nach `infoBar.init()` An `document.body` gehängt (`ShowFE()`) — immer sichtbar, auch auf dem Login-Screen (Login leert nur nav/main).
- Klick: `window.open('/', '_blank', 'noopener')` — öffnet das Frontend in neuem Fenster.
- CSS: `.fab-show-fe` fixed top:12px left:12px, z-index 10000, pill-style mit Icon (invert für weiß) + Label. Phrase `showFE` in lang.js (de/en: „Show FE“).
- Getestet: alle Assets per curl 200, index.js enthält Import + Aufruf.

---

## Show FE: Fenster wiederverwenden (2026-05-18)

- `ShowFE.js` hält Referenz `feWindow` + festen Namen `juleFE`: Klick bei offenem FE → `feWindow.focus()` statt neuem Fenster; Name greift auch nach Backend-Reload (dann ist die Referenz weg, der Name nicht). `noopener` entfernt, sonst würde der Name laut Spec ignoriert (jedes Mal neues Fenster).

---

## Show FE: aktuelle Pages-View-Seite öffnen (2026-05-18)

- `ShowFE.js` baut per `feURLForCurrentPage()` die FE-URL aus `data.currentPage` (Fallback localStorage `jule:currentPage`): Slug-Kette über die Vorfahren (wie FE-Router `findPage`, matcht slug||id pro Segment), root → `/`.
- Klick: FE-Fenster offen → `location.href` auf die aktuelle Seiten-URL setzen (falls abweichend) + focus; sonst `window.open(url, 'juleFE')`.

---

## Spellcheck per KI + Markdown-Hilfe für Textareas (2026-05-18)

- **Spellcheck**: `llm.js` neue Fn `spellcheck(text)` — System-Prompt: NUR Rechtschreibung/Tippfehler korrigieren, Stil/Wortwahl/Markdown unverändert, nur korrigierten Text zurück. Route `POST /api/spellcheck` (auth), ajax.spellcheck. Getestet: "Tesst"→"Test", `**Wichtig:**` blieb erhalten.
- **Knopf**: in `Input.js` für alle Nicht-Passwort-Felder eine ✓-Kugel (`.spell-btn`) unter dem Eingabefeld (margin-left:120px wie TranslationButtons). Ampel: gelb=läuft, grün=Erfolg (Text wird via onInput geschrieben → speichern + Übersetzungen rot), rot=Fehler.
- **Markdown-Hilfe**: bei `multiline` Fragezeichen-Button neben der Legende (`.md-help-btn`) → Modal mit Syntax-Beispielen (fett, kursiv, Liste, hr, Überschrift, Link). Phrasen mdHelp/mdHelpIntro/mdBold/... in lang.js.
- Textarea min-height 120→170px (settings.css `.container-input .input.textarea-input`).

---

## Spellcheck-Button: in Translation-Container, abschaltbar, rot bei Änderung (2026-05-18)

- Der ✓-Spell-Button liegt jetzt IM selben `.translation-buttons`-Container wie die Übersetzungs-Icons (in `TranslationButtons.addTranslationButtons` gerendert, `trans-item` mit Label „de“). Eigener `.spell-row` in Input.js entfernt.
- Abschaltbar: Settings → AI Checkbox `spellcheckEnabled` (cbSpell), gespeichert als `llm.spellcheck` (default true) in settings.json; GET/POST llmSettings liefern/setzen `spellcheck`. Cache in TranslationButtons (`settingsCache {langs, spell, ts}`, TTL 5s) deckt beides ab; invalidateCache bei Settings-Save.
- Rot bei Textänderung: `markOutdatedFor` setzt `.spell-btn` im passenden Wrap auf rot (außer er ist gelb/lãouft). Grün nach erfolgreichem Spellcheck, dann `saveFn(data)` + Übersetzungen rot. Sichtbares Eingabefeld wird über `setValue`-Callback aus Input.js aktualisiert.
- Getestet: llmSettings spellcheck true→false→true roundtrip via curl, settings.json persistiert.

---

## Hinweis statt KI-Buttons wenn kein LLM konfiguriert (2026-05-18)

- `TranslationButtons.loadSettings()` cached jetzt `llmOk: !!(res.provider && res.hasApiKey)` (aus GET /api/llmSettings).
- Ist kein Anbieter/API-Key hinterlegt, rendert `addTranslationButtons` statt der Icons nur einen `.translation-hint` mit Phrase `llmNotConfigured` („Kein KI-Anbieter konfiguriert – bitte in den Einstellungen unter ‚AI‘ …“) im selben Container.
- settings.json llm ist intakt (mistral / mistral-large-latest / apiKey vorhanden).

---

## AddImage-Modal: Mehrfachauswahl per STRG + Confirm-Bar (2026-05-18)

- `modal/AddImage/Image.js`: click reicht jetzt das Event an onSelected durch.
- `AddImage.js`: STRG/Meta+Klick toggelt id in `multiSelected` Set + `.selected`-Klasse (grüne Outline); einfacher Klick = alte Einzelwahl (sofort onSelected + close). Sobald multiSelected.size > 0, erscheint fixed unten mittig (`.add-image-confirm-bar`, z-index 10002) ein Button „Auswahl bestätigen (n)“; Klick ruft onSelected pro id auf und schließt das Modal. Phrase `confirmSelection` in lang.js.
- Content.js/Base.js brauchen keine Änderung (onSelected(id) mehrfach = push je id / Preview last-wins).

---

## AddImage-Feinschliff (2026-05-18)

- Bilder-Box klappt nach renderFields() nicht mehr zu: `imagesOpen`-Flag im Content-Scope, wird beim Toggle gesetzt und beim Neu-Rendern als `open`-Klasse wieder applied (Content.js).
- `.add-image.selected`: Hintergrund jetzt hellgrün (#d8f3dc), Titel dunkelgrün, Outline bleibt grün.
- `.add-image-confirm-btn`: border entfernt, stattdessen `box-shadow: 0 0 0 4px #fff, ...` = dicke weiße Linie um den Button.

---

## Rescale nach Änderung der Bildauswahl (2026-05-18)

- Content.js: Hilfsfunktion `rescale()` (setzt `container.style.height` neu, wenn das Element `open` ist) wird nach `renderFields()` an allen 4 Stellen aufgerufen, an denen sich `data.images` ändert: onDelete, onDrop (DnD), AddImage-onSelected, UploadImages-onUploaded. Damit wird die Höhe des Inhaltselements nach Bildauswahl-Änderungen sofort neu skaliert.

---

## Rescale vereinheitlicht (2026-05-18)

- Alle 12 inline-Höhenberechnungen (`container.style.height = elInner.getBoundingClientRect().height + 30 + 'px'`) in Content.js durch zentrale `rescale()` ersetzt (setzt Höhe nur wenn Element `open`, sonst bleibt 64px-CSS). Aufgerufen bei: Content-Öffnen/Schließen, Bilder/Links auf- und zuklappen, nach Bild-Änderungen (Delete/DnD/Add/Upload) und neu bei `onImageLoaded` — Thumbnails laden async, daher war die Höhe nach Bildauswahl oft falsch.

---

## Fix: rescale-Rekursion (2026-05-18)

- Beim Ersetzen aller inline-Höhenberechnungen durch rescale() wurde versehentlich auch der Body von rescale() selbst ersetzt → `rescale()` rief sich selbst auf (too much recursion). Body wiederhergestellt: `container.style.height = elInner.getBoundingClientRect().height + 30 + 'px'` nur wenn `open`.

---

## Galerie-Layout-Engine (eigenes Raster, CSS Grid) (2026-05-18)

- **ACHTUNG Theme-Quelle**: `public/theme` wird bei jedem Serverstart aus `themes/default/` neu kopiert! Theme-Änderungen IMMER in `themes/default/...` machen (public/cms liegt außerhalb und bleibt stehen).
- Datenmodell: `item.layout='custom'` + `item.grid={cols, rows, cells:[{c,r,cs,rs}]}` (1-basiert). Zellen in Lese-Reihenfolge sortiert → Nummer = Index+1 = Bildreihenfolge. Persistiert über saveContent (req.body 1:1), öffentlich lesbar via /api/content/<id>.
- Backend: `components/Content/GridEditor.js` + `.css` — 6. Layout-Option „Eigenes Raster" (✥) in der Galerie. Editor: Spalten/Zeilen (1-12), Drag am Zell-Griff (rechts unten) = Größe ändern (Overlap-Check), STRG+Klick auf Nachbarzelle = verbinden (nur wenn Rechteck genau von beiden ausgefüllt), X-Button = Zelle in 1x1 aufteilen. Zellenanzahl wird an Bildanzahl angeglichen (freie Zelle anhängen / letzte entfernen).
- Frontend: `themes/default/assets/js/components/Content.js` `renderCustomGallery` — CSS Grid `repeat(cols,1fr)`, Zeilen 160px, Bild i in Zelle i via `gridColumn/gridRow: c / span cs`. Presets (grid-equal etc.) bleiben als Fallback.
- Getestet: GridEditor.js/css 200, Theme-Kopie enthält renderCustomGallery, saveContent mit grid roundtrip + öffentliches Auslesen OK.

## Fix: Grid-Editor erschien nicht (2026-05-18)
- Layout-Klick-Handler in Content.js rief nach saveContent kein renderFields() auf → Editor kam erst nach Reload. Jetzt renderFields() + rescale() direkt nach dem Klick.

## Fix: Zellen gingen beim Verkleinern des Rasters verloren (2026-05-18)
- `normalize()` in GridEditor.js clampte bisher auch die Positionen c/r — beim Verringern der Zeilen wurden Zellen dauerhaft auf die letzte Zeile gezogen und kamen nicht zurück. Jetzt werden nur noch die Spannen (cs/rs) geclampt, Positionen bleiben erhalten; CSS Grid rendert Überhang in impliziten Zeilen (gridAutoRows), FE ebenso.

## Galerie-Layout-Engine: Umbau (2026-05-18)

- Resize-Griff entfernt (nicht nötig) — nur noch Verbinden (STRG+Klick) + Aufteilen (X). GridEditor CELL 52→104px (doppelt so groß).
- Spalten/Zeilen jetzt live per `input`-Event (vorher erst bei change/blur).
- Presets wenden feste Vorlagen aufs Grid an: `buildGrid(cols, spans)` platziert [cs,rs]-Spannen zeilenweise ins erste freie Rechteck. Presets: grid-equal (1x1), grid-first-big (erstes 2x2), grid-last-big (letztes 2x2), grid-center-big (mittleres 2x2), grid-mixed (jedes 3. 2x1), NEU grid-cols3 „Spalten à 3 Zeilen“ (n Spalten, jede Zelle 1x3), custom (frei editierbar). Klick auf Preset → data.grid = build(n).
- Nummern-Overlay: Galerie-Bilder im Backend bekommen große laufende Nummer mit opacity 0.1 (`.image-order-num`, 64px, zentriert) — Content.js übergibt `numbered: data.type==='gallery'` an Content/Image.js.
- FE: rendert grid wann immer `item.grid.cells` vorhanden (Presets liefern jetzt auch grid), sonst CSS-Presets als Fallback.
- Builder-Logik per node getestet (first-big/cols3/equal/last-big/mixed).

## Grid-Editor Fixes (2026-05-18)

- Zeilen jetzt automatisch: `normalize()` berechnet `grid.rows = max(r+rs-1)` aus den Zellen; Toolbar zeigt „Zeilen: X“ als Text, nur Spalten per Input (live via input-Event).
- Editor wird bei JEDEM Galerie-Layout angezeigt (nicht nur custom) → Preset wird direkt im Raster angewendet & gezeigt. Manuelles Editieren setzt layout='custom' (saveFn-Wrapper in Content.js).
- Merge (STRG+Klick auf 2 Zellen): Bounding-Rect aller Zellen, die drin liegen (außer a/b) = „verdrängt“ → werden entfernt und als 1x1 an freie Stellen angehängt (findFreeCell).

## Fix: Zellanzahl nach Merge/Split (2026-05-18)
- Zellen müssen immer zur Bildanzahl passen (Nummer 1..n = Bildreihenfolge). Nach Merge (Zellzahl -1) wird per `syncCount()` eine neue 1x1-Zelle angehängt, nach Split (Zellzahl +k) wird am Ende getrimmt.

## Fix: Spalten verringern reflowt das Raster (2026-05-18)
- `reflowCols()` in GridEditor.js: Zellen mit c > cols (rechts rausgefallen) werden unten an freie Stellen angehängt (findFreeCell inkl. neuer Zeile); Zellen, die nur angeschnitten sind, bekommen cs = cols - c + 1 (schmaler). Wird beim Spalten-Input aufgerufen.

## Grid-Editor: Tauschen per SHIFT (2026-05-18)
- SHIFT+Klick auf Zelle A markiert sie als swapCell (orange, gestrichelte Outline), nächster Klick auf Zelle B tauscht Position+Spannen (c/r/cs/rs) beider Zellen. STRG=verbinden und X=aufteilen bleiben.
