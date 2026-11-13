'use strict';

// Layout-Engine für die Galerie: CSS-Grid-Editor im Backend.
// Zellen werden in Lese-Reihenfolge (row, col) nummeriert 1..n – Bild i landet in Zelle i.
// Drag am rechten/unteren Rand = Groesse aendern, STRG+Klick auf Nachbarzelle = verbinden,
// Schere-Button = aufteilen.

import dom from "../../dom.js";
import lang from "../../lang.js";

const CELL = 104;  // px pro Rasterfeld
const GAP = 4;

const GridEditor = ({parent = null, data = {}, saveFn = () => {}} = {}) => {
    if (!parent) return;
    if (!data.grid || !Array.isArray(data.grid.cells)) {
        data.grid = {cols: 4, rows: 3, cells: []};
    }
    const g = data.grid;
    g.cols = Math.max(1, Math.min(12, g.cols || 4));
    g.rows = Math.max(1, Math.min(12, g.rows || 3));

    const overlaps = (cell, cs, rs) => {
        for (const o of g.cells) {
            if (o === cell) continue;
            if (cell.c < o.c + o.cs && cell.c + cs > o.c && cell.r < o.r + o.rs && cell.r + rs > o.r) return true;
        }
        return false;
    };

    const findFreeCell = (grid) => {
        for (let r = 1; r <= grid.rows; r++) {
            for (let c = 1; c <= grid.cols; c++) {
                const free = !grid.cells.some(o => c >= o.c && c < o.c + o.cs && r >= o.r && r < o.r + o.rs);
                if (free) return {c, r, cs: 1, rs: 1};
            }
        }
        // Raster voll -> neue Zeile anhängen (Zeilenanzahl ergibt sich automatisch)
        return {c: 1, r: grid.rows + 1, cs: 1, rs: 1};
    };

    // Spalten verringert: Zellen rechts draußen werden unten angehängt,
    // angeschnittene breite Zellen werden schmaler (cs an Spaltenzahl angepasst)
    const reflowCols = (grid) => {
        grid.cells.sort((a, b) => (a.r - b.r) || (a.c - b.c));
        const out = grid.cells.filter(cell => cell.c > grid.cols);
        grid.cells = grid.cells.filter(cell => cell.c <= grid.cols);
        grid.cells.forEach(cell => {
            cell.cs = Math.max(1, Math.min(cell.cs, grid.cols - cell.c + 1));
        });
        normalize(grid);
        out.forEach(cell => {
            const free = findFreeCell(grid);
            cell.c = free.c;
            cell.r = free.r;
            cell.cs = Math.min(cell.cs, grid.cols);
            grid.cells.push(cell);
        });
        normalize(grid);
    };

    // Sortieren (Lese-Reihenfolge). Positionen NICHT clampen – sonst gingen Zellen beim
    // Verkleinern des Rasters verloren (CSS Grid rendert Überhang in impliziten Zeilen,
    // beim Vergrößern ist die ursprüngliche Position wieder da). Nur Spannen clampen.
    const normalize = (grid) => {
        grid.cells.forEach(cell => {
            cell.cs = Math.max(1, cell.cs || 1);
            cell.rs = Math.max(1, cell.rs || 1);
            if (cell.c >= 1 && cell.c <= grid.cols) cell.cs = Math.min(cell.cs, grid.cols - cell.c + 1);
        });
        grid.cells.sort((a, b) => (a.r - b.r) || (a.c - b.c));
        // Zeilen ergeben sich automatisch aus den Zellen
        grid.rows = Math.max(1, ...grid.cells.map(c => c.r + c.rs - 1));
    };

    // Zellen an Anzahl Bilder angleichen
    const want = (data.images || []).length || 1;
    const syncCount = () => {
        while (g.cells.length < want) g.cells.push(findFreeCell(g));
        while (g.cells.length > want) g.cells.pop();
    };
    syncCount();
    normalize(g);

    const wrap = dom.create({parent, cssClassName: 'grid-editor'});

    // ===== Werkzeugleiste: cols/rows =====
    const bar = dom.create({parent: wrap, cssClassName: 'grid-editor-bar'});
    const mkNum = (label, val, min, max, onChange) => {
        dom.create({tagName: 'span', content: label, parent: bar, cssClassName: 'grid-editor-label'});
        const inp = dom.create({tagName: 'input', parent: bar, type: 'number', cssClassName: 'grid-editor-num', attr: {min, max, value: val}});
        inp.addEventListener('input', () => {
            const v = Math.max(min, Math.min(max, parseInt(inp.value, 10) || min));
            onChange(v);
            normalize(g);
            saveFn(data);
            render();
        });
    };
    mkNum(lang.getPhrase('gridCols'), g.cols, 1, 12, v => { g.cols = v; reflowCols(g); });
    const rowsOut = dom.create({tagName: 'span', parent: bar, cssClassName: 'grid-editor-label'});
    dom.create({tagName: 'span', parent: bar, cssClassName: 'grid-editor-hint', content: lang.getPhrase('gridHint')});

    // ===== Raster =====
    const gridEl = dom.create({parent: wrap, cssClassName: 'grid-editor-grid'});
    gridEl.style.gridTemplateColumns = `repeat(${g.cols}, ${CELL}px)`;
    gridEl.style.gridAutoRows = `${CELL}px`;
    gridEl.style.gap = GAP + 'px';

    let selected = null; // markierte Zelle: STRG+Klick = verbinden, SHIFT+Klick = tauschen

    const render = () => {
        gridEl.innerHTML = '';
        gridEl.style.gridTemplateColumns = `repeat(${g.cols}, ${CELL}px)`;
        gridEl.style.gridAutoRows = `${CELL}px`;
        normalize(g);
        rowsOut.textContent = lang.getPhrase('gridRows') + ': ' + g.rows;
        g.cells.forEach((cell, idx) => {
            const el = dom.create({parent: gridEl, cssClassName: 'grid-cell' + (selected === cell ? ' selected' : '')});
            el.style.gridColumn = `${cell.c} / span ${cell.cs}`;
            el.style.gridRow = `${cell.r} / span ${cell.rs}`;
            dom.create({parent: el, tagName: 'span', cssClassName: 'grid-cell-num', content: String(idx + 1)});

            // Aufteilen (nur bei mehrfach grossen Zellen)
            if (cell.cs > 1 || cell.rs > 1) {
                dom.create({
                    parent: el, tagName: 'button', type: 'button', content: 'X',
                    cssClassName: 'grid-cell-split',
                    attr: {type: 'button', tabindex: '-1', title: lang.getPhrase('splitCell')},
                    listeners: {
                        click(evt) {
                            evt.stopPropagation();
                            const cs = cell.cs, rs = cell.rs;
                            g.cells = g.cells.filter(o => o !== cell);
                            for (let r = cell.r; r < cell.r + rs; r++) {
                                for (let c = cell.c; c < cell.c + cs; c++) {
                                    g.cells.push({c, r, cs: 1, rs: 1});
                                }
                            }
                            syncCount(); // Aufteilen erhöht die Zellzahl -> auf Bildanzahl trimmen
                            normalize(g);
                            saveFn(data);
                            render();
                        }
                    }
                });
            }

            // Klick: auswaehlen; STRG+Klick auf andere Zelle: verbinden
            el.addEventListener('click', (evt) => {
                evt.stopPropagation();
                // SHIFT+Klick auf zweite Zelle: tauschen (Markierung per normalem Klick)
                if (evt.shiftKey && selected && selected !== cell) {
                    const a = selected, b = cell;
                    const tmp = {c: a.c, r: a.r, cs: a.cs, rs: a.rs};
                    a.c = b.c; a.r = b.r; a.cs = b.cs; a.rs = b.rs;
                    b.c = tmp.c; b.r = tmp.r; b.cs = tmp.cs; b.rs = tmp.rs;
                    selected = null;
                    normalize(g);
                    saveFn(data);
                    render();
                    return;
                }
                // STRG+Klick auf zweite Zelle: verbinden
                if ((evt.ctrlKey || evt.metaKey) && selected && selected !== cell) {
                    const a = selected, b = cell;
                    const c1 = Math.min(a.c, b.c), r1 = Math.min(a.r, b.r);
                    const c2 = Math.max(a.c + a.cs, b.c + b.cs), r2 = Math.max(a.r + a.rs, b.r + b.rs);
                    // Verdrängte Zellen (liegen im Rechteck, sind aber nicht a/b) werden angehängt
                    const displaced = g.cells.filter(o => o !== a && o !== b && !(o.c >= c2 || o.c + o.cs <= c1 || o.r >= r2 || o.r + o.rs <= r1));
                    g.cells = g.cells.filter(o => o !== a && o !== b && !displaced.includes(o));
                    g.cells.push({c: c1, r: r1, cs: c2 - c1, rs: r2 - r1});
                    displaced.forEach(() => g.cells.push(findFreeCell(g)));
                    syncCount(); // Verbinden verringert die Zellzahl um 1 -> wieder auffüllen
                    normalize(g);
                    selected = null;
                    saveFn(data);
                    render();
                    return;
                }
                selected = cell;
                render();
            });
        });
    };

    render();
    return wrap;
};

export default GridEditor;
