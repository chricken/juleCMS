# TODO.md – Aufgaben aus AGENTS.md

> Erstellt nach Analyse der AGENTS.md. Punkte, die dort gefordert, aber im Code noch nicht (vollständig) umgesetzt sind.

---

## 1. Dokumentation

- [ ] **`README.md` erstellen** (AGENTS.md fordert `/README.md`, existiert aber nur `readme.md`) – menschliche Anleitung: Installation, Start (`npm start`), Bedienung des Backends, Theme-Erstellung, Datenstruktur
- [ ] **MEMORY.md pflegen** – bei jeder neuen Erkenntnis aktualisieren (laufend)

---

## 2. Coding Guidelines konsequent umsetzen

- [ ] **Lookup-Tables** stärker einsetzen (z.B. für Content-Typen, Positionen, Blend-Modes)
- [ ] **Spread** wo sinnvoll (z.B. beim Mergen von Page-Daten)
- [ ] **then-chaining** statt async/await konsequent im gesamten Frontend durchziehen
- [ ] **Named Arguments + Default-Parameter** in allen neuen Funktionen

---

## 3. Backend – Inhaltstypen (AGENTS.md: "Seiten → Inhalte → Typ")

- [x] **Nur Text** – Content ohne Bilder/Links (Typ `textOnly` mit Icon wählbar)
- [x] **Nur Titel (Störer)** – Überschrift ohne Text (Typ `titleOnly` mit Icon wählbar)
- [x] **Text mit Bild** – Positionen: links, rechts, unten (Typen `textImageLeft/Right/Bottom` wählbar)
- [ ] **Text mit Slideshow** – Positionen: links, rechts, unten (Typ `slideshow` existiert, Verhalten noch nicht implementiert)
- [x] **Bildergalerie** – mehrere Bilder in Raster/Grid (Typ `gallery` wählbar)
- [ ] **Slideshow** – Vollbild-Slider/Trailer (Typ existiert, Verhalten fehlt)
- [x] **Typ-Auswahl (Select) im Content-Editor** – umgesetzt als Icon-Leiste mit SVG-Icons aus `/backend/assets/img/icons/`, selected hervorgehoben, Klick speichert via debounced saveContent

---

## 4. Backend – Seiten-Features

- [x] **Seiten per Drag & Drop in der Liste verschieben** (NavPage) – umgesetzt: before/after/into mit Zirkelbezug-Prüfung, `POST /api/movePage`
- [ ] **Grundlagen-Sektion** prüfen: ID, Slugline, crDate, chDate korrekt anzeigen/bearbeiten (Page/Base.js)
- [ ] **Metadaten-Sektion** prüfen: SEO-Title, SEO-Description, SEO-Keywords (Page/Meta.js)
- [ ] **Interne Links** – LinkInternal-Modal anbinden: Seite aus Baum auswählen statt URL eintragen

---

## 5. Backend – Medien

- [ ] **Linke Spalte (Upload-Bereich)** – aktuell nur Modal; AGENTS.md fordert dedizierten Upload-Bereich mit Datenfeldern + Upload-Button
- [ ] **Rechte Spalte (Übersicht)** – exists als Media.js View, prüfen ob Modal-Bearbeitung vollständig
- [ ] Upload-Flow verifizieren: Bild → Server resized → JSON gespeichert → Übersicht neu rendern

---

## 6. Backend – Einstellungen (AGENTS.md: "Einstellungen")

- [ ] **Maximale Auflösung bei Upload** – aktuell statisch in settings.json, soll im Backend einstellbar sein
- [ ] **Sprache umschaltbar** – `lang.js` hat `currentLanguage` + `availableLanguages`, aber keine UI zum Umschalten
- [x] **Passwort** – an Server übertragen, gehasht (PBKDF2-SHA256) in `/credentials.json` gespeichert. Zwei Felder mit Übereinstimmungs-Prüfung im Settings-View, Auge-Toggle für Klartext.
- [ ] **Base-URL** – für Frontend-Links konfigurierbar (nicht implementiert)

---

## 7. Backend – Themes

- [ ] **Theme-Vorschau** im Backend anzeigen (AGENTS.md: "Hier werden die Themes in einer Vorschau angezeigt")
- [ ] **Theme-Auswahl** – beim Wechsel `/public/assets` mit Theme-Dateien überschreiben (themes.js macht das beim Serverstart, nicht dynamisch)

---

## 8. Frontend ( público) – komplett fehlt

- [ ] **structure.json laden + Menü aufbauen** – `themes/default/assets/js/index.js` erweitern: Seitenbaum aus structure.json rendern, root-Seite als Start
- [ ] **Routing mit History API** – URL-Schema `http(s)://baseURL/{slug||id}`, direkte Aufrufe auflösen
- [ ] **Theme-Komponenten erstellen** (in `/themes/default/`):
  - [ ] Page-Komponente
  - [ ] Navigation-Komponente
  - [ ] Content-Komponente (+ Inhaltstypen: Text, Bild, Galerie, Slideshow, Störer)
  - [ ] Header-Komponente
  - [ ] Footer-Komponente
- [ ] **Breadcrumb** (aus readme.md)

---

## 9. Datenhaltung – Korrekturen

- [ ] **Item-Dateien als Array** – AGENTS.md sagt "Jede Datei enthält ein Array mit Inhaltselementen", Code speichert einzelnes Objekt pro Datei. Klären: Array oder Objekt?
- [ ] **Alte Felder in structure.json bereinigen** – `childen` → `children`, `slugline` → `slug` migrieren
- [ ] **Test-/Backup-Dateien entfernen** – `killme_media.json`, `media_backup_1.json`, `structure2.json`

---

## 10. Sprache / i18n

- [ ] **Alle UI-Texte über `lang.getPhrase()`** – prüfen ob überall konsequent, aktuell teils hardcoded (z.B. in Content.js: '⯈', '✖')
- [ ] **Sprache in Einstellungen umschaltbar** (siehe Punkt 6)
- [ ] **Englische Übersetzungen vervollständigen** – einige phrases fehlen noch in `en`

---

## 11. Wasserzeichen

- [ ] **Wasserzeichen auf Bilder anwenden** – beim Upload/Resize das gewählte Wasserzeichen einbrennen (Jimp composite). Aktuell wird nur die ID gespeichert, aber nicht angewendet
- [ ] **Wasserzeichen-Vorschau** im Backend

---

## 12. Geplante Features aus readme.md (noch nicht in AGENTS.md, aber dokumentiert)

- [ ] Blog-Komponente mit Kategorien, Tags, Sortierung, Suche
- [ ] Newsletter (An-/Abmeldung, Versand als HTML-Mail)
- [ ] Bildeffekte (CSS: rund, Schatten, Graustufen, Rotation, Spiegelung, Weichzeichnung)
- [ ] 404-Seite als eigene Seite konfigurierbar
- [ ] Mehrere Wasserzeichen pro Bild (Copyright, Signatur)
- [ ] Metadaten-Anzeige im Frontend (crdate, chdate, Autor)
- [ ] Passwortschutz für Seiten (Feld existiert in Page-Klasse)

- [x] **Login-System** – Session-basiert (router.js Map + Cookie), Middleware schützt /api/*, Frontend rendert ohne Auth nur Login-Formular (index.js → checkAuth → viewLogin)