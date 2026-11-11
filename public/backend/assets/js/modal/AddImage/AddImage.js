'use strict';

import Modal from '../modal.js';
import dom from "../../dom.js";
import lang from "../../lang.js";
import ajax from "../../ajax.js";
import CompInput from "../../components/Input/Input.js";
import CompImage from "./Image.js";

const AddImage = ({
                      onSelected = () => {
                      }
                  } = {}) => {
    // Modalfenster anlegen
    const elModal = Modal();

    const container = dom.create({
        tagName: 'div',
        parent: elModal,
        cssClassName: 'add-image-modal'
    });

    dom.create({
        tagName: 'h2',
        content: lang.getPhrase('addImage'),
        parent: container,
    });

    // ===== Filter-Bereich =====
    const filterBar = dom.create({
        cssClassName: 'add-image-filter',
        parent: container,
    })

    let searchText = '';
    let selectedTags = new Set();
    let allImages = [];
    let imageElements = {}; // id -> element

    const applyFilter = () => {
        const q = searchText.trim().toLowerCase();
        Object.entries(imageElements).forEach(([id, el]) => {
            if (!el) return;
            const img = allImages.find(i => i.id === id);
            if (!img) { el.style.display = 'none'; return; }

            // Tag-Filter: Bild sichtbar wenn es mindestens einen gewählten Tag hat (oder keiner gewählt)
            const tagMatch = selectedTags.size === 0 || (img.tags || []).some(t => selectedTags.has(t));

            // Volltext: title, description, altName, tags
            const haystack = [img.title, img.description, img.altName, (img.tags || []).join(' ')]
                .filter(Boolean).join(' ').toLowerCase();
            const textMatch = !q || haystack.includes(q);

            el.style.display = (tagMatch && textMatch) ? '' : 'none';
        });
    }

    // Volltext-Filter
    CompInput({
        parent: filterBar,
        legend: lang.getPhrase('filter'),
        hasClearButton: true,
        onInput: (val) => { searchText = val; applyFilter(); },
        onClear: () => { searchText = ''; applyFilter(); }
    })

    // Tag-Auswahl
    const tagBar = dom.create({
        cssClassName: 'add-image-tags',
        parent: filterBar,
    })

    dom.create({
        tagName: 'span',
        cssClassName: 'add-image-tags-label',
        content: lang.getPhrase('tags') + ':',
        parent: tagBar,
    })

    const tagContainer = dom.create({
        cssClassName: 'add-image-tag-list',
        parent: tagBar,
    })

    const renderTags = () => {
        tagContainer.innerHTML = '';
        const allTags = [...new Set(allImages.flatMap(i => i.tags || []))].sort();
        allTags.forEach(tag => {
            dom.create({
                tagName: 'span',
                cssClassName: 'add-image-tag' + (selectedTags.has(tag) ? ' active' : ''),
                content: tag,
                parent: tagContainer,
                attr: {tabindex: '-1'},
                listeners: {
                    click(evt) {
                        evt.stopPropagation();
                        if (selectedTags.has(tag)) selectedTags.delete(tag);
                        else selectedTags.add(tag);
                        renderTags();
                        applyFilter();
                    }
                }
            })
        })
    }

    // ===== Bilder =====
    const imageContainer = dom.create({
        cssClassName: 'add-image-list',
        parent: container,
    })

    ajax.loadMediaOverview().then(
        res => {
            allImages = Object.values(res);
            allImages.sort((a, b) => (b.chDate || 0) - (a.chDate || 0));

            allImages.forEach(img => {
                imageElements[img.id] = CompImage({
                    parent: imageContainer,
                    img: img,
                    onSelected(value) {
                        onSelected(value);
                        elModal.closeModal();
                    },
                })
            })

            renderTags();
            applyFilter();
        }
    )

    // CSS laden
    let localURL = new URL(import.meta.url).pathname;
    localURL = localURL.substring(0, localURL.lastIndexOf('/') + 1) + 'AddImage.css';

    dom.create({
        tagName: 'link',
        attr: {rel: 'stylesheet', href: localURL},
        parent: elModal,
    })

    return elModal;
};

export default AddImage;
