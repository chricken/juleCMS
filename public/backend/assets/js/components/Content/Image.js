'use strict';

import dom from '../../dom.js';
import ajax from "../../ajax.js";
import lang from "../../lang.js";

const Image = ({
                   imageID = '',
    index = 0,
                   parent = null,
                   draggable = false,
                   onDelete = () => {
                   },
                   onStartDrag = () => {
                   },
                   onEndDrag = () => {
                   },
                   onImageLoaded = () => {
                   },
                   onDragOver = () => {
                   },
                   onDragLeave = () => {
                   },
                   onDrop = () => {
                   }
               }) => {


    const container = dom.create({
        parent: parent,
        tagName: 'div',
        cssClassName: 'container-image transit',
        listeners: {
            dragstart(e) {
                e.stopPropagation();
                // e.preventDefault();
                onStartDrag(e, elImage);
            },
            dragover(e) {
                e.stopPropagation();
                e.preventDefault();
                onDragOver(e);
            },
            dragleave(e) {
                e.stopPropagation();
                // e.preventDefault();
                onDragLeave(e);
            },
            dragend(e) {
                e.stopPropagation();
                // e.preventDefault();
                onEndDrag(e)
            },
            drop(e) {
                // e.stopPropagation();
                // e.preventDefault();

                console.log('drop');
                onDrop(e, index, imageID);
            }
        }
    })
    draggable && container.setAttribute('draggable', true);
    parent && parent.append(container);

    const elMovable = dom.create({
        parent: container,
        cssClassName: 'container-image-movable transit'
    })

    let elImage;

    ajax.loadImageMetaData(imageID).then(
        payload => {
            dom.create({
                parent: elMovable,
                tagName: 'h3',
                content: payload.title
            })

            const elInner = dom.create({
                parent: elMovable,
                cssClassName: 'container-image-inner',

            })

            let filename = payload.resized.filter(item => item.width >= 150);
            filename.sort((a, b) => a.width - b.width);
            filename = filename[0].filename;
            // console.log('image filename', filename);

            elImage = dom.create({
                parent: elInner,
                tagName: 'img',
                src: `/api/getImg/media/${filename}`,
                listeners: {
                    load(evt) {
                        onImageLoaded(evt)
                    }
                }
            })

            dom.create({
                parent: elInner,
                content: '✖',
                cssClassName: 'delete-image transit',
                listeners: {
                    click() {
                        if (confirm(lang.getPhrase('confirmDeleteImage'))) {
                            onDelete();
                        }
                    }
                }
            })
        }
    )


    return container;
}

// Ein Bild muss auch Drag und droppable sein
// Dazu brauchen wir ein LandingPad vor/hinter jedem Bild.
// Bild muss aus der Auswahl gepickt werden -> Modal
// Oder ein neuer Upload muss gemacht werden -> Modal

export default Image;