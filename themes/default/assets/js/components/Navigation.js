'use strict';

// Flaches Hauptmenü (Kinder der Root-Seite) in <nav>.
// Untermenü in <aside>: alle Kinder des Top-Level-Vorfahren der aktuellen Seite –
// bleibt im ganzen Zweig sichtbar, auch auf Unterseiten (nested Routing).

import dom from '/cms/js/dom.js';
import router, {pageURL, topLevelOf} from '../router.js';

const navLink = ({page, currentPage, parent}) => {
    const li = dom.create({
        tagName: 'li',
        parent,
        cssClassName: 'nav-item' + (page.id === currentPage?.id ? ' active' : ''),
    })

    dom.create({
        tagName: 'a',
        href: pageURL(page),
        content: page.title,
        parent: li,
        listeners: {
            click(evt) {
                evt.preventDefault();
                router.navigate(pageURL(page));
            }
        }
    })
}

const Navigation = ({parent = null, subParent = null, currentPage = null} = {}) => {
    const pages = window.jule.structure.pages;
    const root = pages.find(p => p.id === 'root');

    // Flaches Hauptmenü
    if (parent) {
        parent.innerHTML = '';
        const ul = dom.create({tagName: 'ul', parent, cssClassName: 'nav-main'})
        ;(root.children || []).forEach(childID => {
            const page = pages.find(p => p.id === childID);
            if (page && page.visible !== false) navLink({page, currentPage, parent: ul});
        })
    }

    // Untermenü links: Kinder des Top-Level-Vorfahren (persistent im Zweig)
    if (subParent) {
        subParent.innerHTML = '';
        const top = currentPage ? topLevelOf(currentPage) : null;
        const children = top ? (top.children || []) : [];
        if (!children.length) return;

        dom.create({
            tagName: 'h3',
            content: top.title,
            parent: subParent,
            cssClassName: 'nav-sub-title',
        })

        const ul = dom.create({tagName: 'ul', parent: subParent, cssClassName: 'nav-sub'})
        children.forEach(childID => {
            const page = pages.find(p => p.id === childID);
            if (page && page.visible !== false) navLink({page, currentPage, parent: ul});
        })
    }
}

export default Navigation;
