# JuleCMS
Dieses Content Management System ist entstanden, als meine Frau bei den üblichen Anbietern an Grenzen gestoßen ist. Sei es, zu wenig Platz für E-Mail, zu große Kosten, Einschränkungen im Design.

Deswegen habe ich beschlossen, ein Projekt umzusetzen, da sich schon lange machen wollte: Ein CMS
Besonderes Augenmerk lege ich hier auf Benutzerfreundlichekeit. Komplexe wie Headless, Releaseworkflow oder Benutzerverwaltung werden weggelassen oder so weit abstrahhiert, dass der Benutzer damit nicht in Berührung kommt.

## Datenhaltung
Alle Daten werden in JSON-Dateien abgelegt. Keine Datenbank und damit auch keine Verwaltung derselben. Ich geher hier davon aus, dass nicht mehrere Benutzer gleichzeitig daran arbeiten.

Die Daten aus den Dateien werden beim Serverstart initial geladen und in Variablen gehalten, um den Zugriff zu vereínfachen und zu beschleunigen

Seiten- und Seiteninhalte werden im Unterordner contents abgelegt.
Die Seitenstruktur wird in der Datei structure.json gespeichert. Jeder Seite hat eine eindeutige id, die hier verlinkt ist.

Im Unterordner pages sind die einzelnen Seiten hinterlegt.

## Backend
Im Backend können die Seiten per Drag & Drop verschoben werden.

Seiten können auch ineinander verschoben werden (Nesting).

### Seiten 
Die Struktur aller Seiten sind in der structure.json abgelegt, zusammen mit der Verschachtelung, und den Inhalten.

In den page-Daten sind nur die IDs der Kind-Elemente erfasst.
Die wirklichen Nutzdaten aber befinden sich als JSON-Dateien in den Unterordnern pages und contents.

### Komponenten
- Alle Inhalte werden in Komponenten umgesetzt
- Jede Komponente braucht mindestens die folgenden Einstellungen:
- - Typ 
- - Titel
- - Inhalt
- - Sichtbar
- - Zusätzlicher Kommentar / Notiz
- Jede Komponente hat eine eigen CSS-Struktur, die direlkt in die Komponente eingebunden wird.
Dadurch hat man zwar die selbe CSS-Datei mehrfach geladen, aber keine CSS, die nicht gebraucht werden.
- Bilder:
- - Bilder werden grundsätzlich als canvas eingebunden.
- - Bilder erhalten im Backend eine checkbox, die aussagt, ob das Bild eine Wassermarke erhalten soll und welche
- - Optional Großdarstellung bei Klick
- Im Frontend optional ein kleines Icon, um Metadaten (crdate, chdate, Autor, etc) darzustellen.
- Komponenten;
- - Text mit Überschrift

### Routing
History
Breadcrumb
Navigation
Automatisch Seite finden per Named Routing Params

## Seiteneinstellungen
- Metadaten
- Open Graph
- Seitenbeschreibung
- Facebook meta Daten Gedöns
- Mehrere Wassermarken. Vielleicht Copyright, Signatur, etc
- Vorlagen 
- 404 Seite

## Themes
Die Themes liegen als Ordner in einem Verzeichnis.
Wenn der server gestartet wird, werden alle Dateien aus dem Verzeichnis in das public-Verzeichnis kopiert.
Auf diesem Wege kann jedes Theme eine eigene HTML-Struktur und individuelle Scripte haben.

Jede Installation von Jule CMS ist immer nur für eine Webseite zuständig. Das gewünschte Theme kann also entspannt in die Settings-Datei hinterlegt werden.

### CSS
Media queries in eigene CSS Dateien 
