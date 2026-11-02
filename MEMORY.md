# MEMORY.md – JuleCMS Projektanalyse

## Übersicht

**JuleCMS** ist ein dateibasiertes Content Management System (CMS) ohne Datenbank. Alle Daten werden als JSON-Dateien gespeichert. Entwickelt von C. Heisch (2026), entstanden aus dem Wunsch nach einem einfachen, benutzerfreundlichen CMS ohne die Komplexität üblicher Anbieter (kein Headless, kein Release-Workflow, keine Benutzerverwaltung).

- **Sprache:** JavaScript (ES Modules, `"type": "module"`)
- **Backend:** Node.js + Express 5
- **Frontend (Admin):** Vanilla JS, komponentenbasiert, kein Framework
- **Frontend ( público):** Theme-basierte statische HTML-Dateien
- **Datenbank:** Keine – alle Daten in JSON-Dateien unter `contents/`
- **Port:** 80 (aus `settings.json`)

---

## Projektstruktur

```
juleCMS/
├── cmsServer.js              # Express-Server, Einstiegspunkt (npm start)
├── router.js                 # API-Routen unter /api/*
├── manageContents.js         # Zentrale Datenverwaltung (Pages, Media, Watermarks, Items)
├── settings.js / .json       # Konfiguration (Port, Theme, Auflösungen, Debounce-Delay)
├── themes.js                 # Kopiert Theme-Dateien nach public/ beim Start
├── helpers.js                # createID() – eindeutige IDs aus Zeitstempel + Counter
├── classes/
│   ├── Page.js               # Seiten-Objekt (title, slug, content[], children[], meta, og)
│   ├── Item.js               # Content-Element (title, type, content, images[], links[], tags[])
│   ├── Image.js              # Medien-Objekt (filename, resized[], tags, watermark, altName)
│   └── Watermark.js          # Wasserzeichen (position, opacity, size, tiling, blendMode)
├── contents/
│   ├── structure.json        # Seitenbaum: pages[] mit children[] und content[] (IDs)
│   ├── items/*.json          # Einzelne Content-Elemente (pro Datei eine ID)
│   ├── media/                # Hochgeladene Bilder + JSON-Metadaten + auto-resized PNGs
│   ├── watermarks/           # Wasserzeichen-Bilder + resized Versionen
│   └── media.json / watermarks.json  # Aggregierte Übersichten (debounced gespeichert)
├── public/
│   ├── backend/              # Admin-Oberfläche (index.html + assets/js/components/, views/, modal/)
│   └── assets/               # Vom Theme kopierte statische Dateien (css, js, img)
├── themes/
│   └── default/              # Aktuell einziges Theme (index.html, css, js, favicon)
├── notes/Jule CMS/           # Obsidian-Notizen (Konzept, Technik, Drag n Drop, JSON-Dateien)
├── package.json              # express@5, formidable@3, jimp@1, better-opn@3
└── readme.md                 # Ausführliche Projektbeschreibung auf Deutsch
```

---

## Architektur & Datenfluss

### Server-Start (`cmsServer.js`)
```
init() → manageContents.init() → themes.init() → server.listen(port) → opn(/backend)
```
1. `manageContents.init()` lädt `structure.json` (Seiten) und `watermarks.json` in Speicher
2. `themes.init()` kopiert alle Dateien aus `themes/<theme>/` nach `public/`
3. Express serviert `public/` statisch (mit `.html`-Extension-Fallback) und `/api/*` über den Router
4. Browser öffnet automatisch `http://localhost:<port>/backend`

### Datenmodell

**Seitenbaum** (`contents/structure.json`):
- `pages[]` – flache Liste aller Seiten, verknüpft über `children[]` (IDs) und `content[]` (Item-IDs)
- Jede Seite hat: `id`, `title`, `slug`, `visible`, `content[]`, `children[]`, Meta-Felder (`metaTitle`, `metaDescription`, `metaKeywords`), Open-Graph-Felder (`ogTitle`, `ogDescription`, `ogImage`), `crDate`, `chDate`
- Root-Seite hat `id: "root"`

**Content-Items** (`contents/items/<id>.json`):
- Jedes Item: `id`, `title`, `type`, `content` (Text), `images[]` (Media-IDs), `links[]` (Objekte mit url/legend/target), `tags[]`, `visible`, `crDate`, `chDate`

