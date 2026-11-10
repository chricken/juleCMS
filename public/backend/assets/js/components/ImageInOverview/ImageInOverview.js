'use strict';

import dom from "../../dom.js";
import elements from "../../elements.js";
import lang from "../../lang.js";
import ajax from "../../ajax.js";

import CompTag from "../Tag/Tag.js";
import Modal from "../../modal/modal.js";
import ModalEditImage from '../../modal/EditImage/EditImage.js';

const ImageInOverview = ({
                             image = null,
                             parent = null,
                             onDeleted = () => {
                             },
                             onEdited = () => {
                             },
                             draggable = false,
                             onDragStart = () => {},
                             onDropOn = () => {},
                             onDragEnd = () => {}
                         }) => {
    const container = dom.create({
        parent,
        cssClassName: 'card card-image transit' + (draggable ? ' draggable' : ''),
        listeners: {
            dragstart(evt) {
                evt.stopPropagation();
                container.classList.add('dragging');
                evt.dataTransfer.setData('text/plain', image.id);
                evt.dataTransfer.effectAllowed = 'move';
                onDragStart(image.id);
            },
            dragover(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                evt.dataTransfer.dropEffect = 'move';
                container.classList.add('drag-over');
            },
            dragleave(evt) {
                evt.stopPropagation();
                container.classList.remove('drag-over');
            },
            drop(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                container.classList.remove('drag-over');
                const dragID = evt.dataTransfer.getData('text/plain');
                if (dragID && dragID !== image.id) onDropOn(dragID, image.id);
            },
            dragend(evt) {
                evt.stopPropagation();
                container.classList.remove('dragging');
                onDragEnd();
            }
        }
    })
    if (draggable) container.setAttribute('draggable', true);

    const elTitle = dom.create({
        tagName: 'h2',
        content: `${image.title}`,
        parent: container,
        cssClassName: 'transit',
        listeners: {
            click(evt) {
                evt.stopPropagation();
                container.classList.toggle('open');
            }
        }
    })

    dom.create({
        tagName: 'span',
        parent: elTitle,
        content: '⯈',
        insert: 'prepend',
        cssClassName:'openIndicator transit',
        listeners: {
            click(evt) {
                evt.stopPropagation();
                container.classList.toggle('open');
            }
        }
    })

    dom.create({
        tagName: 'p',
        cssClassName: 'visibleInOpen',
        content: image.description.replaceAll('\r\n', '<br>'),
        parent: container,
    })

    dom.create({
        tagName: 'p',
        content: `${lang.getPhrase('changedAt')} : ${new Date(image.chDate).toLocaleString()}`,
        cssClassName: 'chDate smallInfo visibleInOpen',
        parent: container,
    })

    if (image.altName) {
        dom.create({
            tagName: 'p',
            content: `Alternativ: ${image.altName}`,
            cssClassName: 'chDate smallInfo visibleInOpen',
            parent: container,
        })

    }
    // console.log(image);

    // kleinstes Bild finden
    let min = Math.min(...image.resized.map(el => el.width))

    console.log(image);

    let filename = image.resized.length
        ? image.resized.find(el => el.width === min).filename
        : image.filename;

    let elImg = dom.create({
        tagName: 'img',
        parent: container,
        src: `/api/getImg/media/${filename}`
    })

    // Tags
    const elTags = dom.create({
        parent: container,
        cssClassName: 'tags visibleInOpen',
    })
    image.tags.forEach(tag => {
        CompTag({
            parent: elTags,
            content: tag,
        })
    })

    // Buttons
    dom.create({
        tagName: 'button',
        content: lang.getPhrase('edit'),
        parent: container,
        cssClassName: 'visibleInOpen',
        listeners: {
            click(evt) {
                evt.preventDefault();
                evt.stopPropagation();

                ModalEditImage({
                    legend: lang.getPhrase('editImage'),
                    image: image,
                    onSaved() {
                        onEdited()
                    }
                })
            }
        }

    })

    dom.create({
        tagName: 'button',
        content: lang.getPhrase('delete'),
        cssClassName: 'visibleInOpen',
        parent: container,
        listeners: {
            click(evt) {
                evt.stopPropagation();
                if (confirm(lang.getPhrase('sureDeleteImage'))) {
                    console.log('delete image', image);
                    ajax.deleteMedia(image).then(
                        (res) => {
                            console.log(`${image.title} deleted`, res.filesDeleted);
                            onDeleted(image);
                        }
                    )
                }
            }
        }
    })

    let path = new URL(import.meta.url).pathname;
    path = `${path.substring(0, path.lastIndexOf('/') + 1)}ImageInOverview.css`;

    dom.create({
        tagName: 'link',
        attr: {
            href: path,
            rel: 'stylesheet',
        },
        parent: container
    })

    return container;
}

export default ImageInOverview;