'use strict';

import helpers from "../helpers.js";

class Watermark {
    constructor({
                    id = null,
                    title = '',
                    description = '',
                    filename = '',
                    resized = [],
                    tiling = false,
                    size = 10,
                    position = 'bottom-right',
                    opacity = 80,
                    blendMode = 'normal',
                    crDate = null,
                    chDate = null
                } = {}) {

        Object.assign(this, {
            title, filename, description,
            opacity, blendMode,
            tiling, size, position, resized
        });

        this.id = id || helpers.createID();
        this.crDate = crDate ? +crDate : Date.now();
        this.chDate = chDate ? +chDate : Date.now();
    }

}

export default Watermark;