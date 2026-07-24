'use strict';

import dom from "../../dom.js";

const Tag = ({
                 parent = null,
                 content = '',
                 isInteractive = false,
                 onClick = () => {
                 },
             }) => {

    const elTag = dom.create({
        tagName: 'span',
        content,
        cssClassName: `tag ${isInteractive ? 'interactive' : ''}`,
        parent,
        listeners: {
            click(evt) {
                evt.stopPropagation();
                onClick();
            }
        }
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

    return {
        el: elTag
    }

}

export default Tag;