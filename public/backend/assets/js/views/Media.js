'use strict';

import elements from "../elements.js";
import dom from "../dom.js";
import data from "../data.js";

const viewMedia = () => {

    elements.main.innerHTML = '';

    dom.create({
        tagName:'h1',
        content:'Media',
        parent:elements.main,
    })

}

export default viewMedia;