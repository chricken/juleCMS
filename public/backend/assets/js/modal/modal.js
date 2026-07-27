'use strict';

import elements from "../elements.js";
import dom from "../dom.js";
import TopNav from "../views/TopNav.js";

const Modal = ({
                   legend = '',
                   onClose = () => {
                   },
               } = {}) => {

    const elBG = dom.create({
        cssClassName: 'modalBG transit',
        parent: document.body,
        listeners: {
            click(evt) {
                evt.stopPropagation();
                elBG.remove();
                onClose();
            }
        }
    })

    elements.modalBG && elements.modalBG.remove();
    elements.modalBG = elBG;

    const elModal = dom.create({
        cssClassName: 'modal transit',
        parent: elBG,
    })

    const elInner = dom.create({
        parent: elModal,

    })

    elInner.closeModal = () => {
        elements.modalBG = null;
        elBG.remove();
        onClose();
    };

    dom.create({
        parent: elModal,
        cssClassName: 'btn btn-close transit',
        content: '╳',
        listeners: {
            click(evt) {
                evt.stopPropagation();
                elBG.remove();
                onClose();
            }
        }
    })

    dom.create({
        tagName: 'h2',
        parent: elInner,
        content: legend,
    })

    // Dateiname der JS-Datei durch den Namen der CSS-Datei ersetzen
    let localURL = new URL(import.meta.url).pathname;
    let indexLastSlash = localURL.lastIndexOf('/');
    localURL = localURL.substring(0, indexLastSlash + 1);
    localURL += 'modal.css';

    dom.create({
        tagName: 'link',
        attr: {
            rel: 'stylesheet',
            href: localURL,
        },
        parent: elModal,

    })

    return elInner;
};

export default Modal;