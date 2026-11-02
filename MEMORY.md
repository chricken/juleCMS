# MEMORY.md – Langzeitspeicher für den Agenten

> Letzte Aktualisierung nach Analyse von AGENTS.md + vollständigem Projekt-Scan.

---

## Wer ich bin / Wie ich arbeite (aus AGENTS.md)

- Ich bin der Assistent von C. Heisch und arbeite **nur nach Anweisung** – im Zweifel nachfragen, nicht selbstständig handeln.
- Projektstruktur immer im Blick behalten – ist komplex, aber beherrschbar.
- **Erkenntnisse, Notizen, Todos → `/MEMORY.md`** (diese Datei).
- **Anleitung für Menschen → `/README.md`** (menschlich lesbar, nicht readme.md).

---

## Projekt: JuleCMS auf einen Blick

| Aspekt | Detail |
|--------|--------|
| Was | Dateibasiertes CMS ohne Datenbank, für eine Illustratorin (Fokus Bildverarbeitung) |
| Sprache | JavaScript ES Modules (`"type": "module"`), Vanilla JS + Vanilla CSS |
| Backend-Server | Node.js + Express 5, Port 80 (`settings.json`) |
| Admin-UI | `/public/backend` – komponentenbasiertes Vanilla JS, kein Framework |
| Público-Frontend | Theme-basiert, Dateien aus `/themes/<name>/` nach `/public/` kopiert |
| Datenspeicher | JSON-Dateien unter `/contents/` – beim Serverstart in RAM geladen |
| Dependencies | express@5, formidable@3 (Upload), jimp@1 (Bild-Resize), better-opn@3 |

---

## Coding Guidelines (verbindlich aus AGENTS.md)

- **Vanilla JS + Vanilla CSS** – keine Frameworks, keine Build-Tools
- **DOM-Elemente als Components** – jede UI-Einheit ist eine Funktion, die DOM erstellt
- **Seiteninhalte als Views** – Views rendern ganze Bereiche
- Bevorzugte Techniken:
  - Promises mit then-chaining (nicht async/await im Frontend!)
  - Destructuring
  - Spread
  - Named Arguments (Objekt als Funktionsparameter)
  - Arrow-Funktionen
  - Template Literals
  - Default-Parameter
  - Lookup-Tables

---

## Projektstruktur (Dateibaum)

```
juleCMS/
├── AGENTS.md                 # Projektvorgaben (diese Regeln)
├── MEMORY.md                 # Diese Datei – Langzeitspeicher
├── readme.md                 # Projektbeschreibung (soll zu README.md werden)
├── package.json              # express, formidable, jimp, better-opn
├── cmsServer.js              # Einstieg: init() → contents laden → themes kopieren → listen → Browser öffnen
├── router.js                 # Express Router, alle /api/* Endpunkte
├── manageContents.js         # Zentrale Datenverwaltung (pages, media, watermarks, items, convertImage)
├── settings.js / .json       # Port, Theme, Auflösungen, Debounce-Delay (1000ms)
├── themes.js                 # Kopiert themes/<theme>/* nach public/*
├── helpers.js                # createID(): Date.now().toString(36) + '_' + counter
├── classes/
│   ├── Page.js               # id, title, slug, visible, content[], children[], meta*, og*, crDate, chDate
│   ├── Item.js               # id, title, type, content, images[], links[], tags[], visible
│   ├── Image.js              # id, filename, resized[], tags, watermark, altName, description
│   └── Watermark.js          # id, filename, position, opacity, size, tiling, blendMode, resized[]
├── contents/
│   ├── structure.json        # pages[] flaches Array, verknüpft über children[] + content[] (IDs)
│   ├── watermarks.json       # Aggregierte Wasserzeichen-Übersicht (debounced)
│   ├── items/<id>.json       # Einzelnes Content-Element pro Datei
│   ├── pages/                # (reserviert, aktuell nicht genutzt)
│   ├── media/                # <id>.jpg + <id>_<breite>.png (resized) + <id>.json (Metadaten)
│   │   └── errors/404.jpg    # Fehlerbild
│   └── watermarks/           # <id>.png + <id>_<breite>.png (resized)
├── public/
│   ├── backend/              # Admin-Oberfläche
│   │   ├── index.html        # Shell: header, nav, main, footer
│   │   └── assets/js/
│   │       ├── index.js      # Einstieg: loadJSON(/api/pages) → dom.mapping → viewTopNav → viewPages
│   │       ├── ajax.js       # Alle fetch()-Calls zu /api/*
│   │       ├── data.js       # Globaler State: pages, currentPage, dragID, dropIndex
│   │       ├── dom.js        # dom.create({...}) – zentrales DOM-Erstellungs-Helper
│   │       ├── elements.js   # Referenzen auf Haupt-DOM-Elemente
│   │       ├── helpers.js    # debouncer(), collapse()
│   │       ├── lang.js       # translations{phrase:{de,en}}, getPhrase(key), currentLanguage
│   │       ├── components/   # UI-Komponenten (je .js + .css)
│   │       │   ├── Content/Content.js   # Content-Editor: Titel, Text, Bilder(DnD), Links, Tags
│   │       │   ├── Content/Image.js     # Bild in Content mit DnD-Sortierung
│   │       │   ├── Content/Link.js      # Link-Editor
│   │       │   ├── Page/Page.js         # Seiten-Detail: Base + Contents + Meta
│   │       │   ├── Page/Base.js         # ID, Slugline, crDate, chDate
│   │       │   ├── Page/Contents.js     # Content-Liste mit DnD
│   │       │   ├── Page/Meta.js         # SEO-Metadaten
│   │       │   ├── NavPage/NavPage.js   # Seitenbaum links
│   │       │   ├── Input/, Select/, Checkbox/, Range/, Tag/, InputFile/, InputForm/
│   │       │   ├── AddContent/, DropContent/
│   │       │   ├── ImageInOverview/, WatermarkInOverview/
│   │       │   └── ...
│   │       ├── views/        # Ganze Bereiche: Pages.js, Media.js, Watermarks.js, TopNav.js, Settings.js, Theme.js
│   │       └── modal/        # Modals: AddImage/, EditImage/, EditWatermark/, LinkExternal/, LinkInternal/
│   └── assets/               # Vom Theme kopiert (css, js, img)
├── themes/
│   └── default/              # index.html (header/nav/main/footer), assets/css, assets/js, favicon
└── TODO.md                   # Offene Aufgaben aus AGENTS.md
```

