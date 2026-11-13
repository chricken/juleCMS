'use strict';

import elements from "../elements.js";
import dom from "../dom.js";
import TopNav from "../views/TopNav.js";

const modalStack = [];

const Modal = ({
                   legend = '',
                   onClose = () => {
                   },
               } = {}) => {

    const elBG = dom.create({
        cssClassName: 'modalBG transit',
        parent: document.body,
        listeners: {
            mouseup(evt) {
                evt.stopPropagation();
            },
            mousedown(evt) {
                evt.stopPropagation();
                elBG.mouseDown = true;
            },
            click(evt) {
                evt.stopPropagation();
                if (elements.modalBG !== elBG) return; // nur oberstes Modal schließt
                if (elBG.mouseDown) elBG.remove();
                elBG.mouseDown = false;
                const idx = modalStack.indexOf(elBG);
                if (idx >= 0) modalStack.splice(idx, 1);
                elements.modalBG = modalStack.length ? modalStack[modalStack.length - 1] : null;
                onClose();
            }
        }
    })

    modalStack.push(elBG);
    elements.modalBG = elBG;

    const elModal = dom.create({
        cssClassName: 'modal transit',
        parent: elBG,
        listeners: {
            mousedown(evt) {
                evt.stopPropagation();
            },
            click(evt){
                evt.stopPropagation();
            }
        }
    })

    const elInner = dom.create({
        parent: elModal,

    })

    elInner.closeModal = () => {
        elBG.remove();
        const idx = modalStack.indexOf(elBG);
        if (idx >= 0) modalStack.splice(idx, 1);
        elements.modalBG = modalStack.length ? modalStack[modalStack.length - 1] : null;
        onClose();
    };

    dom.create({
        parent: elModal,
        cssClassName: 'btn btn-close transit',
        content: '╳',
        listeners: {
            click(evt) {
                evt.stopPropagation();
                if (elements.modalBG !== elBG) return;
                elBG.remove();
                const idx = modalStack.indexOf(elBG);
                if (idx >= 0) modalStack.splice(idx, 1);
                elements.modalBG = modalStack.length ? modalStack[modalStack.length - 1] : null;
                onClose();
            }
        }
    })

    dom.create({
        tagName: 'h4',
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