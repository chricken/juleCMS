'use strict';

import ajax from "./ajax.js";
import data from "./data.js";
import dom from "./dom.js";
import elements from "./elements.js";
import viewPages from "./views/Pages.js";
import viewMedia from "./views/Media.js";
import viewWatermarks from "./views/Watermarks.js";
import viewTopNav from "./views/TopNav.js";
import viewLogin from "./views/Login.js";
import infoBar from "./infoBar.js";
import ShowFE from "./components/ShowFE/ShowFE.js";
import compDetailsPage from "./components/Page/Page.js";
import CompNavPage from "./components/NavPage/NavPage.js";

infoBar.init();
ShowFE();

// Zentrale Event-Listener für CustomEvents (vermeidet zirkuläre Imports)
window.addEventListener('jule:rerenderNav', () => {
    if (elements.pages) {
        elements.pages.innerHTML = '';
        CompNavPage();
    }
});

window.addEventListener('jule:renderPage', (evt) => {
    if (evt.detail) compDetailsPage(evt.detail);
});

// Normaler Backend-Init – wird erst nach erfolgreichem Login ausgeführt
const init = () => {

    ajax.loadJSON('/api/pages').then(
        payload => data.pages = payload,
    ).then(
        dom.mapping
    ).then(
        viewTopNav
    ).then(
        viewPages
    ).catch(
        console.warn
    )

}

// Beim Start: Auth-Status prüfen. Ohne gültige Session wird nur das
// Login-Formular gerendert – kein weiterer DOM-Content existiert dann.
ajax.checkAuth().then(
    result => {
        if (result.authenticated) {
            dom.mapping();
            init();
        } else {
            dom.mapping();
            viewLogin({onLoginSuccess: init});
        }
    }
).catch(
    () => {
        dom.mapping();
        viewLogin({onLoginSuccess: init});
    }
)
