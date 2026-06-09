'use strict';

import dom from "../../dom.js";

const Content = ({
                     data = {},
                     parent = null,
                     index = null
                 } = {}) => {

    /*
    id = null,
                    title = '',
                    type = 'default',
                    content = '',
                    images = [],
                    tags = [],
                    visible = true,
                    crDate = null,
                    chDate = null
     */
    const container = dom.create({
        parent,
        cssClassName: 'container content edit',
    })

    dom.create({
        parent: container,
        content: index.toString(),
        cssClassName: 'index',
    })

    dom.create({
        parent: container,
        content: data.type,
        cssClassName: 'info',
    })

    dom.create({
        parent: container,
        content: data.title,
        cssClassName: 'title',
        attr: {
            contenteditable: true,
        },
        listeners: {
            input(evt) {
                data.title = evt.target.innerText;
            }
        }
    })

    // ID
    dom.create({
        parent: container,
        content: 'ID: ' + data.id,
        cssClassName: 'info',
    })

    dom.create({
        parent: container,
        content: data.content,
        cssClassName: 'content',
        attr: {
            contenteditable: true,
        },
        listeners: {
            input(evt) {
                data.content = evt.target.innerText;
            }
        }
    })


};

export default Content;