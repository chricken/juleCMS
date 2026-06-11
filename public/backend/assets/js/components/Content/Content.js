'use strict';

import dom from "../../dom.js";
import CompInput from "../Input/Input.js";
import elements from "../../elements.js";

const Content = ({
                     data = {},
                     parent = null,
                     index = null,
                 } = {}) => {

    const container = dom.create({
        parent,
        cssClassName: 'container content edit',
        listeners: {
            click(evt) {
                evt.stopPropagation();
            }
        }
    })

    dom.create({
        parent: container,
        content: index.toString(),
        cssClassName: 'index',
    })

    // Type
    dom.create({
        parent: container,
        content: data.type,
        cssClassName: 'type nextToIndex',
    })

    // ID
    dom.create({
        parent: container,
        content: 'ID: ' + data.id,
        cssClassName: 'info',
    })

    // Creation Date
    dom.create({
        parent: container,
        content: 'Erzeugt: ' + new Date(data.crDate).toLocaleDateString(),
        cssClassName: 'info',
    })

    // Change Date
    dom.create({
        parent: container,
        content: 'Letzte Änderung: ' + new Date(data.chDate).toLocaleDateString(),
        cssClassName: 'info',
    })

    CompInput({
        parent: container,
        legend: 'Titel',
        key: 'title',
        data,
    })



    // Text
    CompInput({
        parent: container,
        legend: 'Text',
        key: 'content',
        data,
        multiline: true,
    })

    // Tags
    CompInput({
        parent: container,
        legend: 'Tags',
        key: 'tags',
        data,
        valueIsArray: true,
    })


    // Images
    console.log('images', data.images);
    if (data.images) {

    }

    /*
    images = [],
    visible = true,
    */


    let path = new URL(import.meta.url).pathname;
    path = `${path.substring(0, path.lastIndexOf('/') + 1)}Content.css`;

    dom.create({
        tagName: 'link',
        attr: {
            href: path,
            rel: 'stylesheet',
        },
        parent: elements.page
    })


};

export default Content;