'use strict';

import elements from "../elements.js";
import dom from "../dom.js";
import data from "../data.js";
import lang from "../lang.js";
import ajax from "../ajax.js";

import ImageInOverview from "../components/ImageInOverview/ImageInOverview.js";
import ModalUploadImages from "../modal/UploadImages/UploadImages.js";

import CompInput from "../components/Input/Input.js";
import CompBtnSort from "../components/BtnSort/BtnSort.js";
import CompTag from "../components/Tag/Tag.js";

let containerOverview = null;

const uploadButton = () => {
    dom.create({
        tagName: 'button',
        content: lang.getPhrase('uploadMedia'),
        cssClassName: 'button button-small button-upload-media',
        parent: elements.main,
        listeners: {
            click() {
                ModalUploadImages({
                    onUploaded() {
                        if (containerOverview) containerOverview.remove();
                        overview();
                    }
                })
            }
        }
    })
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
        containerTags.innerHTML = '';
        allTags.toSorted(
            (a, b) => a.toLowerCase().localeCompare(b.toLowerCase())
        ).forEach(tag => {
            const elTag = CompTag({
                parent: containerTags,
                content: tag,
                isInteractive: true,
                onClick() {
                    if (activeTags.includes(tag)) {
                        activeTags = activeTags.filter(t => t !== tag);
                        elTag.el.classList.remove('active');
                    } else {
                        activeTags.push(tag);
                        elTag.el.classList.add('active');
                    }
                    filterImages(elFilter.get() || '');
                }
            })
        })
    }

    dom.create({
        tagName: 'hr',
        parent: containerOverview,
    })

    // Content
    const containerContent = dom.create({
        tagName: 'div',
        parent: containerOverview,
    })


    // ===== Drag & Drop Reihenfolge =====
    let dragMediaID = null;

    const moveMedia = (fromID, toID) => {
        const fromIndex = payload.findIndex(p => p.id === fromID);
        const toIndex = payload.findIndex(p => p.id === toID);
        if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;
        const [moved] = payload.splice(fromIndex, 1);
        payload.splice(toIndex, 0, moved);
        render();
        ajax.saveMediaOrder(payload.map(p => p.id)).then(
            res => { if (res.status !== 'success') console.warn('order save failed', res); }
        );
    }

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
                draggable: true,
                onDragStart: (id) => { dragMediaID = id; },
                onDropOn: (fromID, toID) => { moveMedia(fromID, toID); },
                onDragEnd: () => { dragMediaID = null; },
                onDeleted: () => {
                    containerOverview.remove();
                    overview();
                },
                onEdited: () => {
                    viewMedia();
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

        payload = Array.isArray(res) ? res : Object.values(res);
        return render();

    })
}

const viewMedia = () => {

    elements.main.innerHTML = '';
    uploadButton();
    overview();

    elements.allTopNavs['media']?.highlight()

}

export default viewMedia;