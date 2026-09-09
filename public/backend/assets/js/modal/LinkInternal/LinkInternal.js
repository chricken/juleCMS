import Modal from '../modal.js';
import dom from "../../dom.js";
import lang from "../../lang.js";
import ajax from "../../ajax.js";

const ModalLinkInternal = ({
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
        content: lang.getPhrase('internalLink'),
        parent: container,
    });

    dom.create({
        parent: container,
        tagName: 'p',
        cssClassName: 'description',
        content: lang.getPhrase('internalLinkDescription')
    })

    const containerLinkInternal = dom.create({
        tagName: 'div',
        parent: container,
    });

    ajax.loadJSON('/api/pages').then(
        pages => {
            // Struktur mit den Seiten und Unterseiten
            const structured = {}
            pages.forEach(page => {
                // DOM-Elements anlegen
                structured[page.id] = dom.create({
                    tagName: 'div',
                    cssClassName:'link-internal-structured-page',
                    parent: containerLinkInternal,
                    listeners: {
                        click(evt) {
                            evt.stopPropagation();
                            onSelected(page.id);
                            elModal.closeModal();
                        }
                    }
                })

                dom.create({
                    cssClassName:'legend',
                    content:`- ${page.title} (id: ${page.id})`,
                    parent: structured[page.id],
                })

                dom.create({
                    cssClassName: 'children',
                    parent: structured[page.id]
                })

            })

            pages.forEach(page => {
                if (page.children) {
                    page.children.forEach(child => {
                        structured[page.id]
                            .querySelector('.children')
                            .append(structured[child])
                    })
                }
            })

        }
    )
    /*
    let elButton = dom.create({
        tagName: 'button',
        content: lang.getPhrase('saveChanges'),
        parent: container,
        listeners: {
            click(evt) {
                evt.stopPropagation();

            }
        }
    })
    */

    // Dateiname der JS-Datei durch den Namen der CSS-Datei ersetzen
    let localURL = new URL(import.meta.url).pathname;
    let indexLastSlash = localURL.lastIndexOf('/');
    localURL = localURL.substring(0, indexLastSlash + 1);
    localURL += 'LinkInternal.css';

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

export default ModalLinkInternal;