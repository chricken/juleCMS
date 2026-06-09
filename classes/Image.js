'use strict';

import helpers from "../helpers.js";

class Image {
    constructor({
                    id = null,
                    title = '',
                    originalFilename = '',
                    description = '',
                    altName = '',
                    type = 'default',
                    visible = true,
                    crDate = null,
                    chDate = null
                } = {}) {

        Object.assign(this, {
            title, type, content, visible,
            images, tags, originalFilename,
            description, altName,
        });

        this.id = id || helpers.createID();
        this.crDate = crDate || Date.now();
        this.chDate = chDate || Date.now();
    }

}

export default Image;