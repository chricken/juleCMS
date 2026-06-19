'use strict';

import ajax from "./ajax.js";
import data from "./data.js";
import dom from "./dom.js";
import compPages from "./components/Pages/Pages.js";

const init = () => {

    ajax.loadJSON('/api/pages').then(
        payload => data.pages = payload.pages,
    ).then(
        dom.mapping
    ).then(
        compPages
    ).catch(
        console.warn
    )

}

init();
