'use strict';

import dom from "../../dom.js";

const Tag = ({
                 parent = null,
                 content = '',
             }) => {

    dom.create({
        tagName: 'span',
        content,
        cssClassName: 'tag',
        parent,
    })

    let path = new URL(import.meta.url).pathname;
    path = `${path.substring(0, path.lastIndexOf('/') + 1)}Tag.css`;

    dom.create({
        tagName: 'link',
        attr: {
            href: path,
            rel: 'stylesheet',
        },
        parent
    })

}

export default Tag;