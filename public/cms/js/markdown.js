'use strict';

// Markdown-Rendering fürs Frontend – nutzt marked aus /cms/plugins/

import {marked} from '/cms/plugins/marked.esm.js';

marked.setOptions({
    gfm: true,      // GitHub-Flavored Markdown (Tabellen, Streichungen etc.)
    breaks: true,   // einzelner Zeilenumbruch = <br>
});

const renderMD = (text = '') => {
    // Zeilenumbrüche normalisieren (CRLF/CR → LF), damit Listen/Blöcke sauber erkannt werden
    const normalized = String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    return marked.parse(normalized);
};

export default renderMD;
