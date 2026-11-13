'use strict';

import elements from "../../elements.js";
import dom from "../../dom.js";
import compInput from '../Input/Input.js';
import CompCheckbox from '../Checkbox/Checkbox.js';
import ajax from "../../ajax.js";
import CompContent from "../Content/Content.js";
import CompAddContent from "../AddContent/AddContent.js";
import ModalAddImage from "../../modal/AddImage/AddImage.js";
import ModalUploadImages from "../../modal/UploadImages/UploadImages.js";

import lang from "../../lang.js";
import helpers, {collapse} from "../../helpers.js";


const Base = ({
                  data = {},
                  parent = null
              }) => {


    const saveDebounced = helpers.debouncer(ajax.savePage, 1000);

    const container = dom.create({
        cssClassName: 'base container collapsable transit',
        parent,
        styles: {
            height: '50px',
        }
    })

    dom.create({
        parent: container,
        cssClassName: 'border transit',
    })

    const containerInner = dom.create({
        cssClassName: 'containerInner transit',
        parent: container,
    })

    dom.create({
        content: '⯈',
        cssClassName: 'indicatorOpen transit',
        parent: containerInner,
        listeners: {
            click(evt) {
                evt.stopPropagation();
                collapse(container, inner);
            }
        }
    })

    // Header
    dom.create({
        parent: containerInner,
        content: lang.getPhrase('base'),
        tagName: 'h3',
        cssClassName: 'transit',
        listeners: {
            click(evt) {
                evt.stopPropagation();
                // container.classList.toggle('open');
                collapse(container, inner);
            }
        }
    })

    const inner = dom.create({
        parent: containerInner,
        cssClassName: 'inner',
    })

    dom.create({
        parent: inner,
        content: `ID: ${data.id}`,
        cssClassName: 'info',
    })

    compInput({
        parent: inner,
        legend: lang.getPhrase('slugline'),
        value: data.slugline,
        onInput(value) {
            console.log('slugline', value);
            data.slugline = value;
            saveDebounced(data);
        }
    })

    dom.create({
        parent: inner,
        content: `Created: ${new Date(data.crDate).toLocaleDateString()}`,
        cssClassName: 'info',

    })
    dom.create({
        parent: inner,
        content: `Last Changed: ${new Date(data.chDate).toLocaleDateString()}`,
        cssClassName: 'info',
    })

    // ===== Sichtbarkeit =====
    CompCheckbox({
        parent: inner,
        legend: lang.getPhrase('pageHidden'),
        value: data.visible === false,
        onChanged: (val) => { data.visible = !val; saveDebounced(data); }
    })

    CompCheckbox({
        parent: inner,
        legend: lang.getPhrase('pageInMenu'),
        value: data.menuVisible !== false,
        onChanged: (val) => { data.menuVisible = val; saveDebounced(data); }
    })

    // ===== Vorschaubild (ein einzelnes Bild pro Seite) =====
    const previewContainer = dom.create({
        parent: inner,
        cssClassName: 'preview-image',
    })

    const renderPreview = () => {
        previewContainer.innerHTML = '';

        dom.create({
            parent: previewContainer,
            tagName: 'h4',
            content: lang.getPhrase('previewImage'),
        })

        const setPreview = (id) => {
            data.previewImage = id;
            saveDebounced(data);
            renderPreview();
        }

        const btnSelect = () => dom.create({
            parent: previewContainer,
            tagName: 'button',
            content: lang.getPhrase(data.previewImage ? 'changeImage' : 'selectImage'),
            cssClassName: 'button button-small',
            listeners: {
                click: () => {
                    ModalAddImage({onSelected: setPreview})
                }
            }
        })

        const btnUpload = () => dom.create({
            parent: previewContainer,
            tagName: 'button',
            content: lang.getPhrase('uploadImages'),
            cssClassName: 'button button-small',
            listeners: {
                click: () => {
                    ModalUploadImages({
                        onUploaded(ids) {
                            if (ids && ids.length) setPreview(ids[0]);
                        }
                    })
                }
            }
        })

        if (data.previewImage) {
            ajax.loadImageMetaData(data.previewImage).then(
                payload => {
                    let resized = (payload.resized || []).filter(item => item.width >= 150);
                    resized.sort((a, b) => a.width - b.width);
                    const filename = resized.length ? resized[0].filename : payload.filename;

                    dom.create({
                        parent: previewContainer,
                        tagName: 'img',
                        src: `/api/getImg/media/${filename}`,
                        attr: {loading: 'lazy', decoding: 'async'},
                        cssClassName: 'preview-image-thumb',
                    })
                }
            )

            btnSelect();
            btnUpload();

            dom.create({
                parent: previewContainer,
                tagName: 'button',
                content: lang.getPhrase('delete'),
                cssClassName: 'button button-small',
                listeners: {
                    click: () => setPreview('')
                }
            })
        } else {
            btnSelect();
            btnUpload();
        }
    }

    renderPreview();

}



export default Base;