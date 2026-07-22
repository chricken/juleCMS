'use strict';

import elements from "../elements.js";
import dom from "../dom.js";
import data from "../data.js";

const viewWatermark = () => {

    elements.main.innerHTML = '';

    dom.create({
        tagName:'h1',
        content:'Watermark',
        parent:elements.main,
    })

    elements.allTopNavs['watermark']?.highlight()
}

export default viewWatermark;