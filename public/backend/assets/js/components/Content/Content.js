'use strict';

import dom from "../../dom.js";
import CompInput from "../Input/Input.js";

const Content = ({
                     data = {},
                     parent = null,
                     index = null,
                 } = {}) => {

    const container = dom.create({
        parent,
        cssClassName: 'container content edit',
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
        content: 'Letzte Änderung: ' +  new Date(data.chDate).toLocaleDateString(),
        cssClassName: 'info',
    })

    CompInput({
        parent: container,
        legend: 'Titel',
        key: 'title',
        data,
    })


    // ID
    dom.create({
        parent: container,
        content: 'ID: ' + data.id,
        cssClassName: 'info',
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


    /*
        images = [],
        visible = true,
        crDate = null,
        chDate = null
     */

};

export default Content;