# Übersicht

Ein einfaches Content Management System namens **JuleCMS** für meine Frau, die als Illustratorin insbesondere an die Bildverarbeitung besondere Anforderungen hat

# Agent-Anweisungen
Du bist mein Assistent, der nach meinen Anweisungen arbeitet. 
Führe keine arbeiten selbstständig durch, im Zweifel frag nach.
Behalte immer im Blick, wie das Projekt strukturiert ist. Es ist recht komplex, aber ich denke, das schaffst Du.
Halte Dich an die Vorgaben, die ich Dir gegeben habe bzw die Du aus der Struktur der schon existierenden Dateien lernst.

Lege Deine Erkenntnisse, Ntizen und Todos in die /MEMORY.md Datei.
Lege eine Anleitung für Menschen in die README.md Datei

# Features

# Coding Guidelines
Das gesamte Projekt folgt den folgenden Vorgaben:
- Vanilla JS
- Vanilla CSS
- DOM-Elemente werden als Components erzeugt
- Seiteninhalte werden als Views gerendert
- Bevorzuge fortschrittliche Programmiertechniken wie 
- - Promises (then-chaining)
- - Destructuring
- - Spread
- - Named Arguments
- - Arrow-Funktionen
- - Template Literals
- - Default-Parameter
- - Lookup-Tables


# Programmstruktur


### Sprache

Im Backend werden die Texte aus der Datei /backend/assets/js/lang geladen.
Hier gibt es neben der Sammlung an Phrases auch die Methode ``` getPhrase(phrase) {...}```, welche dazu dient, aus der Sammlung den richtigen Text inder richtigen Sprache auszuwählen.

Die Datensammlung findet sich im Attribut ```translations``` und folgt dem Schema:
```
translations: {
newPageAfter: {
de: 'Neue Seite Nach',
en: 'New Page After',
},
```


## Backend
Das Backend findet sich in /public/backend

Es ist aufgeteilt in die Bereiche:
- Seiten: Hier wird die Seitenstruktur definiert
- Medien: Hier werden die Bilder hochgeladen und verwaltet
- Wasserzeichen: Hier werden Wasserzeichen hochgeladen und verwaltet
- Themen: Hier können die Themes ausgewählt werden
- Einstellungen: Hier werden Einstellungen hinterlegt

### Seiten
Die Seiten werden in einer Liste im Backend angezeigt.

In dieser Liste können die Seiten per DnD verschoben werden.

Wenn eine Seite ausgewählt wird, werden deren Inhalte und Daten in der rechten Spalte angezeigt.
Dies sind:

#### Inhalte
Hier werden die Inhalte angezeigt und können verschoben, entfernt, hinzugefügt und editiert werden
Jedes Inhaltselement wird über dieselbe Maske bearbeitet. Dadurch kann der Typ leicht verändert werden.

Die hier angezeigten Daten sind:
- Typ: Einer von verschiedenen Inhaltstypen kann ausgewählt werden:
- - Nur Text
- - Nur Titel (für Störer)
- - Text mit Bild (links, rechts, unten)
- - Text mit Slideshow (links, rechts, unten) 
- - Bildergalerie
- - Slideshow
- Titel
- Bild(er): Eine Sammlung der Bilder, die in diesem Inhaltselement dargestellt werden sollen.
- Link(s)
- - Interne Links
- - Externe Links
- Text

#### Grundlagen
Hier werden weitere Daten angezeigt wie die ID, eine Slugline, Creation- und Change-Date

#### Metadaten
Mit Infos wie SEO-Title, SEO-Description, SEO-Keywords

### Medien
Hier werden alle Medien (erstmal nur die Bilder) angezeigt und verwaltet.

In der linken Spalte kann ein Bild ausgewählt und mit Daten versorgt werden.
Wird der Button "Upload" geklickt, dann wird das Bild hochgeladen, auf dem Server 
in verschiedene Größen gerendert, als Dateien abgelegt, eine dazugehörige 
JSON-Datei gespeichert und die Übersicht neu gerendert. 

In der rechten Spalte wird eine Übersicht über die Bilder angezeigt.

Hier werden die Bilder angezeigt und können in einem Modal bearbeitet werden.

### Wasserzeichen
Hier können - ähnlich wie bei den Medien - Wasserzeichen hochgeladen und bearbeitet werden.

### Themes
Hier werden die Themes in einer Vorschau angezeigt.

Eines der Themes kann gewählt werden.

### Einstellungen
Hier werden die Einstellungen verwaltet.
Diese sind:
- Maximale Auflösung eines Bildes bei Upload
- Sprache
- Passwort: wird an Server übertragen, dort gehasht und in /credentials.json gespeichert
- Base-URL: wird für die Links im Frontend verwendet

### Sprachen
Im Backend (Einstellungen) kann die Sprache gewählt werden.

