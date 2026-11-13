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
    const multiSelected = new Set(); // ids per STRG-Klick

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

    // ===== Confirm-Bar: fixed unten mittig, erscheint bei Mehrfachauswahl =====
    const confirmBar = dom.create({
        parent: elModal,
        cssClassName: 'add-image-confirm-bar',
        styles: {display: 'none'},
    })
    const confirmBtn = dom.create({
        tagName: 'button',
        parent: confirmBar,
        cssClassName: 'button add-image-confirm-btn',
        content: lang.getPhrase('confirmSelection'),
        listeners: {
            click(evt) {
                evt.stopPropagation();
                const ids = [...multiSelected];
                multiSelected.clear();
                ids.forEach(id => onSelected(id));
                elModal.closeModal();
            }
        }
    })
    const updateConfirmBar = () => {
        confirmBar.style.display = multiSelected.size ? '' : 'none';
        confirmBtn.textContent = lang.getPhrase('confirmSelection') + ' (' + multiSelected.size + ')';
    }

    ajax.loadMediaOverview().then(
        res => {
            allImages = Object.values(res);
            allImages.sort((a, b) => (b.chDate || 0) - (a.chDate || 0));

            allImages.forEach(img => {
                imageElements[img.id] = CompImage({
                    parent: imageContainer,
                    img: img,
                    onSelected(value, evt) {
                        if (evt && (evt.ctrlKey || evt.metaKey)) {
                            evt.preventDefault();
                            evt.stopPropagation();
                            if (multiSelected.has(value)) multiSelected.delete(value);
                            else multiSelected.add(value);
                            imageElements[value].classList.toggle('selected', multiSelected.has(value));
                            updateConfirmBar();
                            return;
                        }
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
