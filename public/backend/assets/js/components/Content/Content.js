'use strict';

import dom from "../../dom.js";
import elements from "../../elements.js";
import settings from "../../data.js";
import lang from "../../lang.js";
import helpers from "../../helpers.js";
import ajax from "../../ajax.js";

import CompSelect from "../Select/Select.js";
import CompInput from "../Input/Input.js";
import CompImage from "./Image.js";

import ModalAddImage from '../../modal/AddImage/AddImage.js';

// Unterkomponenten
import CompLink from './Link.js';

const Content = ({
                     data = {},
                     parent = null,
                     index = null,
                     onRemove = () => {
                     },
                     onDragStart = () => {
                     },
                     onDragEnd = () => {
                     },
                 } = {}) => {
    // console.log('Content Data', data);

    const saveContent = helpers.debouncer(ajax.saveContent, 1000)

    const container = dom.create({
        parent,
        // content: 'Contentelement',
        cssClassName: 'container content edit transit',
        listeners: {
            click(evt) {
                evt.stopPropagation();
            },
            mousedown(evt) {
                evt.stopPropagation();
            },
            dragstart(evt) {
                console.log('dragstart');
                settings.dragID = data.id;
                onDragStart();
                evt.dataTransfer.setDragImage(container, 0, 0);
            },
            dragend() {
                container.draggable = false;
                // settings.dragID = null;
                onDragEnd();
            }
        }
    })

    const elInner = dom.create({
        parent: container,
    })

    dom.create({
        content: '⯈',
        parent: elInner,
        cssClassName: 'content-opener transit',
        listeners: {
            click(evt) {
                evt.stopPropagation();
                if (container.classList.contains('open')) {
                    container.classList.remove('open');
                    container.style.height = null;
                } else {
                    container.classList.add('open');
                    container.style.height = elInner.getBoundingClientRect().height + 30 + 'px';
                }
            }
        }
    })

    // Interaktivity
    dom.create({
        parent: elInner,
        content: '✖',
        cssClassName: 'btn-delete transit',
        listeners: {
            click(evt) {
                evt.stopPropagation();
                onRemove(data);
            }
        }
    })

    dom.create({
        parent: elInner,
        cssClassName: 'dragger transit',
        listeners: {
            mousedown(evt) {
                evt.stopPropagation();
                container.draggable = true;
            },

        }
    })

    // Inhalte
    CompInput({
        parent: elInner,
        legend: lang.getPhrase('title'),
        value: data.title,
        isTitle: true,
        // nextToIndex: true,
        onInput(value) {
            console.log('Neuer Titel: ', value);
            data.title = value;
            saveContent(data);
        }
    })

    // Text
    let content = data.content;
    content = content.replaceAll('\r\n', '<br>');
    content = content.replaceAll('\n', '<br>');

    CompInput({
        parent: elInner,
        legend: lang.getPhrase('text'),
        value: content,
        multiline: true,
        onInput(value) {
            data.content = value;
            saveContent(data);
        }
    })

    // Images
    let containerImages = dom.create({
        parent: elInner,
        cssClassName: 'container container-inner container-collapsable container-images'
    })

    const renderImages = () => {
        console.log('rerender Images');

        if (containerImages) containerImages.innerHTML = '';

        dom.create({
            cssClassName: 'indicatorOpen-links',
            parent: containerImages,
            content: '⯈',
            listeners: {
                click() {
                    console.log('click Pfeil')
                    containerImages.classList.toggle('open');
                    container.style.height = elInner.getBoundingClientRect().height + 30 + 'px';
                }
            }
        })

        // Images neu rendern
        dom.create({
            parent: containerImages,
            tagName: 'h3',
            content: lang.getPhrase('images'),
            cssClassName: 'container-inner-title transit',
            listeners: {
                click() {
                    console.log('click Header')
                    containerImages.classList.toggle('open');
                    container.style.height = elInner.getBoundingClientRect().height + 30 + 'px';
                }
            }
        })

        // Leeren, ohne die Referenz zu zerstören
        const elementsDraggers = [];
        let draggedElement = null;

        data.images.forEach((imageID, index) => {

            const elImage = CompImage({
                parent: containerImages,
                imageID,
                index,
                draggable: true,
                onDelete: () => {
                    // data.images = data.images.filter(id => id !== imageID);
                    data.images.splice(index, 1);
                    renderImages();
                    saveContent(data);
                },
                onStartDrag(evt, elImg) {
                    console.log('On Start Drag');

                    // Erstelle ein temporäres Canvas oder nutze ein bestehendes Element als Vorschau
                    const dragContainer = dom.create({
                        parent: document.body,
                        style: {
                            background: 'white',
                            padding: '10px',
                            border: '1px solid #ccc',
                            position: 'absolute',
                            left: '-9999px',
                        }
                    })
                    draggedElement = {
                        imageID,
                        index
                    }
                    const dragImage = elImg.cloneNode(true);
                    dragImage.style.width = '100px';
                    dragImage.style.height = 'auto';
                    dragContainer.appendChild(dragImage);

                    // Setze das Drag-Image
                    evt.dataTransfer.setDragImage(dragContainer, 0, 0);

                    // Entferne das temporäre Element nach einer kurzen Verzögerung
                    setTimeout(() => document.body.removeChild(dragContainer), 50);
                },
                onDragOver(evt) {
                    // console.log('Drag Over',evt.target);
                    evt.currentTarget.classList.add('drag-over');
                },
                onDragLeave(evt) {
                    // console.log('Drag Leave', evt.target);
                    evt.currentTarget.classList.remove('drag-over');
                },
                onEndDrag(evt) {
                    console.log('Drag End', evt.currentTarget, index)
                    elementsDraggers.forEach(el => {
                        el.classList.remove('drag-over')
                    })
                },
                onDrop(evt) {
                    console.log(index, draggedElement);
                    data.images.splice(draggedElement.index, 1);
                    if (draggedElement.index < index) {
                        data.images.splice(index , 0, draggedElement.imageID);
                    } else {
                        data.images.splice(index+1, 0, draggedElement.imageID);
                    }
                    saveContent(data);
                    renderImages();
                },
                onImageLoaded(evt) {

                }
            })
            elementsDraggers.push(elImage)


        })

        const elButtons = dom.create({
            parent: containerImages,
        })

        dom.create({
            parent: elButtons,
            tagName: 'button',
            content: lang.getPhrase('addImage'),
            cssClassName: 'button button-small',
            listeners: {
                click: () => {
                    ModalAddImage({
                        onSelected(id) {
                            console.log('Bild', id);
                            data.images.push(id);
                            renderImages();
                            saveContent(data);
                        }
                    })
                }
            }
        })


    }

    renderImages();

    // Links

    let containerLinks = dom.create({
        parent: elInner,
        cssClassName: 'container container-inner container-collapsable'
    })

    const renderLinks = () => {
        // Links entfernen
        if (containerLinks) containerLinks.innerHTML = '';

        dom.create({
            cssClassName: 'indicatorOpen-links transit',
            parent: containerLinks,
            content: '⯈',
            listeners: {
                click() {
                    console.log('click Pfeil')
                    containerLinks.classList.toggle('open');
                    container.style.height = elInner.getBoundingClientRect().height + 30 + 'px';
                }
            }
        })

        // Links neu rendern
        dom.create({
            parent: containerLinks,
            tagName: 'h3',
            content: lang.getPhrase('links'),
            cssClassName: 'container-inner-title',
            listeners: {
                click() {
                    console.log('click Header')
                    containerLinks.classList.toggle('open');
                    container.style.height = elInner.getBoundingClientRect().height + 30 + 'px';
                }
            }
        })

        data.links.forEach((link, index) => CompLink({
            link,
            index,
            numGesamt: data.links.length,
            parent: containerLinks,
            saveContent: () => {
                saveContent(data);
            },
            renderLinks: () => {
                renderLinks();
                container.style.height = elInner.getBoundingClientRect().height + 30 + 'px';
            },
            removeLink: () => {
                data.links = data.links.filter(l => l !== link);
            },
            moveUp: () => {
                data.links.splice(index - 1, 0, data.links.splice(index, 1)[0]);
                renderLinks();
                container.style.height = elInner.getBoundingClientRect().height + 30 + 'px';
            },
            moveDown: () => {
                data.links.splice(index + 1, 0, data.links.splice(index, 1)[0]);
                renderLinks();
                container.style.height = elInner.getBoundingClientRect().height + 30 + 'px';
            }
        }))

        // Button, um einen neuen Link hinzuzufügen
        dom.create({
            parent: containerLinks,
            tagName: 'button',
            content: lang.getPhrase('addLink'),
            cssClassName: 'button button-small',
            listeners: {
                click: () => {
                    data.links.push({
                        legend: '',
                        url: '',
                        target: '_blank'
                    })
                    console.log(data);

                    saveContent(data);
                    renderLinks();
                    container.style.height = elInner.getBoundingClientRect().height + 30 + 'px';
                }
            }
        })
    }

    renderLinks();

    // Tags
    CompInput({
        parent: elInner,
        legend: lang.getPhrase('tags'),
        value: data.tags,
        valueIsArray: true,
        onInput(value) {
            console.log('Neue Tags: ', value);
            data.tags = value;
            saveContent(data);
        }
    })


    // Images
    // console.log('images', data.images);
    if (data.images) {

    }

    // Auswahl der Mediendaten
    // Ein Button öffnet die Auswahl
    // der Media-View in einem Modal

    // Type
    dom.create({
        parent: elInner,
        content: data.type,
        cssClassName: 'type',
    })

    // ID
    dom.create({
        parent: elInner,
        content: 'ID: ' + data.id,
        cssClassName: 'info',
    })

    // Creation Date
    dom.create({
        parent: elInner,
        content: `${lang.getPhrase('createdAt')}: ` + new Date(data.crDate).toLocaleDateString(),
        cssClassName: 'info',
    })

    // Change Date
    dom.create({
        parent: elInner,
        content: `${lang.getPhrase('changedAt')}: ` + new Date(data.chDate).toLocaleDateString(),
        cssClassName: 'info',
    })

    /*
    images = [],
    visible = true,
    */

    let path = new URL(import.meta.url).pathname;
    path = `${path.substring(0, path.lastIndexOf('/') + 1)}Content.css`;

    dom.create({
        tagName: 'link',
        attr: {
            href: path,
            rel: 'stylesheet',
        },
        parent: elements.page
    })


};

export default Content;