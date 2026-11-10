'use strict';

import elements from "../elements.js";
import TopNavLink from "../components/TopNavLink/TopNavLink.js";
import dom from "../dom.js";
import data from "../data.js";
import ajax from "../ajax.js";
import lang from "../lang.js";
import ViewPages from "./Pages.js";
import ViewMedia from "./Media.js";
import ViewWatermark from "./Watermarks.js";
import ViewTheme from "./Theme.js";
import ViewSettings from "./Settings.js";

const TopNav = ({
                    activeView = null
                } = {}) => {

    elements.nav.innerHTML = '';

    elements.allTopNavs = {};

    elements.allTopNavs['pages'] = TopNavLink({
        legend: lang.getPhrase('pages'),
        callback: () => {
            ViewPages()
        },
    });

    elements.allTopNavs['media'] = TopNavLink({
        legend: lang.getPhrase('media'),
        callback: () => {
            ViewMedia()
        },
    });

    elements.allTopNavs['watermark'] = TopNavLink({
        legend: lang.getPhrase('watermark'),
        callback: () => {
            ViewWatermark()
        },
    });

    elements.allTopNavs['theme'] = TopNavLink({
        legend: lang.getPhrase('theme'),
        callback: () => {
            ViewTheme();
        },
    });

    elements.allTopNavs['settings'] = TopNavLink({
        legend: lang.getPhrase('settings'),
        callback: () => {
            ViewSettings();
        },
    });

    // Logout-Button rechts in der Nav
    dom.create({
        tagName: 'span',
        cssClassName: 'logout-link transit',
        content: lang.getPhrase('logout'),
        parent: elements.nav,
        attr: {
            tabindex: '-1'
        },
        listeners: {
            click(evt) {
                evt.stopPropagation();
                ajax.logout().then(
                    () => window.location.reload()
                ).catch(
                    () => window.location.reload()
                )
            }
        }
    })

    // Klasse active hinzufügen
    activeView && elements.allTopNavs[activeView].classList.add('active');

    return {}
}

// Methode an die exportierte Funktion anhängen
TopNav.clearAll = ({
                       className = 'active'
                   } = {}) => {
    Object.values(elements.allTopNavs).forEach(topNav => {
        topNav.classList.remove(className)
    });
}

export default TopNav;
