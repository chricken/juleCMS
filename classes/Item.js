'use strict';

import helpers from "../helpers.js";

class Item {
    constructor({
                    id = null,
                    title = '',
                    type = 'default',
                    content = '',
                    images = [],
                    tags = [],
                    visible = true,
                    crDate = null,
                    chDate = null
                } = {}) {
        Object.assign(this, {
            title, type, content, visible,
            images, tags,
        });

        this.id = id || helpers.createID();
        this.crDate = crDate || Date.now();
        this.chDate = chDate || Date.now();
    }


}

export default Item;