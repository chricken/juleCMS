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
                    chDate = null
                } = {}) {

        Object.assign(this, {
            title, type, visible,
            tags, filename,
            description, altName,
            resized
        });

        this.id = id || helpers.createID();
        this.crDate = crDate || Date.now();
        this.chDate = chDate || Date.now();
    }

}

export default Image;