---

## Frontend
Im Frontend wird die Datei /contents/structure.json geladen und das Menü aufgebaut.

Die Seite mit der id **root** ist die Wurzelseite, von der die anderen Seiten abgeleitet werden.

Die Seiten werden in der Reihenfolge der Kinder angezeigt.

### Routing
Wenn eine Seite angeklickt wird, dann wird in der Adressleiste und in der History die neue Adresse nach dem Schema eingetragen:
- http(s)://baseURL/{slug||id}

Wenn die Adresse direkt aufgerufen wird, dann wird die passende Seite angezeigt.

### Themes
Die Themes liegen als Unterordner im Ordner /themes.

Hier werden für das Thema die Komponenten und die CSS-Dateien abgelegt.
Das Theme **default** soll als Vorlage für die anderen Themes dienen.

Wenn im Backend (Einstellungen) ein Theme gewählt wird, wird der Ordner /public/assets mit den Dateien des gewählten Themes überschrieben.

Wenn eine Seite gerendert wird, dann werden dafür die Components aus /public/assets verwendet.

Es gibt Komponenten für:
- Die Seite (Page)
- Die Navigation (Navigation)
- Die Inhalte (Content)
- Inhaltstypen
- Header
- Footer
- etc

---

# Datenhaltung
Die Daten werden im Ordner /contents gehalten.

### Seiten
Hier gibt es eine structure.json, welche die Seitenstruktur als flaches Array enthält.

Für jede Seite ist hinterlegt: 
- welche Seiten sie als Kinder hat
- welche Inhaltselemente hier angezeigt werden (Dadurch können bestehende Inhaltselemente auf mehreren Seiten verwendet werden)
- Metadaten für SEO

Struktur eines Seiten-Objekte:
```
{
"id": "m20938f5923mu023",
"title": "Eine Seite",
"slug": "homeristderkrass",
"visible": true,
"crDate": 1780925707854,
"chDate": 1782218768700,
"content": ["mrj7aev3_1","mrj7ac0v_0","mrysxs2q_0"],
"children": ["mrj7te8m_1"],
"metaTitle": "Homer ist so krass",
"metaDescription": "Diese Seite steht am Anfang.",
"metaKeywords": ["home","krass","test"]
},
```

### Inhalte
Im Unterordner /contents/items liegen die Inhalte als JSON-Dateien.
Jede Datei enthält ein einzelnes Objekt mit einem Inhaltselement. Der Dateiname ist die ID des 
Content-Elementes und wird als Referenz in der Seitenstruktur verwendet.

Struktur eines Inhaltselementes:
```
{
"title": "Das ist ein Content",
"type": "default",
"content": "Einiges Blah Blah",
"visible": true,
"images": ["v5urho7ja571d6n789ehd3lyw","gssr68q78pgw4pg5pq3mk5y37",],
"tags": [],
"links": [
{
"legend": "",
"url": "http://www.dummy.com",
"target": "_blank"
}
],
"id": "mrj8nhr4_1",
"crDate": 1783948123552,
"chDate": 1783948123552
}
```
### Wasserzeichen
Auf Bildern können Wasserzeichen angezeigt werden. 
Die Wasserzeichen finden sich im Ordner /contents/watermarks.

In diesem Ordner liegen die Watermarks als mehrere Bilder in verschiedenen Auflösungen. 
Die Benennung folgt dem Schema: id_breite.png

Dazu kommt eine Datei in der Original-Auflösung nach dem Schema: id.png

### Bilder

Bilder werden in den Ordner /contents/media abgelegt.

Hier liegen zu jedem Bild mehrere Bild-Dateien verschiedener Auflösungen.
Die Benennung folgt dem Schema: id_breite.png
Dazu kommt eine Datei in der Original-Auflösung nach dem Schema: id.<original-ext> (z.B. id.jpg)

Und eine JSON-Datei, in der das Bild beschrieben wird.
```
{
  "title": "Sunset",
  "type": "default",
  "visible": true,
  "tags": [],
  "filename": "cgewh890g7fhyyetc558nrkfg.jpg",
  "watermark": "mso93yp2zsj6oy6x469c4uqrh",
  "description": "Sonnenuntergang",
  "altName": "",
  "resized": [
    {"filename": "cgewh890g7fhyyetc558nrkfg_600.png", "width": 600 },
    {"filename": "cgewh890g7fhyyetc558nrkfg_350.png", "width": 350 },
    {"filename": "cgewh890g7fhyyetc558nrkfg_160.png", "width": 160 }
  ],
  "id": "cgewh890g7fhyyetc558nrkfg",
  "crDate": "1789050550898",
  "chDate": 1789050575947
}
```

### Errors
In /contents/media/errors liegen die Bilder, um Fehler anzuzeigen.
Z.Zt. ist es nur eine 404.jpg
