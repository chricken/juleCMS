'use strict';

import helpers from "../helpers.js";

class Page {
    constructor({
                    id = null,
                    title = '',
                    children = [],
                    description = ''
                }) {
        Object.assign(this, {title, children, description});
        this.id = id || helpers.createID();

    }
}

export default Page;
