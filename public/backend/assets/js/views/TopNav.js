'use strict';

import elements from "../elements.js";
import TopNavLink from "../components/TopNavLink/TopNavLink.js";
import dom from "../dom.js";
import data from "../data.js";
import ViewPages from "./Pages.js";
import ViewMedia from "./Media.js";
import ViewWatermark from "./Watermark.js";
import ViewTheme from "./Theme.js";
import ViewSettings from "./Settings.js";
import lang from "../lang.js";

const TopNav = ({
                    activeView = null
                } = {}) => {

    elements.nav.innerHTML = '';

    elements.allTopNavs = {};

    elements.allTopNavs['pages'] = TopNavLink({
        legend: lang.getPhrase('pages'),
        callback: () => {
            console.log('Pages')
            ViewPages()
        },
    });

    elements.allTopNavs['media'] = TopNavLink({
        legend: lang.getPhrase('media'),
        callback: () => {
            console.log('Media')
            ViewMedia()
        },
    });

    elements.allTopNavs['watermark'] = TopNavLink({
        legend: lang.getPhrase('watermark'),
        callback: () => {
            console.log('Watermark')
            ViewWatermark()
        },
    });

    elements.allTopNavs['theme'] = TopNavLink({
        legend: lang.getPhrase('theme'),
        callback: () => {
            console.log('Theme')
            ViewTheme();
        },
    });

    elements.allTopNavs['settings'] = TopNavLink({
        legend: lang.getPhrase('settings'),
        callback: () => {
            console.log('Settings')
            ViewSettings();
        },
    });

    // Klasse activehinzufügen
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