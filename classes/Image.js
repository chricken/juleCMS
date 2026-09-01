'use strict';

import helpers from "../helpers.js";

class Image {
    constructor({
                    id = null,
                    title = '',
                    filename = '',
                    tags = [],
                    resized = [],
                    description = '',
                    altName = '',
                    type = 'default',
                    visible = true,
                    crDate = null,
                    chDate = null,
                    watermark = '',
                } = {}) {

        Object.assign(this, {
            title, type, visible,
            tags, filename, watermark,
            description, altName,
            resized
        });

        this.id = id || helpers.createID();
        this.crDate = crDate ? +crDate : Date.now();
        this.chDate = chDate ? +chDate : Date.now();
    }

}

export default Image;