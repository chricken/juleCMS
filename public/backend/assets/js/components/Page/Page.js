'use strict';

import elements from "../../elements.js";
import dom from "../../dom.js";
import compInput from '../Input/Input.js';
import ajax from "../../ajax.js";
import CompContent from "../Content/Content.js";

const base = ({
                  data = {},
                  parent = null
              }) => {

    const container = dom.create({
        cssClassName: 'base container',
        parent,
        listeners: {
            click(evt) {
                evt.stopPropagation();
                container.classList.toggle('open');
            }
        }
    })

    // Header
    dom.create({
        parent: container,
        content: 'Base',
        tagName: 'h3',
    })

    dom.create({
        parent: container,
        content: `ID: ${data.id}`,
        cssClassName: 'info',
    })

    compInput({
        parent: container,
        legend: 'Slug',
        key: 'slug',
        data,
    })

    dom.create({
        parent: container,
        content: `Created: ${new Date(data.crDate).toLocaleDateString()}`,
        cssClassName: 'info',

    })
    dom.create({
        parent: container,
        content: `Last Changed: ${new Date(data.chDate).toLocaleDateString()}`,
        cssClassName: 'info',
    })

}


const meta = ({
                  data = {},
                  parent = null
              }) => {
    const container = dom.create({
        cssClassName: 'meta container',
        parent,
        listeners: {
            click(evt) {
                evt.stopPropagation();
                container.classList.toggle('open');
            }
        }
    })

    // Header
    dom.create({
        parent: container,
        content: 'Meta',
        tagName: 'h3',
    })

    compInput({
        parent: container,
        legend: 'Meta Title',
        key: 'metaTitle',
        data,
    })

}


const content = ({
                     data = {},
                     parent = null
                 }) => {
    const container = dom.create({
        cssClassName: 'meta container',
        parent,
        listeners: {
            click(evt) {
                evt.stopPropagation();
                container.classList.toggle('open');
            }
        }
    })

    // Header
    dom.create({
        parent: container,
        content: 'Content',
        tagName: 'h3',
    })

    data.content.forEach((contentID, index) => {
        ajax.loadJSON(`/api/content/${contentID}`).then(
            data => {
                CompContent({
                    data,
                    index,
                    parent: container
                });
            }
        )
    })

}


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

    base({data: page, parent: elements.page});
    meta({data: page, parent: elements.page});
    content({data: page, parent: elements.page});


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