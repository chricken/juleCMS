'use strict';

import dom from "../../dom.js";
import lang from "../../lang.js";
import ajax from "../../ajax.js";

import CompInput from "../Input/Input.js";
import CompInputFile from "../InputFile/InputFile.js";
import CompSelect from "../Select/Select.js";

// Wiederverwendbarer Upload-Bereich – identisch mit der linken Spalte im Media-View.
// onUploaded(res) wird nach erfolgreichem Upload mit dem Server-Response aufgerufen
// (res.payload.id enthält die neue Bild-ID).
const UploadMedia = ({
                         parent = null,
                         cssClassName = 'upload-media',
                         onUploaded = () => {
                         },
                     } = {}) => {

    let media = new FormData();
    media.set('title', '');
    media.set('description', '');
    media.set('altName', '');
    media.set('tags', '');
    media.set('watermark', '');

    const containerUpload = dom.create({
        cssClassName,
        parent,
    })

    dom.create({
        tagName: 'h1',
        content: lang.getPhrase('uploadMedia'),
        parent: containerUpload,
    })

    let inpTitle = CompInput({
        parent: containerUpload,
        value: media.get("title"),
        legend: lang.getPhrase('title'),
        onInput: (value) => {
            media.set('title', value);
            validate();
        }
    })

    let inpDescription = CompInput({
        parent: containerUpload,
        value: media.get("description"),
        legend: lang.getPhrase('description'),
        multiline: true,
        onInput: (value) => {
            media.set('description', value);
            validate();
        }
    })

    let inpAltName = CompInput({
        parent: containerUpload,
        value: media.get("altName"),
        legend: lang.getPhrase('alternativeName'),
        onInput: (value) => {
            media.set('altName', value);
            validate();
        }
    })

    let placeholderWatermark = dom.create({
        parent: containerUpload,
    })

    ajax.loadWatermarkOverview().then(res => {
        const payload = Array.isArray(res) ? res : Object.values(res);

        CompSelect({
            parent: placeholderWatermark,
            legend: lang.getPhrase('watermark'),
            options: [
                {
                    value: 0,
                    label: lang.getPhrase('noWatermark')
                },
                ...payload.map(watermark => {
                    return {
                        value: watermark.id,
                        label: watermark.title
                    }
                })],
            value: media.get('watermark'),
            onSelected: (value) => {
                media.set('watermark', value);
                validate();
            }
        })
    })

    let inpTags = CompInput({
        parent: containerUpload,
        value: media.get("tags"),
        toLowerCase: true,
        legend: `${lang.getPhrase('tags')}`,
        onInput: (value) => {
            media.set('tags', value);
            validate();
        }
    })

    let inpImage = CompInputFile({
        parent: containerUpload,
        legend: lang.getPhrase('image'),
        key: 'image',
        formData: media,
        onChange: () => {
            validate();
        },
    })

    let elButton = dom.create({
        tagName: 'button',
        content: 'Upload',
        parent: containerUpload,
        listeners: {
            click(evt) {
                evt.stopPropagation();
                ajax.saveMedia(media).then(
                    res => {
                        inpImage.clear();
                        inpTitle.clear();
                        inpDescription.clear();
                        inpAltName.clear();
                        inpTags.clear();
                        inpTitle.focus();
                        onUploaded(res);
                        validate();
                    }
                )
            }
        }
    })
    elButton.setAttribute('disabled', true);

    const validate = () => {
        let valid = true;

        if (!inpTitle.get()) {
            valid = false;
        }
        if (inpImage.getFiles().length === 0) {
            valid = false;
        }

        if (valid) {
            elButton.removeAttribute('disabled');
        } else {
            elButton.setAttribute('disabled', true);
        }
    }

    let path = new URL(import.meta.url).pathname;
    path = `${path.substring(0, path.lastIndexOf('/') + 1)}UploadMedia.css`;

    dom.create({
        tagName: 'link',
        attr: {
            href: path,
            rel: 'stylesheet',
        },
        parent: containerUpload
    })

    return containerUpload;
}

export default UploadMedia;