**Medien** (`contents/media/<id>.json` + Bilddateien):
- Upload via `formidable` → Jimp resized auf `defaultResolutions` (2200, 1600, 960, 600, 350, 160)
- Nur kleinere Auflösungen als das Original werden erstellt (kein Upscaling)
- Resized-Dateien: `<id>_<breite>.png`
- Metadaten: `title`, `tags`, `description`, `altName`, `watermark` (ID), `resized[]`

**Wasserzeichen** (`contents/watermarks/`):
- Ähnlich wie Medien, mit zusätzlichen Feldern: `position`, `opacity`, `size`, `tiling`, `blendMode`
- Resized auf `watermarkResolutions` (80, 150, 300, 600, 1200)

### API-Endpunkte (`router.js` unter `/api/`)

| Methode | Pfad | Funktion |
|---------|------|----------|
| GET | `/pages` | Alle Seiten zurückgeben |
| GET | `/content/:id` | Einzelnes Content-Item laden |
| POST | `/saveContent` | Content-Item speichern |
| POST | `/moveContent` | Content per Drag & Drop verschieben |
| POST | `/createContent` | Neues Content-Element an Index einfügen |
| POST | `/removeContent` | Content-Element löschen |
| POST | `/savePage` | Seite aktualisieren + structure.json speichern |
| POST | `/newPageAfter` | Neue Seite nach einer bestehenden einfügen |
| POST | `/newPageIn` | Neue Unterseite erstellen |
| POST | `/removePage` | Seite + Kinder + Content rekursiv löschen |
| POST | `/saveMedia` | Bild hochladen (formidable) + resizen + JSON speichern |
| POST | `/updateMedia` | Metadaten/Bild aktualisieren |
| POST | `/deleteMedia` | Bild + resized Dateien + JSON löschen |
| POST | `/saveWatermark` | Wasserzeichen hochladen |
| POST | `/updateWatermark` | Wasserzeichen aktualisieren |
| POST | `/deleteWatermark` | Wasserzeichen löschen |
| GET | `/loadMediaOverview` | Alle Media-JSONs lesen und als Objekt zurückgeben |
| GET | `/loadWatermarkOverview` | Alle Wasserzeichen zurückgeben |
| GET | `/getImg/:folder/:filename` | Bild ausliefern (404-Fallback) |
| GET | `/getImgMetaData/:folder/:id` | Metadaten-JSON eines Bildes laden |

---

## Frontend Admin (`public/backend/`)

Reines Vanilla JS, komponentenbasiert, ES Modules. Keine Build-Tools.

### Einstieg
`index.html` → `assets/js/index.js`:
1. Lädt `/api/pages` in `data.pages`
2. `dom.mapping()` – DOM-Elemente referenzieren
3. Rendert `viewTopNav()` und `viewPages()`

### Views
- **Pages** – Seitenbaum (links) + Detailansicht (rechts) mit Content-Elementen
- **Media** – Medienübersicht mit Upload, Bearbeitung, Löschung
- **Watermarks** – Wasserzeichen-Verwaltung
- **TopNav** – Hauptnavigation zwischen den Views
- **Settings / Theme** – noch rudimentär

### Komponenten (`assets/js/components/`)
Jede Komponente ist eine Funktion, die DOM-Elemente erstellt:
- `Content/Content.js` – Content-Editor mit Titel, Text, Bildern (Drag & Drop), Links, Tags
- `Content/Image.js` – Bildanzeige innerhalb Content mit Drag & Drop Sortierung
- `Content/Link.js` – Link-Editor
- `Page/Page.js`, `Page/Contents.js`, `Page/Base.js`, `Page/Meta.js` – Seiten-Detail
- `NavPage/NavPage.js` – Seitenbaum-Navigation
- `AddContent/`, `DropContent/` – Content hinzufügen/verschieben
- `Input/`, `InputFile/`, `InputForm/`, `Select/`, `Checkbox/`, `Range/`, `Tag/` – Formularelemente
- `ImageInOverview/`, `WatermarkInOverview/` – Medien-Vorschau

### Modals (`assets/js/modal/`)
- `AddImage/` – Bild aus Medienbibliothek auswählen
- `EditImage/` – Bild-Metadaten bearbeiten
- `EditWatermark/` – Wasserzeichen bearbeiten
- `LinkExternal/`, `LinkInternal/` – Links konfigurieren

