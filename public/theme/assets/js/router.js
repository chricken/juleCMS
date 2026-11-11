'use strict';

// History-Router: /slug oder /vorfahr-slug/child-slug → Seite aus structure.json

import Navigation from './components/Navigation.js';
import PageView from './views/Page.js';

const pageURL = (page) => {
    if (!page || page.id === 'root') return '/';
    // Verschachtelte URL aus den slugs der Vorfahren
    const chain = ancestorsOf(page).filter(p => p.id !== 'root');
    return '/' + chain.map(p => p.slug || p.id).join('/');
}

// Vorfahren-Kette: [root, ..., page]
const ancestorsOf = (page) => {
    const pages = window.jule.structure.pages;
    const chain = [page];
    let cur = page;
    while (cur && cur.id !== 'root') {
        const parent = pages.find(p => (p.children || []).includes(cur.id));
        if (!parent) break;
        chain.unshift(parent);
        cur = parent;
    }
    return chain;
}

// Pfad segmentweise durch den Baum verfolgen
const findPage = (path) => {
    const pages = window.jule.structure.pages;
    const segments = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
    const root = pages.find(p => p.id === 'root');
    if (!segments.length) return root;

    let current = root;
    let found = root;
    for (const seg of segments) {
        const next = (current.children || [])
            .map(id => pages.find(p => p.id === id))
            .find(p => p && (p.slug === seg || p.id === seg));
        if (!next) break;
        found = next;
        current = next;
    }
    return found;
}

// Top-Level-Vorfahre (direktes Child von root) – bestimmt den Zweig fürs Untermenü
const topLevelOf = (page) => {
    const chain = ancestorsOf(page);
    return chain.length > 1 ? chain[1] : null;
}

const router = {
    main: null,
    subnav: null,

    init({main, subnav}) {
        router.main = main;
        router.subnav = subnav;
        window.addEventListener('popstate', () => router.render());
        router.render();
    },

    navigate(url) {
        history.pushState({}, '', url);
        router.render();
    },

    render() {
        const page = findPage(location.pathname);
        document.title = page.title || 'Jule CMS';
        Navigation({
            parent: document.querySelector('nav'),
            subParent: router.subnav,
            currentPage: page,
        });
        PageView({page, parent: router.main});
    },
}

export default router;
export {pageURL, findPage, ancestorsOf, topLevelOf};
