'use strict';

import data from "../../data.js";
import elements from "../../elements.js";
import dom from "../../dom.js";

import compDetailsPage from "../Page/Page.js";

let activeMenuLink = null;

const CompNavPage = ({page, index, parent}) => {

    const container = dom.create({
        cssClasses: ['page', 'page-single'],
        parent,
        attr: {
            // draggable: true,
        },
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
                compDetailsPage(data.pages.find(item => item.id === page.id));
            },
            /*
            dragstart(evt) {
                console.log('dragstart', evt);
                    container.classList.add('invisible-while-dragging');
                elements.pages.classList.add('dragging');
            },
            dragend(evt) {
                console.log('dragend', evt);
                elements.pages.classList.remove('dragging');
            },
            */
        }
    })

    /*
    // Element, um Seiten zu droppen
    dom.create({
        cssClassName: 'dropperPage dropperPage-before',
        content: `Drop before ${page.title}`,
        parent: container,
        insert: 'prepend',
        listeners: {
            dragenter(evt) {
                evt.preventDefault();
                container.classList.add('drag-over');
            },
            dragleave(evt) {
                evt.preventDefault();
                container.classList.remove('drag-leave');
            },
            drop(evt) {
            }
        }
    })
    */

    if (page.id === data.currentPage) {
        container.classList.add('active');
        activeMenuLink = container;
    }

    dom.create({
        cssClassName: 'page-title',
        content: `${page.title}`,
        parent: container,
    })


    // Verschachtelte Seiten
    if (page.children.length) {
        page.children.forEach((pageID, index) => {
            const page = data.pages.find(page => page.id === pageID);
            CompNavPage({
                page,
                index,
                parent: container
            });
        })
    }
/*
    // Element, um Seiten zu droppen
    dom.create({
        cssClassName: 'dropperPage dropperPage-after',
        content: `Drop after ${page.title}`,
        parent: container,
        listeners: {
            dragenter(evt) {
                evt.preventDefault();
                container.classList.add('drag-over');
            },
            dragleave(evt) {
                evt.preventDefault();
                container.classList.remove('drag-leave');
            },
            drop(evt) {
            }
        }
    })
    */
}



export default CompNavPage;