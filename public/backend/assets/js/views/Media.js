'use strict';

import elements from "../elements.js";
import dom from "../dom.js";
import data from "../data.js";
import lang from "../lang.js";
import CompInput from "../components/Input/Input.js";
import CompInputFile from "../components/InputFile/InputFile.js";
import ajax from "../ajax.js";

const viewMedia = () => {

    elements.main.innerHTML = '';

    // Der File-Input verlangt ein FormData-Objekt
    let media = new FormData();
    media.set('title', '');
    media.set('description', '');
    media.set('tags', '');


    const containerUpload = dom.create({
        cssClassName: 'column',
        parent: elements.main,
    })

    dom.create({
        tagName: 'h1',
        content: 'Upload Media',
        parent: containerUpload,
    })

// Title
    CompInput({
        parent: containerUpload,
        data: media,
        key: 'title',
        legend: lang.getPhrase('title'),
        isInForm: true,
    })

    CompInput({
        parent: containerUpload,
        data: media,
        key: 'description',
        legend: lang.getPhrase('description'),
        isInForm: true,
    })

    CompInput({
        parent: containerUpload,
        data: media,
        key: 'tags',
        // legend: `${lang.getPhrase('tags')} (${lang.getPhrase('commaSeparated')})`,
        legend: `${lang.getPhrase('tags')}`,
        valueIsArray: true,
        isInForm: true,
    })

    CompInputFile({
        parent: containerUpload,
        legend: lang.getPhrase('image'),
        key: 'image',
        formData: media,
        // multiple: true,
    })

    dom.create({
        tagName: 'button',
        content: 'Upload',
        parent: containerUpload,
        listeners: {
            click(evt) {
                evt.stopPropagation();
                console.log('Upload', media);
                ajax.saveMedia(media);
            }
        }
    })


}

export default viewMedia;