'use strict';

import elements from "../elements.js";
import dom from "../dom.js";
import data from "../data.js";
import lang from "../lang.js";
import CompInput from "../components/Input/Input.js";
import CompInputFile from "../components/InputFile/InputFile.js";
import CompImageInOverview from "../components/ImageInOverview/ImageInOverview.js";
import CompBtnSort from "../components/BtnSort/BtnSort.js";
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

    let payload = [];

    if (containerOverview) containerOverview.remove();

    containerOverview = dom.create({
        cssClassName: 'column column-right',
        parent: elements.main,
    })

    // Filter
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

    // Sortierung
    const containerSort = dom.create({
        tagName: 'div',
        cssClassName: 'container-sort',
        parent: containerOverview,
    })

    CompBtnSort({
        parent: containerSort,
        legend: 'title',
        onSort(asc) {
            payload.sort((a, b) => {
                if (asc) {
                    return (a.title.toLowerCase() < b.title.toLowerCase()) ? 1 : -1;
                } else {
                    return (a.title.toLowerCase() < b.title.toLowerCase()) ? -1 : 1;
                }
            })
            render()
        }
    })

    CompBtnSort({
        parent: containerSort,
        legend: 'changedAt',
        onSort(asc) {
            payload.sort((a, b) => {
                if (asc) {
                    return (a.chDate < b.chDate) ? 1 : -1;
                } else {
                    return (a.chDate < b.chDate) ? -1 : 1;
                }
            })
            render()
        }
    })

    const containerContent = dom.create({
        tagName: 'div',
        parent: containerOverview,
    })

    const render = () => {
        containerContent.innerHTML = '';

        const colsNarrow = [
            dom.create({
                cssClassName: 'colNarrow',
                parent: containerContent,
            }),
            dom.create({
                cssClassName: 'colNarrow',
                parent: containerContent,
            }),
            dom.create({
                cssClassName: 'colNarrow',
                parent: containerContent,
            }),
        ];

        let slot = 0;
        let allImages = payload.map((image, index) => {
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
    }

    ajax.loadMediaOverview().then(res => {

        payload = Object.values(res);
        payload.sort((a, b) => b.chDate - a.chDate);
        return render();

    })
}

const viewMedia = () => {

    elements.main.innerHTML = '';
    selectAndUpload();
    overview();

    elements.allTopNavs['media']?.highlight()

}

export default viewMedia;