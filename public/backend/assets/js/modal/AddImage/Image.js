'use strict';

import dom from '../../dom.js';

const CompImage = ({
    parent=null,
                       img,
                   }) => {
    // console.log(res);
    // kleinstes Bild >400px suchen
    let gt400 = img.resized.filter(img => img.width > 150)
    gt400 = gt400.sort((a, b) => a.width - b.width)[0]

    const container = dom.create({
        parent,
        cssClassName: 'add-image'
    })

    dom.create({
        tagName: 'img',
        parent: container,
        attr: {
            src: `/api/getImg/media/${gt400.filename}`,
            alt: img.title,
        },
    })

    // fetch(`/api/getImg/media/${key}`)

}

export default CompImage;