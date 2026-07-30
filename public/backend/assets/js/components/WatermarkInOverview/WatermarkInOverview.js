'use strict';

import dom from "../../dom.js";
import elements from "../../elements.js";
import lang from "../../lang.js";
import ajax from "../../ajax.js";

import CompTag from "../Tag/Tag.js";
import Modal from "../../modal/modal.js";
// import ModalEditImage from '../../modal/EditImage/EditImage.js';
import ModalEditWatermark from '../../modal/EditWatermark/EditWatermark.js';

const WatermarkInOverview = ({
                             image = null,
                             parent = null,
                             onDeleted = () => {
                             },
                             onEdited = () => {
                             }
                         }) => {
    const container = dom.create({
        parent,
        cssClassName: 'card card-image transit',
    })

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
    // console.log('image', image);

    // kleinstes Bild finden, das größer oder gleich 260px ist
    let min = Math.min(...image.resized
        .map(el => el.width)
        .filter(el => el >= 260))

    let filename = image.resized.length
        ? image.resized.find(el => el.width === min).filename
        : image.filename;

    let elTiled = dom.create({
        parent: container,
        cssClassName: 'info is-tiled visibleInOpen',
        content: image.tiling === 'true'
            ? lang.getPhrase('tiling')
            : lang.getPhrase('noTiling'),
    })

    let elPosition = dom.create({
        parent: container,
        cssClassName: 'info position visibleInOpen',
        content: `${lang.getPhrase('position')}: ${lang.getPhrase(image.position)}`,
    })

    let elSize = dom.create({
        parent: container,
        cssClassName: 'info size visibleInOpen',
        content: `${lang.getPhrase('size')}: ${lang.getPhrase(image.size)}%`,
    })

    let elImg = dom.create({
        tagName: 'img',
        parent: container,
        src: `/api/getImg/watermarks/${filename}`
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

                ModalEditWatermark({
                    legend: lang.getPhrase('edit'),
                    image,
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
                    console.log('delete Watermark', image);
                    ajax.deleteWatermark(image).then(
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
    path = `${path.substring(0, path.lastIndexOf('/') + 1)}WatermarkInOverview.css`;

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

export default WatermarkInOverview;