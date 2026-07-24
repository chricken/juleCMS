'use strict';

import elements from "../elements.js";
import dom from "../dom.js";
import data from "../data.js";
import lang from "../lang.js";
import CompInput from "../components/Input/Input.js";
// import CompInputForm from "../components/Input/Input.js";
import CompInputFile from "../components/InputFile/InputFile.js";
import CompImageInOverview from "../components/ImageInOverview/ImageInOverview.js";
import CompBtnSort from "../components/BtnSort/BtnSort.js";
import ajax from "../ajax.js";
import ImageInOverview from "../components/ImageInOverview/ImageInOverview.js";
import CompTag from "../components/Tag/Tag.js";

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
        value: media.altName,
        legend: lang.getPhrase('alternativeName'),
        onInput: (value) => {
            media.set('altName', value);
            validate();
        }
    })

    let inpTags = CompInput({
        parent: containerUpload,
        // Die Tags werden nicht als Array verarbeitet, da Array in einer Form kompliziert sind
        value: media.get("tags"),
        toLowerCase: true,
        legend: `${lang.getPhrase('tags')}`,
        valueIsArray: true,
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
    let allImages = [];
    let allTags = [];
    let activeTags = [];

    if (containerOverview) containerOverview.remove();

    containerOverview = dom.create({
        cssClassName: 'column column-right',
        parent: elements.main,
    })

    // Filter
    const filterImages = (value) => {
        allImages.forEach(item => {
            let hide = true;

            let hasFittingTag = item.image.tags.some(tag => {
                return activeTags.includes(tag)
            })

            if (
                activeTags.length === 0 ||
                (activeTags.length && hasFittingTag)) {

                if (item.image.title.toLowerCase().includes(value.toLowerCase())) {
                    hide = false;
                }

                if (item.image.description.toLowerCase().includes(value.toLowerCase())) {
                    hide = false;
                }

            }

            hide
                ? item.elImage.classList.add('hidden')
                : item.elImage.classList.remove('hidden');
        })
    }

    const elFilter = CompInput({
        parent: containerOverview,
        legend: lang.getPhrase('filter'),

        onInput(value) {
            filterImages(value);
        },
        onClear() {
            filterImages('');
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

    // Tags
    const containerTags = dom.create({
        tagName: 'div',
        cssClassName: 'filter-by-tags',
        parent: containerOverview,
    });

    const renderFilterByTags = () => {
        console.log('Input', allTags);

        allTags.forEach(tag => {


            const elTag = CompTag({
                parent: containerTags,
                content: tag,
                isInteractive: true,
                onClick(){
                    if (activeTags.includes(tag)) {
                        activeTags = activeTags.filter(t => t !== tag);
                        elTag.el.classList.remove('active');
                    } else {
                        activeTags.push(tag);
                        elTag.el.classList.add('active');
                    }
                    // console.log('activeTags', activeTags);

                    filterImages(elFilter.get() || '');
                }
            })
        })
    }

    // Content
    const containerContent = dom.create({
        tagName: 'div',
        parent: containerOverview,
    })

    const render = () => {
        allTags = [];
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
        allImages = payload.map((image, index) => {
            let elImage = ImageInOverview({
                image,
                parent: colsNarrow[slot],
                onDeleted: () => {
                    containerOverview.remove();
                    overview();
                }
            });
            slot = (slot + 1) % 3;

            // Tags erweitern
            allTags = new Set([...allTags, ...image.tags]);
            allTags = [...allTags];

            return {
                image,
                elImage,
            }
        })

        renderFilterByTags();

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