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

const TopNav = () => {

    elements.nav.innerHTML = '';

    TopNavLink({
        legend: lang.getPhrase('pages'),
        callback: () => {
            console.log('Pages')
            ViewPages()
        },
    });

    TopNavLink({
        legend: lang.getPhrase('media'),
        callback: () => {
            console.log('Media')
            ViewMedia()
        },
    });

    TopNavLink({
        legend: lang.getPhrase('watermark'),
        callback: () => {
            console.log('Watermark')
            ViewWatermark()
        },
    });

    TopNavLink({
        legend: lang.getPhrase('theme'),
        callback: () => {
            console.log('Theme')
            ViewTheme();
        },
    });

    TopNavLink({
        legend: lang.getPhrase('settings'),
        callback: () => {
            console.log('Settings')
            ViewSettings();
        },
    });
}

export default TopNav;