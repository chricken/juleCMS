'use strict';

import dom from "../../dom.js";
import CompInput from "../Input/Input.js";
import elements from "../../elements.js";
import settings from "../../data.js";
import lang from "../../lang.js";
import helpers from "../../helpers.js";
import ajax from "../../ajax.js";

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
    console.log('Content Data', data);

    const saveContent = helpers.debouncer(ajax.saveContent, 1000)

    const container = dom.create({
        parent,
        cssClassName: 'container content edit transit',
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
        legend: lang.getPhrase('title'),
        value: data.title,
        // nextToIndex: true,
        onInput(value) {
            console.log('Neuer Titel: ', value);
            data.title = value;
            saveContent(data);
        }
    })


    // Text
    let content = data.content;
    content = content.replaceAll('\r\n', '<br>');
    content = content.replaceAll('\n', '<br>');

    CompInput({
        parent: elInner,
        legend: lang.getPhrase('text'),
        value: content,
        multiline: true,
        onInput(value) {
            console.log('Neuer Text: ', value);
            data.content = value;
            saveContent(data);
        }
    })

    // Tags
    CompInput({
        parent: elInner,
        legend: lang.getPhrase('tags'),
        value: data.tags,
        valueIsArray: true,
        onInput(value) {
            console.log('Neue Tags: ', value);
            data.tags = value;
            saveContent(data);
        }
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