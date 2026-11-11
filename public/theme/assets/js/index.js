'use strict';

// Theme-Einstieg: wartet auf die Struktur vom cms-Boot, rendert Shell + startet Router

import dom from '/cms/js/dom.js';
import Header from './components/Header.js';
import Footer from './components/Footer.js';
import Navigation from './components/Navigation.js';
import router from './router.js';

const start = () => {
    const body = document.body;

    Header({parent: body.querySelector('header') || body});
    Navigation({parent: body.querySelector('nav') || body});
    Footer({parent: body.querySelector('footer') || body});

    router.init({
        main: body.querySelector('main') || body,
        subnav: body.querySelector('#subnav') || null,
    });
}

if (window.jule && window.jule.structure) {
    start();
} else {
    window.addEventListener('jule:structure', start, {once: true});
}
