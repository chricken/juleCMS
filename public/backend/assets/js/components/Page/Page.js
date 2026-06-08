'use strict';

import data from "../../data.js";
import elements from "../../elements.js";
import dom from "../../dom.js";

const Page = (page) => {
    elements.page.innerHTML = ``;

    dom.create({
        tagName: 'h2',
        content: page.title,
        parent: elements.page,
        attr: {
            contenteditable: true,
        },
        listeners: {
            input(evt) {
                page.title = evt.target.innerText;
            }
        }
    })


    dom.create({
        tagName: 'button',
        content: 'Save',
        parent: elements.page,
        listeners: {
            click(evt) {
                evt.stopPropagation();
                console.log(page);
            }
        }
    })
    let path = new URL(import.meta.url).pathname;
    path = `${path.substring(0, path.lastIndexOf('/') + 1)}Page.css`;

    dom.create({
        tagName: 'link',
        attr: {
            href: path,
            rel: 'stylesheet',
        },
        parent: elements.page
    })
}

export default Page;