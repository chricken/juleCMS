import Modal from '../modal.js';
import dom from "../../dom.js";
import lang from "../../lang.js";

import CompImage from "./Image.js";

const AddImage = ({
                      onSelected = () => {
                      }
                  } = {}) => {
    // Modalfenster anlegen
    const elModal = Modal();

    // Base-Infos
    const container = dom.create({
        tagName: 'div',
        parent: elModal,
        className: ''
    });

    dom.create({
        tagName: 'h2',
        content: lang.getPhrase('addImage'),
        parent: container,
    });

    fetch('/api/loadMediaOverview').then(
        res => res.json()
    ).then(
        res => {
            Object.entries(res).forEach(([key, value]) => {
                CompImage({
                    parent: container,
                    img: value,
                    onSelected(value) {
                        onSelected(value);
                        elModal.closeModal();
                    },

                })
            })
        }
    )

    // Dateiname der JS-Datei durch den Namen der CSS-Datei ersetzen
    let localURL = new URL(import.meta.url).pathname;
    let indexLastSlash = localURL.lastIndexOf('/');
    localURL = localURL.substring(0, indexLastSlash + 1);
    localURL += 'AddImage.css';

    dom.create({
        tagName: 'link',
        attr: {
            rel: 'stylesheet',
            href: localURL,
        },
        parent: elModal,

    })

    return elModal;
};

export default AddImage;