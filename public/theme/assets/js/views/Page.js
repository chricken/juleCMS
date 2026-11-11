'use strict';

// View: rendert eine Seite (Titel + alle Inhaltselemente)

import dom from '/cms/js/dom.js';
import ajax from '/cms/js/ajax.js';
import renderMD from '/cms/js/markdown.js';
import Content from '../components/Content.js';
import Breadcrumb from '../components/Breadcrumb.js';

const PageView = ({page = null, parent = null} = {}) => {
    if (!parent || !page) return;
    parent.innerHTML = '';

    Breadcrumb({page, parent});

    dom.create({
        tagName: 'h1',
        content: page.title,
        parent,
        cssClassName: 'page-title',
    })

    if (page.description) {
        dom.create({
            parent,
            cssClassName: 'page-description content-md',
            content: renderMD(page.description),
        })
    }

    const contentContainer = dom.create({
        parent,
        cssClassName: 'page-content',
    })

    ;(page.content || []).forEach(contentID => {
        ajax.loadJSON(`/api/content/${contentID}`).then(
            res => Content({item: res.payload, parent: contentContainer})
        ).catch(
            console.warn
        )
    })
}

export default PageView;
