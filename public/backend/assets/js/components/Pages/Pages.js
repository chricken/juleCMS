'use strict';

import data from "../../data.js";
import elements from "../../elements.js";
import dom from "../../dom.js";

import compDetailsPage from "../Page/Page.js";

const CompSinglePage = ({page, index, parent}) => {
    if (page.id !== 'root') {
        const container = dom.create({
            cssClasses: ['page'],
            parent,
            listeners: {
                click(evt) {
                    evt.stopPropagation();
                    console.log(page);
                    compDetailsPage(page);
                }
            }
        })


        dom.create({
            cssClasses: ['page-title'],
            content: `${index} ${page.title}`,
            parent: container,
        })

        // Verschachtelte Seiten
        if (page.children.length) {
            page.children.forEach((pageID, index) => {
                const page = data.pages.find(page => page.id === pageID);
                CompSinglePage({
                    page,
                    index,
                    parent: container
                });
            })
        }
    }
}


const Pages = () => {
    elements.pages.innerHTML = ``;

    dom.create({
        tagName: 'h2',
        content: 'Seiten',
        parent: elements.pages,
    })

    const pageRoot = data.pages.find(page => page.id === 'root');
    if (pageRoot) pageRoot.children.forEach((pageID, index) => {

        const page = data.pages.find(page => page.id === pageID);
        CompSinglePage({page, index, parent: elements.pages});
    })

    let path = new URL(import.meta.url).pathname;
    path = `${path.substring(0, path.lastIndexOf('/') + 1)}Pages.css`;

    dom.create({
        tagName: 'link',
        attr: {
            href: path,
            rel: 'stylesheet',
        },
        parent: elements.pages
    })
}

export default Pages;