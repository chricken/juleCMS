'use strict';

import data from "../../data.js";
import elements from "../../elements.js";
import dom from "../../dom.js";
import ajax from "../../ajax.js";

import compDetailsPage from "../Page/Page.js";
import lang from "../../lang.js";

let activeMenuLink = null;

// Collapse-Status aus localStorage
const getCollapsed = () => {
    try { return JSON.parse(localStorage.getItem('jule:collapsedPages') || '[]'); } catch(e) { return []; }
};
const setCollapsed = (id, collapsed) => {
    let arr = getCollapsed();
    if (collapsed) { if (!arr.includes(id)) arr.push(id); }
    else arr = arr.filter(x => x !== id);
    localStorage.setItem('jule:collapsedPages', JSON.stringify(arr));
};

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
            mouseenter() {
                elements.pages.querySelectorAll('.page.hovered').forEach(el => el.classList.remove('hovered'));
                container.classList.add('hovered');
            },
            mouseleave() {
                container.classList.remove('hovered');
            },
            click(evt) {
                evt.stopPropagation();

                activeMenuLink?.classList.remove('active');
                activeMenuLink = container;
                activeMenuLink.classList.add('active');

                data.currentPage = page.id;
                localStorage.setItem('jule:currentPage', page.id);
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

    // Collapse-Pfeil (nur wenn Kinder vorhanden)
    const hasChildren = page.children && page.children.length > 0;
    const isCollapsed = getCollapsed().includes(page.id);
    if (hasChildren) {
        container.classList.add('has-arrow');
        dom.create({
            cssClassName: 'collapse-arrow' + (isCollapsed ? ' collapsed' : ''),
            content: '▸',
            parent: container,
            attr: {title: lang.getPhrase('collapse'), tabindex: '-1'},
            listeners: {
                click(evt) {
                    evt.stopPropagation();
                    const nowCollapsed = !getCollapsed().includes(page.id);
                    setCollapsed(page.id, nowCollapsed);
                    rerenderNav();
                }
            }
        })
    }

    // Titel – gleichzeitig Drop-Zone für "into"
    dom.create({
        cssClassName: 'page-title',
        content: `${page.title}` + (page.visible === false ? ' <span class="page-hidden-icon" title="' + lang.getPhrase('toggleVisible') + '">(🚫)</span>' : ''),
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

    // Aktions-Icons (nur bei hover sichtbar, via CSS)
    const actions = dom.create({
        cssClassName: 'page-actions',
        parent: container,
    })

    if (!isRoot) {
        dom.create({
            cssClassName: 'page-action page-action-delete',
            content: '✖',
            parent: actions,
            attr: {title: lang.getPhrase('removePage')},
            listeners: {
                click(evt) {
                    evt.stopPropagation();
                    if (confirm(lang.getPhrase('sureDeletePage'))) {
                        ajax.removePage(page);
                    }
                }
            }
        })
    }

    if (!isRoot) {
        const isVisible = page.visible !== false;
        dom.create({
            cssClassName: 'page-action eye-toggle' + (isVisible ? ' visible' : ' hidden'),
            content: isVisible ? '👁' : '🚫',
            parent: actions,
            attr: {title: lang.getPhrase('toggleVisible')},
            listeners: {
                click(evt) {
                    evt.stopPropagation();
                    page.visible = isVisible ? false : true;
                    ajax.savePage(page);
                    rerenderNav();
                }
            }
        })
    }

    dom.create({
        cssClassName: 'page-action page-action-into',
        content: '↳',
        parent: actions,
        attr: {title: lang.getPhrase('newPageIn')},
        listeners: {
            click(evt) {
                evt.stopPropagation();
                ajax.newPageIn(page);
            }
        }
    })

    dom.create({
        cssClassName: 'page-action page-action-before',
        content: '↑',
        parent: actions,
        attr: {title: lang.getPhrase('newPageBefore')},
        listeners: {
            click(evt) {
                evt.stopPropagation();
                ajax.newPageBefore(page);
            }
        }
    })

    dom.create({
        cssClassName: 'page-action page-action-after',
        content: '↓',
        parent: actions,
        attr: {title: lang.getPhrase('newPageAfter')},
        listeners: {
            click(evt) {
                evt.stopPropagation();
                ajax.newPageAfter(page);
            }
        }
    })

    // Verschachtelte Seiten in eigenem Baum-Container
    if (page.children && page.children.length) {
        const childrenContainer = dom.create({
            cssClassName: 'page-children' + (isCollapsed ? ' collapsed' : ''),
            parent: container,
        })
        page.children.forEach((pageID, index) => {
            const childPage = data.pages.find(p => p.id === pageID);
            CompNavPage({
                page: childPage,
                index,
                parent: childrenContainer
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
