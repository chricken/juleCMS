'use strict';

import dom from '../../dom.js';

const CompImage = ({
                       parent = null,
                       img,
                       onSelected = () => {
                       }
                   }) => {
    // console.log(res);
    // kleinstes Bild >400px suchen
    let gt400 = img.resized.filter(img => img.width > 150)
    gt400 = gt400.sort((a, b) => a.width - b.width)[0]

    const container = dom.create({
        parent,
        cssClassName: 'add-image transit',
        listeners:{
            click(){
                onSelected(img.id)
            }
        }
    })

    dom.create({
        parent: container,
        tagName: 'h3',
        cssClassName: 'transit',
        content: img.title
    })

    dom.create({
        tagName: 'div',
        parent: container,
        cssClassName: 'img transit',
        styles: {
            backgroundImage: `url(/api/getImg/media/${gt400.filename})`
        },
    })

    // fetch(`/api/getImg/media/${key}`)

}

export default CompImage;