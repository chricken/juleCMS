'use strict';

import dom from "../../dom.js";
import elements from "../../elements.js";
import lang from "../../lang.js";
import ajax from "../../ajax.js";

import CompTag from "../Tag/Tag.js";

const ImageInOverview = ({
                             image = null,
                             parent = null,
                             onDeleted = () => {
                             },
                         }) => {
    const container = dom.create({
        parent,
        cssClassName: 'card card-image',
    })

    dom.create({
        tagName: 'h2',
        content: image.title,
        parent: container,
    })

    dom.create({
        tagName: 'p',
        content: image.description.replaceAll('\r\n', '<br>'),
        parent: container,
    })


    dom.create({
        tagName: 'p',
        content: `${lang.getPhrase('changedAt')} : ${new Date(image.chDate).toLocaleString()}`,
        cssClassName: 'chDate smallInfo',
        parent: container,
    })
    // console.log(image);

    // kleinstes Bild finden
    let min = Math.min(...image.resized.map(el => el.width))
    let filename = image.resized.find(el => el.width === min).filename;
    let elImg = dom.create({
        tagName: 'img',
        parent: container,
        src: `/api/getImg/${filename}`
    })

    // Tags
    const elTags = dom.create({
        parent: container,
        cssClassName: 'tags',
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
    })

    dom.create({
        tagName: 'button',
        content: lang.getPhrase('delete'),
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