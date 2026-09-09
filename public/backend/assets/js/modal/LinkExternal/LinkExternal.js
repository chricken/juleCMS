import Modal from '../modal.js';
import dom from "../../dom.js";
import lang from "../../lang.js";
import CompInput from "../../components/Input/Input.js";

const ModalLinkExternal = ({
                               url = '',
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
        content: lang.getPhrase('externalLink'),
        parent: container,
    });

    dom.create({
        parent: container,
        tagName: 'p',
        cssClassName: 'description',
        content: lang.getPhrase('externalLinkDescription')
    })

    CompInput({
        parent: container,
        label: lang.getPhrase('url'),
        value: url,
        legend: lang.getPhrase('url'),
        onInput: (value) => {

            url = value;
            // console.log('input', value, url);
        }
    })

    dom.create({
        tagName: 'button',
        content: lang.getPhrase('save'),
        parent: container,
        listeners: {
            click() {
                onSelected(url);
                elModal.closeModal();
            }
        },
    })

    // Dateiname der JS-Datei durch den Namen der CSS-Datei ersetzen
    let localURL = new URL(import.meta.url).pathname;
    let indexLastSlash = localURL.lastIndexOf('/');
    localURL = localURL.substring(0, indexLastSlash + 1);
    localURL += 'LinkExternal.css';

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

export default ModalLinkExternal;