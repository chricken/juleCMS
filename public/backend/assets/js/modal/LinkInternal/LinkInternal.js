import Modal from '../modal.js';
import dom from "../../dom.js";
import lang from "../../lang.js";
import CompInput from "../../components/Input/Input.js";
import CompCheckbox from "../../components/Checkbox/Checkbox.js";
import CompInputFile from "../../components/InputFile/InputFile.js";
import CompRange from "../../components/Range/Range.js";
import CompSelect from "../../components/Select/Select.js";
import ajax from "../../ajax.js";
import data from "../../data.js";

const ModalLinkInternal = ({
                               legend = '',
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
                    content: `- ${page.title} (id: ${page.id})`,
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
            })


            console.log('structured', structured);

            pages.forEach(page => {
                if (page.children) {
                    page.children.forEach(child => {
                        structured[page.id].append(structured[child])
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