---

## Datenmodell (aus AGENTS.md + Code)

### structure.json – Seitenbaum
```json
{
  "pages": [
    {
      "id": "root",
      "title": "Wurzel",
      "children": ["pageId1", "pageId2"],
      "content": ["itemId1"],
      "slug": "",
      "visible": true,
      "metaTitle": "", "metaDescription": "", "metaKeywords": [],
      "ogTitle": "", "ogDescription": "", "ogImage": "",
      "crDate": 0, "chDate": 0
    }
  ]
}
```
- Flaches Array, Verknüpfung über `children[]` (Seiten-IDs) und `content[]` (Item-IDs)
- Root-Seite hat `id: "root"`
- **Wichtig:** Content-Items können auf mehreren Seiten referenziert werden

### Item (`contents/items/<id>.json`)
```json
{
  "id": "mrj8nhr4_1",
  "title": "...",
  "type": "default",
  "content": "Text...",
  "images": ["mediaId1", "mediaId2"],
  "links": [{"legend": "", "url": "...", "target": "_blank"}],
  "tags": [],
  "visible": true,
  "crDate": 0, "chDate": 0
}
```

### Media (`contents/media/<id>.json` + Bilder)
- Original: `<id>.jpg` (Upload-Format)
- Resized: `<id>_<breite>.png` für jede Auflösung ≤ Originalbreite
- Auflösungen aus `settings.json → defaultResolutions`: [2200, 1600, 960, 600, 350, 160]
- Metadaten: title, tags, description, altName, watermark (ID), resized[]

### Watermark (`contents/watermarks/`)
- Ähnlich Media, zusätzlich: position, opacity, size, tiling, blendMode
- Auflösungen: [80, 150, 300, 600, 1200]

---

## API-Endpunkte (`/api/*` via router.js)

| Methode | Pfad | Zweck |
|---------|------|-------|
| GET | `/pages` | Alle Seiten |
| GET | `/content/:id` | Content-Item laden |
| POST | `/saveContent` | Content speichern |
| POST | `/moveContent` | Content per DnD verschieben `{currentPage, dropIndex, dragID}` |
| POST | `/createContent` | Neues Item `{pageID, index}` |
| POST | `/removeContent` | Item löschen `{contentID}` |
| POST | `/savePage` | Seite speichern |
| POST | `/newPageAfter` | Seite nach anderer einfügen |
| POST | `/newPageIn` | Unterseite erstellen |
| POST | `/removePage` | Seite + Kinder + Content rekursiv löschen |
| POST | `/saveMedia` | Upload (formidable) + Resize + JSON |
| POST | `/updateMedia` | Metadaten/Bild aktualisieren |
| POST | `/deleteMedia` | Löschen inkl. Dateien |
| POST | `/saveWatermark` / `/updateWatermark` / `/deleteWatermark` | Analog |
| GET | `/loadMediaOverview` | Alle Media-JSONs als Objekt |
| GET | `/loadWatermarkOverview` | Alle Wasserzeichen |
| GET | `/getImg/:folder/:filename` | Bild ausliefern (404-Fallback) |
| GET | `/getImgMetaData/:folder/:id` | Metadaten-JSON |

