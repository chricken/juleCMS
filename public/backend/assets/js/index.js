'use strict';

import ajax from "./ajax.js";
import data from "./data.js";
import dom from "./dom.js";
import viewPages from "./views/Pages.js";
import viewMedia from "./views/Media.js";
import viewTopNav from "./views/TopNav.js";

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

init();
