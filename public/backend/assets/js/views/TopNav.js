'use strict';

import elements from "../elements.js";
import TopNavLink from "../components/TopNavLink/TopNavLink.js";
import dom from "../dom.js";
import data from "../data.js";
import ViewPages from "./Pages.js";
import ViewMedia from "./Media.js";
import ViewWatermark from "./Watermark.js";
import ViewTheme from "./Theme.js";

const TopNav = () => {

    elements.nav.innerHTML = '';

    TopNavLink({
        legend: 'Pages',
        callback: () => {
            console.log('Pages')
            ViewPages()
        },
    });


    TopNavLink({
        legend: 'Media',
        callback: () => {
            console.log('Media')
            ViewMedia()
        },
    });


    TopNavLink({
        legend: 'Watermark',
        callback: () => {
            console.log('Watermark')
            ViewWatermark()
        },
    });

    TopNavLink({
        legend: 'Theme',
        callback: () => {
            console.log('Theme')
            ViewTheme();
        },
    });


}

export default TopNav;