---

## Backend-Admin: Views & Komponenten

### Views (`public/backend/assets/js/views/`)
- **Pages.js** – Seitenbaum (links) + Detail (rechts). Lädt root-Seite, rendert NavPage + Page-Detail
- **Media.js** – Medienverwaltung (Upload + Übersicht + Modal-Bearbeitung)
- **Watermarks.js** – Wasserzeichen-Verwaltung
- **TopNav.js** – Hauptnavigation zwischen Views
- **Settings.js** – Einstellungen (rudimentär)
- **Theme.js** – Theme-Auswahl (rudimentär)

### Wichtige Komponenten
- **Content/Content.js** – Haupt-Editor für Content-Items. Enthält: Titel-Input, Text-Input (multiline), Bilder-Sektion (DnD-sortierbar, ModalAddImage), Links-Sektion, Tags-Input. Auto-Save via debouncer(ajax.saveContent, 1000)
- **Content/Image.js** – Einzelbild in Content mit Drag-Events (onStartDrag, onDragOver, onDrop, onEndDrag)
- **Page/Page.js** – Rendert Base + Contents + Meta für eine Seite
- **dom.create({...})** – Zentrales Helper: `dom.create({tagName, parent, content, cssClassName, listeners, attr, styles, insert})` → erstellt Element, hängt es ein, gibt Referenz zurück

### Modal-System
- Modal-Overlay (`modal.js`), Modals: AddImage, EditImage, EditWatermark, LinkExternal, LinkInternal

---

## Frontend ( público) – Stand

- `themes/default/index.html` ist eine einfache Shell mit `<header>`, `<nav>`, `<main>`, `<footer>`
- `themes/default/assets/js/index.js` existiert, aber Routing/Menu-Aufbau aus structure.json **noch nicht implementiert**
- Routing-Schema (aus AGENTS.md): `http(s)://baseURL/{slug||id}` mit History API
- Theme-Komponenten (Page, Navigation, Content, Header, Footer) **noch nicht implementiert**

---

## Wichtige Verhaltensregeln & Konventionen

1. **Nie selbstständig handeln** – nur nach Anweisung, im Zweifel fragen
2. **MEMORY.md** für eigene Notizen/Todos, **README.md** für Menschen
3. **then-chaining** statt async/await im Frontend-Code (Promises)
4. **Named Arguments** – Funktionen nehmen ein Objekt: `func({param1, param2})`
5. **Default-Parameter** – `func({param = 'default'} = {})`
6. **Jede Komponente lädt eigenes CSS** dynamisch via `<link>` (siehe Content.js Ende)
7. **Debounced Saves** – `helpers.debouncer(func, delay)` für Auto-Save; serverseitig `saveFileDebouncer` mit `delayDebouncersFileSave` (1000ms)
8. **IDs:** `Date.now().toString(36) + '_' + counter++` (helpers.js)
9. **Bilder nie vergrößern** – `convertImage` filtert Auflösungen > Originalbreite heraus
10. **Upload-Original bleibt erhalten** – neue Uploads bekommen neue ID, alte Verknüpfungen bleiben
11. **Dateinamen-Schema:** `<id>_<breite>.png` für resized, `<id>.<ext>` für Original
12. **404-Fallback:** `contents/media/errors/404.jpg`

---

## Bekannte Unstimmigkeiten / Offene Punkte

- `structure.json` enthält teils das alte Feld `childen` neben `children` – slugline-Attribute wurden entfernt
- `contents/media.json` wird vom Debouncer in `manageContents.js:453` als Schreibziel verwendet, aber **nirgends gelesen** – `loadMediaOverview` liest stattdessen die einzelnen `.json`-Dateien aus `contents/media/`. Die Datei ist faktisch nutzlos.
- `manageContents.media` in init() auskommentiert – Medien werden lazy über `/api/loadMediaOverview` geladen
- `Page.moveChild()` / `Page.moveContent()` – leere Stubs
- `styles.css` im Root ist leer
- `notes/` wurde entfernt (war leer/obsolet)
- Original-Bilder sind `.jpg` (bzw. jeweiliges Upload-Format), nicht `.png` – resized Versionen sind `.png`
