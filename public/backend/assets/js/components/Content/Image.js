'use strict';

import dom from '../../dom.js';
import ajax from "../../ajax.js";
import lang from "../../lang.js";

const Image = ({
                   imageID = '',
                   parent = null,
                   onDelete = () => {
                   },
                   onStartDrag = () => {
                   },
                   onEndDrag = () => {
                   },
                   onImageLoaded = () => {
                   },
               }) => {


    const container = dom.create({
        parent: parent,
        tagName: 'div',
        cssClassName: 'container-image',
        attr: {
            draggable: true
        },
        listeners: {
            dragstart(e) {
                e.stopPropagation();
                console.log('dragstart', e);
                onStartDrag(imageID);
            },
            dragend(e) {
                onEndDrag()
            },
        }
    })

    parent && parent.append(container);

    ajax.loadImageMetaData(imageID).then(
        payload => {
            dom.create({
                parent: container,
                tagName: 'h3',
                content: payload.title
            })

            const elInner = dom.create({
                parent: container,
                cssClassName: 'container-image-inner',

            })

            let filename = payload.resized.filter(item => item.width >= 150);
            filename.sort((a, b) => a.width - b.width);
            filename = filename[0].filename;
            // console.log('image filename', filename);

            dom.create({
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
                        if (confirm(lang.getPhrase('deleteImage'))) {
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