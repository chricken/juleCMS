'use strict';

import elements from "../elements.js";
import dom from "../dom.js";
import data from "../data.js";

const viewSettings = () => {

    elements.main.innerHTML = '';

    dom.create({
        tagName:'h1',
        content:'Settings',
        parent:elements.main,
    })

    diom.create({
        tagName:'p',
        content:'Max Bild-Auflösung bei Upload',
        parent:elements.main,
    })

}

export default viewSettings;