### Zentrale JS-Module
- `ajax.js` – Alle API-Calls (fetch-basiert)
- `data.js` – Globaler State (`pages`, `currentPage`, `dragID`, `dropIndex`)
- `dom.js` – DOM-Hilfsfunktionen (`create`, `mapping`)
- `elements.js` – Referenzen auf Haupt-DOM-Elemente
- `helpers.js` – `debouncer()` für Auto-Save
- `lang.js` – Deutsche UI-Texte

---

## Wichtige Design-Entscheidungen

1. **Keine Datenbank** – Alle Daten in JSON-Dateien, beim Start in Variablen geladen. Annahme: nur ein Benutzer arbeitet gleichzeitig.
2. **Debounced File Saves** – `saveFileDebouncer` mit 1000ms Delay (konfigurierbar in `settings.json`), um häufiges Schreiben zu vermeiden.
3. **IDs aus Zeitstempel** – `helpers.createID()` = `Date.now().toString(36) + '_' + counter` – eindeutig und sortierbar.
4. **Auto-Resize bei Upload** – Jimp erstellt mehrere Auflösungen, nur wenn kleiner als Original. Keine Vergrößerung.
5. **Theme-Kopie beim Start** – Theme-Dateien werden 1:1 nach `public/` kopiert, kein Build-Schritt.
6. **Komponenten-CSS** – Jede Frontend-Komponente lädt ihre eigene CSS-Datei dynamisch (`<link>` via JS), um ungenutztes CSS zu vermeiden.
7. **Drag & Drop** – Sowohl für Seiten (in Baumstruktur) als auch für Content-Elemente und Bilder innerhalb von Content.
8. **Eine Instanz = eine Webseite** – Das Theme wird in `settings.json` festgelegt.

---

## Tech-Stack Details

| Komponente | Technologie | Version |
|------------|-------------|---------|
| Runtime | Node.js | ES Modules |
| Web-Framework | Express | ^5.2.1 |
| Datei-Upload | formidable | ^3.5.4 |
| Bildverarbeitung | jimp | ^1.6.1 |
| Browser öffnen | better-opn | ^3.0.2 |
| Frontend | Vanilla JS (ES Modules) | – |
| Datenspeicher | JSON-Dateien | – |
| CSS | Reines CSS, komponentenweise | – |

---

## Bekannte Besonderheiten / Auffälligkeiten

- `contents/structure.json` enthält noch alte Daten mit inkonsistenten Feldern (z.B. `childen` statt `children`, `slugline` statt `slug`) – Daten wurden manuell migriert.
- `contents/killme_media.json` und `contents/media_backup_1.json` sind offensichtliche Test-/Backup-Dateien.
- `manageContents.media` wird in `init()` auskommentiert – Medien werden stattdessen lazy über `/loadMediaOverview` geladen.
- `Page.moveChild()` und `Page.moveContent()` sind leere Stub-Methoden (nicht implementiert).
- `styles.css` im Root ist leer (0 Bytes).
- `notes/Jule CMS/Technik.md`, `Drag n Drop.md`, `JSON-Dateien.md` sind leer – nur `Jule CMS.md` hat Inhalt.
- Der Server läuft auf Port 80 (erfordert unter Windows evtl. Admin-Rechte).
- `start.bat` enthält nur `npm start`.

---

## Geplante Features (aus readme.md, noch nicht umgesetzt)

- Blog-Komponente mit Kategorien, Tags, Sortierung, Suche
- Newsletter (An-/Abmeldung, Versand bestehender Seiten als HTML-Mail)
- Erweiterte Komponenten-Typen (Slider/Galerie, Bildraster, Trailer, Störer, Text mit Überschrift)
- Bildeffekte (CSS: rund, Schatten, Graustufen, Rotation, Spiegelung, Weichzeichnung)
- Mehrere Wasserzeichen (Copyright, Signatur)
- 404-Seite als eigene Seite konfigurierbar
- Media Queries in separate CSS-Dateien auslagern
- Metadaten-Anzeige im Frontend (crdate, chdate, Autor)
- Passwortschutz für Seiten (Feld existiert bereits in Page-Klasse)
