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

    const validate = () => {
        let valid = true;

        if (!inpTitle.get()) {
            valid = false;
        }
        if (inpImage.getFiles().length === 0) {
            valid = false;
        }
        console.log(valid, !inpTitle.get(), inpImage.getFiles().length === 0);

        if (valid) {
            elButton.removeAttribute('disabled');
        } else {
            elButton.setAttribute('disabled', true);

        }
    }

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
        onInput: () => {
            validate();
        }
    })

    let inpDescription = CompInput({
        parent: containerUpload,
        data: media,
        key: 'description',
        legend: lang.getPhrase('description'),
        isInForm: true,
        multiline: true
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
        toLowerCase: true,
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
                console.log(media);

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
                        validate();
                    }
                )

            }
        }
    })
    elButton.setAttribute('disabled', true);

}

const overview = () => {
    ajax.loadMediaOverview().then(res => {

        res = Object.values(res);
        res.sort((a, b) => b.chDate - a.chDate);

        containerOverview = dom.create({
            cssClassName: 'column column-right',
            parent: elements.main,
        })

        const inputFilter = CompInput({
            parent: containerOverview,
            legend: lang.getPhrase('filter'),

            onInput(value) {
                // console.log('Input', value, allImages);
                allImages.forEach(item => {
                    let hide = true;
                    if (item.image.title.toLowerCase().includes(value.toLowerCase())) {
                        hide = false;
                    }
                    if (item.image.description.toLowerCase().includes(value.toLowerCase())) {
                        hide = false;
                    }
                    hide
                        ? item.elImage.classList.add('hidden')
                        : item.elImage.classList.remove('hidden');

                })
            }
        })

        const colsNarrow = [
            dom.create({
                cssClassName: 'colNarrow',
                parent: containerOverview,
            }),
            dom.create({
                cssClassName: 'colNarrow',
                parent: containerOverview,
            }),
            dom.create({
                cssClassName: 'colNarrow',
                parent: containerOverview,
            }),
        ];

        let slot = 0;
        let allImages = res.map((image, index) => {
            let elImage = ImageInOverview({
                image,
                parent: colsNarrow[slot],
                onDeleted: () => {
                    containerOverview.remove();
                    overview();
                }
            });
            slot = (slot + 1) % 3;

            return {
                image,
                elImage,
            }
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

    elements.allTopNavs['media']?.highlight()

}

export default viewMedia;