'use strict';

import dom from '../../dom.js';
import ajax from "../../ajax.js";

const Image = ({
                   imageID = '',
                   parent = null,
               }) => {


    const container = dom.create({
        parent: parent,
        tagName: 'div',
        cssClassName: 'container-image'
    })

    parent && parent.append(container);

    ajax.loadImageMetaData(imageID).then(
        payload => {
            console.log('payload image', payload);


            dom.create({
                parent: container,
                tagName: 'h3',
                content: payload.title
            })

            let filename = payload.resized.filter(item => item.width >= 150);
            filename.sort((a, b) => a.width - b.width);
            filename = filename[0].filename;
            console.log('image filename', filename);

            dom.create({
                parent: container,
                tagName: 'img',
                src: `/api/getImg/media/${filename}`
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