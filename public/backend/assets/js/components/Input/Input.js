'use strict';

import dom from "../../dom.js";
import elements from "../../elements.js";

const input = ({
                   parent = null,
                   legend = null,
                   data = {},
                   key = null
               }) => {

    // Das input-Element muss das Objekt bekommen, um es verändern zuu können
    // Der Key dient dazu, das richtige Element zu picken

    const container = dom.create({
        parent,

    })

    dom.create({
        parent: container,
        cssClassName: 'legendInput',
        content: legend,
        tagName: 'span',
    })

    dom.create({
        parent: container,
        tagName: 'span',
        cssClassName: 'input',
        attr: {
            contenteditable: true,
        },
        content: data[key],
        listeners: {
            input(evt) {
                data[key] = evt.target.innerText;
            }
        }
    })

    let path = new URL(import.meta.url).pathname;
    path = `${path.substring(0, path.lastIndexOf('/') + 1)}input.css`;

    dom.create({
        tagName: 'link',
        attr: {
            href: path,
            rel: 'stylesheet',
        },
        parent: elements.page
    })

};

export default input;