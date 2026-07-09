'use strict';

import dom from "../../dom.js";
import CompInput from "../Input/Input.js";
import elements from "../../elements.js";
import ajax from "../../ajax.js";
import settings from "../../data.js";

import compDetailsPage from "../Page/Page.js";

const DropContent = ({
                         parent = null,
                         index = 0,
                         page = null,
                     } = {}) => {

    const container = dom.create({
        parent,
        cssClassName: 'drop-content transit',
        listeners: {
            click(evt) {
                evt.stopPropagation();
            }
        }
    })

    const dropOuter = dom.create({
        parent: container,
        cssClassName: 'drop transit',
        listeners: {
            dragover(evt) {
                evt.preventDefault();
                container.classList.add('drag-over');
                console.log('dragover');
            },
            dragleave(evt) {
                container.classList.remove('drag-over');
                evt.preventDefault();
                console.log('dragleave');
            },
            drop(evt) {
                settings.dropIndex = index;
                evt.preventDefault();
                console.log('drop', settings);
                ajax.moveContent().then(
                    payload => {
                        page = payload;
                        compDetailsPage(page);
                    }
                )
            }
        }
    })

    const dropInner = dom.create({
        parent: dropOuter,
        content: 'Drop Here',
        cssClassName: 'dropInner',
    })

    let path = new URL(import.meta.url).pathname;
    path = `${path.substring(0, path.lastIndexOf('/') + 1)}DropContent.css`;

    dom.create({
        tagName: 'link',
        attr: {
            href: path,
            rel: 'stylesheet',
        },
        parent: elements.page
    })


};

export default DropContent;