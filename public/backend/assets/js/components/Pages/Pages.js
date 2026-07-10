'use strict';

import data from "../../data.js";
import elements from "../../elements.js";
import dom from "../../dom.js";

import compDetailsPage from "../Page/Page.js";

let activeMenuLink = null;

const CompSinglePage = ({page, index, parent}) => {
    if (page && page.id !== 'root') {

        const container = dom.create({
            cssClasses: ['page'],
            parent,
            listeners: {
                click(evt) {
                    evt.stopPropagation();

                    activeMenuLink?.classList.remove('active');
                    activeMenuLink = container;
                    activeMenuLink.classList.add('active');

                    data.currentPage = page.id;
                    // Es muss aus den gespeicherten Daten die aktuelle Seite mit der ID gesucht werden
                    // Wenn die Seite hier zwischengespeichert wird, verliert er die Referenz,
                    // da die Seite immutatable ist
                    console.log(data.pages);

                    compDetailsPage(data.pages.find(item => item.id === page.id));
                }
            }
        })
        console.log(page.id, data.currentPage);
        if (page.id === data.currentPage) {
            container.classList.add('active');
            activeMenuLink = container;
        }


        dom.create({
            cssClasses: ['page-title'],
            content: `${page.title}`,
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

    const pageRoot = data.pages.find(page => page.id === 'root');
    if (pageRoot) pageRoot.children.forEach((pageID, index) => {

        const page = data.pages.find(page => page.id === pageID);
        CompSinglePage({page, index, parent: elements.pages});
    })

}

export default Pages;