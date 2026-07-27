import Modal from '../modal.js';
import dom from "../../dom.js";

const ModalEditImage = ({
                            image = null,
                            legend = ''
                        } = {}) => {
    const elModal = Modal({
        legend,
    });

    const container = dom.create({
        parent: elModal,
        cssClassName: 'modal-edit-image',
    })

    const elImage = dom.create({
        parent: container,
        cssClassName: 'modal-edit-image__image',
        tagName: 'img',
        src: `/api/getImg/${image.filename}`,
    })

    dom.create({
        parent: container,
        content: image.title,
    })


    // Dateiname der JS-Datei durch den Namen der CSS-Datei ersetzen
    let localURL = new URL(import.meta.url).pathname;
    let indexLastSlash = localURL.lastIndexOf('/');
    localURL = localURL.substring(0, indexLastSlash + 1);
    localURL += 'EditImage.css';

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

export default ModalEditImage;