'use strict';

import dom from "../../dom.js";
import CompInput from "../Input/Input.js";
import elements from "../../elements.js";
import settings from "../../data.js";
import lang from "../../lang.js";

const Content = ({
                     data = {},
                     parent = null,
                     index = null,
                     onRemove = () => {
                     },
                     onDragStart = () => {
                     },
                     onDragEnd = () => {
                     },
                 } = {}) => {

    const container = dom.create({
        parent,
        cssClassName: 'container content edit transit',
        attr: {
            // draggable: true,
        },
        listeners: {
            click(evt) {
                evt.stopPropagation();
            },
            mousedown(evt) {
                evt.stopPropagation();
            },
            dragstart(evt) {
                console.log('dragstart');
                settings.dragID = data.id;
                onDragStart();
                evt.dataTransfer.setDragImage(container, 0, 0);
            },
            dragend() {
                container.draggable = false;
                // settings.dragID = null;
                onDragEnd();
            }
        }
    })

    const elInner = dom.create({
        parent: container,
    })

    dom.create({
        parent: elInner,
        content: index.toString(),
        cssClassName: 'index transit',
    })

    dom.create({
        content: '⯈',
        parent: elInner,
        cssClassName: 'content-opener transit',
        listeners: {
            click(evt) {
                evt.stopPropagation();
                if (container.classList.contains('open')) {
                    container.classList.remove('open');
                    container.style.height = null;
                } else {
                    container.classList.add('open');
                    container.style.height = elInner.getBoundingClientRect().height + 30 + 'px';
                }
            }
        }
    })

    // Interaktivity
    dom.create({
        parent: elInner,
        content: '✖',
        cssClassName: 'btn-delete transit',
        listeners: {
            click(evt) {
                evt.stopPropagation();
                onRemove(data);
            }
        }
    })

    dom.create({
        parent: elInner,
        cssClassName: 'dragger transit',
        listeners: {
            mousedown(evt) {
                evt.stopPropagation();
                container.draggable = true;
            },

        }
    })

    // Inhalte
    CompInput({
        parent: elInner,
        key: 'title',
        data,
        nextToIndex: true,
    })

    // Text
    CompInput({
        parent: elInner,
        legend: 'Text',
        key: 'content',
        data,
        multiline: true,
    })

    // Tags
    CompInput({
        parent: elInner,
        legend: 'Tags',
        key: 'tags',
        data,
        valueIsArray: true,
    })


    // Images
    // console.log('images', data.images);
    if (data.images) {

    }

    // Type
    dom.create({
        parent: elInner,
        content: data.type,
        cssClassName: 'type',
    })

    // ID
    dom.create({
        parent: elInner,
        content: 'ID: ' + data.id,
        cssClassName: 'info',
    })

    // Creation Date
    dom.create({
        parent: elInner,
        content: `${lang.getPhrase('createdAt')}: ` + new Date(data.crDate).toLocaleDateString(),
        cssClassName: 'info',
    })

    // Change Date
    dom.create({
        parent: elInner,
        content: `${lang.getPhrase('changedAt')}: ` + new Date(data.chDate).toLocaleDateString(),
        cssClassName: 'info',
    })

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