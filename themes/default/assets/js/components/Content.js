'use strict';

// Rendert ein Inhaltselement je nach Typ.
// Bilder werden "as is" eingebunden: größtes verfügbares resized
// (das Original wird serverseitig nach dem Resize gelöscht).

import dom from '/cms/js/dom.js';
import ajax from '/cms/js/ajax.js';
import renderMD from '/cms/js/markdown.js';

const imageURL = (meta) => {
    if (!meta || !meta.resized || !meta.resized.length) return '';
    return `/api/getImg/media/${meta.resized[0].filename}`; // resized ist absteigend sortiert
}

const renderImage = ({parent, imageID, cssClassName = ''}) => {
    ajax.loadJSON(`/api/getImgMetaData/media/${imageID}`).then(
        res => {
            const meta = res.payload;
            dom.create({
                tagName: 'img',
                parent,
                src: imageURL(meta),
                attr: {alt: meta.altName || meta.title || ''},
                cssClassName: 'content-image ' + cssClassName,
            })
        }
    ).catch(
        console.warn
    )
}

const renderImages = ({parent, images = []}) => {
    const wrap = dom.create({parent, cssClassName: 'content-images'})
    images.forEach(imageID => renderImage({parent: wrap, imageID}))
}

const Content = ({item = {}, parent = null} = {}) => {
    if (!parent) return;
    if (item.visible === false) return;

    const container = dom.create({
        parent,
        cssClassName: `content content-${item.type || 'default'}`,
    })

    switch (item.type) {
        case 'titleOnly':
            dom.create({tagName: 'h2', content: item.title, parent: container})
            break;

        case 'textImageLeft':
        case 'textImageRight': {
            const row = dom.create({parent: container, cssClassName: 'content-row ' + item.type})
            const text = dom.create({cssClassName: 'content-text'})
            dom.create({tagName: 'h2', content: item.title, parent: text})
            dom.create({parent: text, cssClassName: 'content-md', content: renderMD(item.content)})
            const media = dom.create({cssClassName: 'content-media'})
            renderImages({parent: media, images: item.images})
            // Left: Text dann Bild – Right: Bild dann Text
            if (item.type === 'textImageRight') {
                row.append(media, text);
            } else {
                row.append(text, media);
            }
            break;
        }

        case 'textImageBottom': {
            dom.create({tagName: 'h2', content: item.title, parent: container})
            dom.create({parent: container, cssClassName: 'content-md', content: renderMD(item.content)})
            renderImages({parent: container, images: item.images})
            break;
        }

        case 'gallery':
        case 'slideshow': {
            // Erstmal as-is: alle Bilder untereinander / im Grid
            if (item.title) dom.create({tagName: 'h2', content: item.title, parent: container})
            if (item.content) dom.create({parent: container, cssClassName: 'content-md', content: renderMD(item.content)})
            renderImages({parent: container, images: item.images})
            break;
        }

        case 'contactForm':
            dom.create({tagName: 'p', content: item.title || 'Kontaktformular', parent: container})
            break;

        case 'textOnly':
        default:
            if (item.title) dom.create({tagName: 'h2', content: item.title, parent: container})
            if (item.content) dom.create({parent: container, cssClassName: 'content-md', content: renderMD(item.content)})
            if (item.images && item.images.length) renderImages({parent: container, images: item.images})
            break;
    }

    // Links
    if (item.links && item.links.length) {
        const ul = dom.create({tagName: 'ul', parent: container, cssClassName: 'content-links'})
        item.links.forEach(link => {
            const li = dom.create({tagName: 'li', parent: ul})
            dom.create({
                tagName: 'a',
                href: link.url,
                target: link.target || '_self',
                content: link.legend || link.url,
                parent: li,
            })
        })
    }

    return container;
}

export default Content;
