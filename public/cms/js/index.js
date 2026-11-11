'use strict';

// Theme-unabhängiger Boot fürs Frontend.
// Lädt die Seitenstruktur und stößt das Theme-eigene Rendering an.

import ajax from './ajax.js';

ajax.loadJSON('/api/structure').then(
    structure => {
        window.jule = {structure};
        window.dispatchEvent(new CustomEvent('jule:structure', {detail: structure}));
    }
).catch(
    console.warn
)
