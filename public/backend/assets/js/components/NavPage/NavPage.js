'use strict';

import data from "../../data.js";
import elements from "../../elements.js";
import dom from "../../dom.js";
import ajax from "../../ajax.js";

import compDetailsPage from "../Page/Page.js";

let activeMenuLink = null;

const rerenderNav = () => {
    elements.pages.innerHTML = '';
    CompNavPage();
}

const CompNavPage = ({
                         page = data.pages.find(page => page.id === 'root'),
                         index = 0,
                         parent = elements.pages
                     } = {}) => {

    const isRoot = page.id === 'root';

    const container = dom.create({
        cssClasses: ['page', 'page-single'],
        parent,
        listeners: {
            click(evt) {
                evt.stopPropagation();

                activeMenuLink?.classList.remove('active');
                activeMenuLink = container;
                activeMenuLink.classList.add('active');

                data.currentPage = page.id;
                compDetailsPage(data.pages.find(item => item.id === page.id));
            },
            dragstart(evt) {
                if (isRoot) {
                    evt.preventDefault();
                    return;
                }
                evt.stopPropagation();
                data.dragPageID = page.id;
                container.classList.add('invisible-while-dragging');
                elements.pages.classList.add('dragging');
                evt.dataTransfer.setDragImage(container, 0, 0);
                evt.dataTransfer.effectAllowed = 'move';
            },
            dragend() {
                container.classList.remove('invisible-while-dragging');
                elements.pages.classList.remove('dragging');
                data.dragPageID = null;
                elements.pages.querySelectorAll('.drag-over-before, .drag-over-after, .drag-over-into').forEach(el => {
                    el.classList.remove('drag-over-before', 'drag-over-after', 'drag-over-into');
                });
            },
        }
    })

    // draggable als Property setzen (zuverlässiger als setAttribute)
    if (!isRoot) container.draggable = true;

    if (page.id === data.currentPage) {
        container.classList.add('active');
        activeMenuLink = container;
    }

    // Drop-Zone: before (oberer dünner Balken)
    dom.create({
        cssClassName: 'dropperPage dropperPage-before',
        parent: container,
        insert: 'prepend',
        listeners: {
            dragover(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                evt.dataTransfer.dropEffect = 'move';
                container.classList.add('drag-over-before');
            },
            dragleave(evt) {
                evt.preventDefault();
                container.classList.remove('drag-over-before');
            },
            drop(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                container.classList.remove('drag-over-before');
                if (!data.dragPageID) return;
                ajax.movePage({dragID: data.dragPageID, targetID: page.id, position: 'before'}).then(
                    () => rerenderNav()
                ).catch(
                    err => console.warn(err)
                )
            }
        }
    })

    // Titel – gleichzeitig Drop-Zone für "into"
    dom.create({
        cssClassName: 'page-title',
        content: `${page.title}`,
        parent: container,
        listeners: {
            dragover(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                evt.dataTransfer.dropEffect = 'move';
                container.classList.add('drag-over-into');
            },
            dragleave(evt) {
                evt.preventDefault();
                container.classList.remove('drag-over-into');
            },
            drop(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                container.classList.remove('drag-over-into');
                if (!data.dragPageID) return;
                ajax.movePage({dragID: data.dragPageID, targetID: page.id, position: 'into'}).then(
                    () => rerenderNav()
                ).catch(
                    err => console.warn(err)
                )
            }
        }
    })

    // Verschachtelte Seiten
    if (page.children.length) {
        page.children.forEach((pageID, index) => {
            const childPage = data.pages.find(p => p.id === pageID);
            CompNavPage({
                page: childPage,
                index,
                parent: container
            });
        })
    }

    // Drop-Zone: after (unterer dünner Balken, nach den children)
    dom.create({
        cssClassName: 'dropperPage dropperPage-after',
        parent: container,
        listeners: {
            dragover(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                evt.dataTransfer.dropEffect = 'move';
                container.classList.add('drag-over-after');
            },
            dragleave(evt) {
                evt.preventDefault();
                container.classList.remove('drag-over-after');
            },
            drop(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                container.classList.remove('drag-over-after');
                if (!data.dragPageID) return;
                ajax.movePage({dragID: data.dragPageID, targetID: page.id, position: 'after'}).then(
                    () => rerenderNav()
                ).catch(
                    err => console.warn(err)
                )
            }
        }
    })

}


export default CompNavPage;
