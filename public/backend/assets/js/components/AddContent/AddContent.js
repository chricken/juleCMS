'use strict';

import dom from "../../dom.js";
import CompInput from "../Input/Input.js";
import elements from "../../elements.js";
import ajax from "../../ajax.js";

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

    dom.create({
        parent: container,
        content: '+',
        cssClassName: 'add transit',
        listeners: {
            click(evt) {
                evt.stopPropagation();
                console.log('add page', page);

                ajax.createContent(page.id, index);
            }
        }
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