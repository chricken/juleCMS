'use strict';

import Modal from '../modal.js';
import dom from "../../dom.js";
import lang from "../../lang.js";
import ajax from "../../ajax.js";
import CompInput from "../../components/Input/Input.js";

// Modal zum Multi-Upload von Bildern aus dem Content-Editor.
// onUploaded(imageIDs) wird nach erfolgreichem Speichern mit den neuen IDs aufgerufen.
const UploadImages = ({
                          onUploaded = () => {
                          }
                      } = {}) => {

    const elModal = Modal();

    const container = dom.create({
        tagName: 'div',
        parent: elModal,
        cssClassName: 'upload-images-modal'
    });

    dom.create({
        tagName: 'h2',
        content: lang.getPhrase('uploadImages'),
        parent: container,
    })

    dom.create({
        tagName: 'p',
        cssClassName: 'settings-hint',
        content: lang.getPhrase('uploadImagesHint'),
        parent: container,
    })

    // ===== File-Input (multiple) =====
    const elFileInput = dom.create({
        tagName: 'input',
        parent: container,
        cssClassName: 'upload-images-fileinput',
        attr: {
            type: 'file',
            accept: 'image/*',
            multiple: true
        }
    })

    // ===== Karten =====
    const listContainer = dom.create({
        cssClassName: 'upload-images-list',
        parent: container,
    })

    const elStatus = dom.create({
        tagName: 'p',
        cssClassName: 'upload-images-status',
        parent: container,
    })

    let cards = []; // {file, title, description, altName, tags, el}

    const elSaveButton = dom.create({
        tagName: 'button',
        content: lang.getPhrase('saveUploads'),
        cssClassName: 'save-password-button upload-images-save',
        parent: container,
        attr: {disabled: true, type: 'button', tabindex: '-1'},
        listeners: {
            click() {
                if (cards.length === 0) return;
                if (cards.some(c => !c.title.trim())) return;
                elSaveButton.setAttribute('disabled', true);
                elStatus.innerText = lang.getPhrase('uploading');
                elStatus.className = 'upload-images-status';

                const ids = [];
                // sequentiell hochladen
                let chain = Promise.resolve();
                cards.forEach(card => {
                    chain = chain.then(() => {
                        const fd = new FormData();
                        fd.set('title', card.title.trim());
                        fd.set('description', card.description);
                        fd.set('altName', card.altName);
                        fd.set('tags', card.tags);
                        fd.set('watermark', '');
                        fd.set('image[0]', card.file);
                        return ajax.saveMedia(fd).then(res => {
                            if (res.status === 'success' && res.payload && res.payload.id) {
                                ids.push(res.payload.id);
                            }
                        });
                    });
                });
                chain.then(() => {
                    elStatus.innerText = lang.getPhrase('uploadsDone') + ' (' + ids.length + ')';
                    elStatus.className = 'upload-images-status success';
                    onUploaded(ids);
                    elModal.closeModal();
                }).catch(err => {
                    elStatus.innerText = lang.getPhrase('uploadError') + ' ' + err;
                    elStatus.className = 'upload-images-status error';
                    elSaveButton.removeAttribute('disabled');
                });
            }
        }
    })

    const validate = () => {
        const allTitled = cards.length > 0 && cards.every(c => c.title.trim().length > 0);
        if (allTitled) elSaveButton.removeAttribute('disabled');
        else elSaveButton.setAttribute('disabled', true);
    }

    // ===== Karte pro Datei =====
    const addCard = (file) => {
        const card = {
            file,
            title: file.name.replace(/\.[^.]+$/, ''), // Dateiname ohne Extension als Titel
            description: '',
            altName: '',
            tags: '',
            el: null
        };

        const el = dom.create({
            cssClassName: 'upload-image-card',
            parent: listContainer,
        })
        card.el = el;

        // Vorschau
        const elPreview = dom.create({
            cssClassName: 'upload-image-preview',
            parent: el,
        })
        const reader = new FileReader();
        reader.onload = () => {
            dom.create({
                tagName: 'img',
                src: reader.result,
                parent: elPreview,
            })
        }
        reader.readAsDataURL(file);

        // Datenfelder
        const elFields = dom.create({
            cssClassName: 'upload-image-fields',
            parent: el,
        })

        CompInput({
            parent: elFields,
            legend: lang.getPhrase('title'),
            value: card.title,
            onInput: (val) => { card.title = val; validate(); },
            onClear: () => { card.title = ''; validate(); }
        })

        CompInput({
            parent: elFields,
            legend: lang.getPhrase('description'),
            multiline: true,
            onInput: (val) => { card.description = val; }
        })

        CompInput({
            parent: elFields,
            legend: lang.getPhrase('alternativeName'),
            onInput: (val) => { card.altName = val; }
        })

        CompInput({
            parent: elFields,
            legend: lang.getPhrase('tags'),
            toLowerCase: true,
            onInput: (val) => { card.tags = val; }
        })

        // Entfernen-Button
        dom.create({
            tagName: 'button',
            content: lang.getPhrase('remove'),
            cssClassName: 'upload-image-remove',
            parent: el,
            attr: {type: 'button', tabindex: '-1'},
            listeners: {
                click(evt) {
                    evt.stopPropagation();
                    cards = cards.filter(c => c !== card);
                    el.remove();
                    validate();
                }
            }
        })

        cards.push(card);
        validate();
    }

    // ===== File-Input Change =====
    elFileInput.addEventListener('change', (evt) => {
        evt.stopPropagation();
        const files = Array.from(evt.target.files || []);
        files.forEach(addCard);
        elFileInput.value = ''; // damit gleiche Datei nochmal wählbar
    })

    // ===== CSS laden =====
    let localURL = new URL(import.meta.url).pathname;
    localURL = localURL.substring(0, localURL.lastIndexOf('/') + 1) + 'UploadImages.css';
    dom.create({
        tagName: 'link',
        attr: {rel: 'stylesheet', href: localURL},
        parent: elModal,
    })

    return elModal;
};

export default UploadImages;
