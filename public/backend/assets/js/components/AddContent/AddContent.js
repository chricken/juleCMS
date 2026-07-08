'use strict';

import dom from "../../dom.js";
import CompInput from "../Input/Input.js";
import elements from "../../elements.js";
import ajax from "../../ajax.js";

import compDetailsPage from "../Page/Page.js";

const AddContent = ({
                        parent = null,
                        index = 0,
                        page = null,
                    } = {}) => {

    const container = dom.create({
        parent,
        cssClassName: 'add-content transit',
        listeners: {
            click(evt) {
                evt.stopPropagation();
            }
        }
    })

    const addOuter = dom.create({
        parent: container,
        cssClassName: 'add transit',
        listeners: {
            click(evt) {
                evt.stopPropagation();
                console.log('add page', page);
                let scrollTop = document.documentElement.scrollTop;
                ajax.createContent(page.id, index).then(
                    (payload) => {
                        // console.log('payload', payload);
                        page = payload;
                        compDetailsPage(page);
                        requestAnimationFrame(() => {
                            document.documentElement.scrollTop = scrollTop;
                        });
                    }
                );
            }
        }
    })

    const addInner = dom.create({
        parent: addOuter,
        content: '+',
        cssClassName: 'addInner',
    })

    let path = new URL(import.meta.url).pathname;
    path = `${path.substring(0, path.lastIndexOf('/') + 1)}AddContent.css`;

    dom.create({
        tagName: 'link',
        attr: {
            href: path,
            rel: 'stylesheet',
        },
        parent: elements.page
    })


};

export default AddContent;