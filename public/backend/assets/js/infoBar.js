'use strict';

// Info-Bar am unteren Bildschirmrand.
// Zeigt bei jule:info-Event eine Nachricht mit Timestamp, blendet nach 2s aus.

import dom from "./dom.js";

let bar = null;
let hideTimer = null;

const show = (msg) => {
    if (!bar) {
        bar = dom.create({
            cssClassName: 'info-bar',
            parent: document.body,
        });
        const path = new URL(import.meta.url).pathname;
        dom.create({
            tagName: 'link',
            attr: {href: path.replace(/[^/]+$/, 'infoBar.css'), rel: 'stylesheet'},
            parent: bar,
        });
    }
    if (hideTimer) clearTimeout(hideTimer);

    const time = new Date().toLocaleTimeString();
    bar.innerHTML = '';
    dom.create({
        tagName: 'span',
        cssClassName: 'info-bar-msg',
        content: msg,
        parent: bar,
    });
    dom.create({
        tagName: 'span',
        cssClassName: 'info-bar-time',
        content: time,
        parent: bar,
    });

    bar.classList.add('visible');
    hideTimer = setTimeout(() => {
        bar.classList.remove('visible');
    }, 2000);
};

const init = () => {
    window.addEventListener('jule:info', (evt) => {
        show((evt.detail && evt.detail.msg) || '');
    });
};

// Hilfsfunktion für Aufrufer
const notify = (msg) => {
    window.dispatchEvent(new CustomEvent('jule:info', {detail: {msg}}));
};

export default {init, notify, show};
