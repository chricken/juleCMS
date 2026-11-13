'use strict';

// Floating Button oben links: öffnet das Frontend (FE) in einem neuen Fenster.

import dom from "../../dom.js";
import lang from "../../lang.js";
import data from "../../data.js";

// Referenz auf das geöffnete FE-Fenster + fester Fenstername:
// ist das FE schon offen, wird bei weiteren Klicks dieses Fenster fokussiert
// (der Name greift auch noch nach einem Reload des Backends).
let feWindow = null;
const FE_WINDOW_NAME = 'juleFE';

// FE-URL der gerade im Pages-View geöffneten Seite (Slug-Kette wie im FE-Router)
const feURLForCurrentPage = () => {
    const id = data.currentPage || localStorage.getItem('jule:currentPage');
    const pages = data.pages || [];
    const page = pages.find(pg => pg.id === id);
    if (!page || page.id === 'root') return '/';
    const chain = [];
    let cur = page;
    while (cur && cur.id !== 'root') {
        chain.unshift(cur.slug || cur.id);
        cur = pages.find(pg => (pg.children || []).includes(cur.id));
    }
    return '/' + chain.join('/');
};

const ShowFE = ({parent = document.body} = {}) => {
    const btn = dom.create({
        parent,
        tagName: 'button',
        type: 'button',
        cssClassName: 'fab-show-fe',
        attr: {title: lang.getPhrase('showFE'), 'aria-label': lang.getPhrase('showFE')},
        listeners: {
            click(evt) {
                evt.stopPropagation();
                const url = feURLForCurrentPage();
                if (feWindow && !feWindow.closed) {
                    if (feWindow.location.pathname !== url) feWindow.location.href = url;
                    feWindow.focus();
                    return;
                }
                feWindow = window.open(url, FE_WINDOW_NAME);
            }
        }
    })
    dom.create({
        parent: btn,
        tagName: 'img',
        attr: {src: '/backend/assets/img/icons/showFE.svg', alt: ''},
        cssClassName: 'fab-show-fe-icon',
    })
    dom.create({
        parent: btn,
        tagName: 'span',
        content: lang.getPhrase('showFE'),
        cssClassName: 'fab-show-fe-label',
    })

    let path = new URL(import.meta.url).pathname;
    path = path.substring(0, path.lastIndexOf('/') + 1) + 'ShowFE.css';
    dom.create({tagName: 'link', attr: {href: path, rel: 'stylesheet'}, parent});

    return btn;
}

export default ShowFE;
