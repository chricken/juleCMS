'use strict';

import elements from "../elements.js";
import dom from "../dom.js";
import data from "../data.js";
import lang from "../lang.js";
import CompInput from "../components/Input/Input.js";
import CompInputFile from "../components/InputFile/InputFile.js";
import CompImageInOverview from "../components/ImageInOverview/ImageInOverview.js";
import ajax from "../ajax.js";
import ImageInOverview from "../components/ImageInOverview/ImageInOverview.js";

let containerOverview = null;

const selectAndUpload = () => {

    // Der File-Input verlangt ein FormData-Objekt
    let media = new FormData();
    media.set('title', '');
    media.set('description', '');
    media.set('altName', '');
    media.set('tags', '');


    const containerUpload = dom.create({
        cssClassName: 'column column-left',
        parent: elements.main,
    })

    dom.create({
        tagName: 'h1',
        content: 'Upload Media',
        parent: containerUpload,
    })

// Title
    let inpTitle = CompInput({
        parent: containerUpload,
        data: media,
        key: 'title',
        legend: lang.getPhrase('title'),
        isInForm: true,
    })

    let inpDescription = CompInput({
        parent: containerUpload,
        data: media,
        key: 'description',
        legend: lang.getPhrase('description'),
        isInForm: true,
    })

    let inpAltName = CompInput({
        parent: containerUpload,
        data: media,
        key: 'altName',
        legend: lang.getPhrase('alternativeName'),
        isInForm: true,
    })

    let inpTags = CompInput({
        parent: containerUpload,
        data: media,
        key: 'tags',
        // legend: `${lang.getPhrase('tags')} (${lang.getPhrase('commaSeparated')})`,
        legend: `${lang.getPhrase('tags')}`,
        valueIsArray: true,
        isInForm: true,
    })

    let inpImage = CompInputFile({
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
                // console.log('Upload', media);
                ajax.saveMedia(media).then(
                    res => {
                        inpImage.clear();
                        inpTitle.clear();
                        inpDescription.clear();
                        inpAltName.clear();
                        inpTags.clear();
                        inpTitle.focus();
                        // console.log('res', res);
                        containerOverview.remove();
                        overview();
                    }
                )
            }
        }
    })

}

const overview = () => {
    ajax.loadMediaOverview().then(res => {
        // console.log(res);
        containerOverview = dom.create({
            cssClassName: 'column column-right',
            parent: elements.main,
        })

        Object.values(res).forEach(image => {
            ImageInOverview({
                image,
                parent: containerOverview,
                onDeleted: () => {
                    containerOverview.remove();
                    overview();
                }
            });
        })
        return {
            clear() {
                containerOverview.innerHTML = '';
            }
        }
    })
}

const viewMedia = () => {

    elements.main.innerHTML = '';
    selectAndUpload();
    overview();

}

export default viewMedia;