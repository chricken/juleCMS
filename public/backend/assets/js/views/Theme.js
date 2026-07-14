'use strict';

import elements from "../elements.js";
import dom from "../dom.js";
import data from "../data.js";

const viewTheme = () => {

    elements.main.innerHTML = '';

    dom.create({
        tagName:'h1',
        content:'Theme',
        parent:elements.main,
    })

}

export default viewTheme;