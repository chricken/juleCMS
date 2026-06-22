'use strict';

import elements from "../../elements.js";
import dom from "../../dom.js";
import compInput from '../Input/Input.js';
import ajax from "../../ajax.js";
import CompContent from "../Content/Content.js";
import CompAddContent from "../AddContent/AddContent.js";

import lang from "../../lang.js";
import helpers from "../../helpers.js";

const collapse = (el, elInner) => {
    el.classList.toggle('open');

    if (el.classList.contains('open')) {
        el.style.height = 80 + elInner.scrollHeight + 'px';
    } else {
        el.style.height = 50 + 'px';
    }
};

const base = ({
                  data = {},
                  parent = null
              }) => {

    const container = dom.create({
        cssClassName: 'base container collapsable transit',
        parent,
        styles: {
            height: '50px',
        }
    })

    const containerInner = dom.create({
        cssClassName: 'containerInner transit',
        parent: container,
    })

    dom.create({
        content: '⯈',
        cssClassName: 'indicatorOpen transit',
        parent: containerInner,
    })

    // Header
    dom.create({
        parent: containerInner,
        content: 'Base',
        tagName: 'h3',
        cssClassName: 'transit',
        listeners: {
            click(evt) {
                evt.stopPropagation();
                // container.classList.toggle('open');
                collapse(container, inner);
            }
        }
    })

    const inner = dom.create({
        parent: containerInner,
        cssClassName: 'inner',
    })

    dom.create({
        parent: inner,
        content: `ID: ${data.id}`,
        cssClassName: 'info',
    })

    compInput({
        parent: inner,
        legend: 'Slug',
        key: 'slug',
        data,
    })

    dom.create({
        parent: inner,
        content: `Created: ${new Date(data.crDate).toLocaleDateString()}`,
        cssClassName: 'info',

    })
    dom.create({
        parent: inner,
        content: `Last Changed: ${new Date(data.chDate).toLocaleDateString()}`,
        cssClassName: 'info',
    })

}


const meta = ({
                  data = {},
                  parent = null
              }) => {
    const container = dom.create({
        cssClassName: 'meta container collapsable transit',
        parent,
        styles: {
            height: '50px',
        }
    })

    const containerInner = dom.create({
        cssClassName: 'containerInner transit',
        parent: container,
    })
    dom.create({
        content: '⯈',
        cssClassName: 'indicatorOpen',
        parent: containerInner,
    })

    // Header
    dom.create({
        parent: containerInner,
        content: 'Meta',
        tagName: 'h3',
        listeners: {
            click(evt) {
                evt.stopPropagation();
                // container.classList.toggle('open');
                collapse(container, inner);
            }
        }
    })


    const inner = dom.create({
        parent: containerInner,
        cssClassName: 'inner',
    })

    compInput({
        parent: inner,
        legend: 'Titel',
        key: 'metaTitle',
        data,
    })

    compInput({
        parent: inner,
        legend: 'Beschreibung',
        key: 'metaDescription',
        data,
    })

    compInput({
        parent: inner,
        legend: 'Schlüsselwörter',
        key: 'metaKeywords',
        data,
        valueIsArray: true,
    })

}


const content = ({
                     data = {},
                     parent = null
                 }) => {
    const container = dom.create({
        cssClassName: 'meta container collapsable open transit',
        parent
    })

    const containerInner = dom.create({
        cssClassName: 'containerInner transit',
        parent: container,
    })

    dom.create({
        content: '⯈',
        cssClassName: 'indicatorOpen',
        parent: containerInner,
    })

    // Header
    dom.create({
        parent: containerInner,
        content: 'Content',
        tagName: 'h3',
        listeners: {
            click(evt) {
                evt.stopPropagation();
                // container.classList.toggle('open');
                collapse(container, inner);
            }
        }
    })

    const inner = dom.create({
        parent: containerInner,
        cssClassName: 'inner',
    })

    CompAddContent({
        parent: inner,
        index: 0
    })

    data.content.forEach((contentID, index) => {
        ajax.loadJSON(`/api/content/${contentID}`).then(
            data => {
                CompContent({
                    data,
                    index,
                    parent: inner
                });

                CompAddContent({
                    parent: inner,
                    index: index + 1
                })
            }
        )
    })


}


const Page = (page) => {

    const saveDebounced = helpers.debouncer(ajax.savePage, 1000);

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
                saveDebounced(page);
            }
        }
    })

    content({data: page, parent: elements.page});
    base({data: page, parent: elements.page});
    meta({data: page, parent: elements.page});


    dom.create({
        tagName: 'button',
        content: lang.getPhrase('savePage'),
        parent: elements.page,
        listeners: {
            click(evt) {
                evt.stopPropagation();
                console.log(page);
            }
        }
    })

    dom.create({
        tagName: 'button',
        content: lang.getPhrase('newPageAfter'),
        parent: elements.page,
        listeners: {
            click(evt) {
                evt.stopPropagation();
                console.log(page);
            }
        }
    })

    dom.create({
        tagName: 'button',
        content: lang.getPhrase('newPageIn'),
        parent: elements.page,
        listeners: {
            click(evt) {
                evt.stopPropagation();
                console.log(page);
            }
        }
    })


}

export default Page;