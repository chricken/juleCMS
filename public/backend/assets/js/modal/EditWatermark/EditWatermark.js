import Modal from '../modal.js';
import dom from "../../dom.js";
import lang from "../../lang.js";
import CompInput from "../../components/Input/Input.js";
import CompCheckbox from "../../components/Checkbox/Checkbox.js";
import CompInputFile from "../../components/InputFile/InputFile.js";
import CompRange from "../../components/Range/Range.js";
import CompSelect from "../../components/Select/Select.js";
import ajax from "../../ajax.js";

const ModalEditWatermark = ({
                                image = null,
                                legend = '',
                                onSaved = () => {
                                }
                            } = {}) => {
    // Modalfenster anlegen
    const elModal = Modal();

    let watermark = new FormData();

    watermark.set('title', image.title);
    watermark.set('description', image.description);
    watermark.set('size', image.size);
    watermark.set('position', image.position);
    watermark.set('tiling', image.tiling);
    watermark.set('crDate', image.crDate);
    watermark.set('chDate', Date.now());
    watermark.set('id', image.id);

    console.log('image', image, watermark);

    const validate = () => {
        let valid = true;

        if (!inpTitle.get()) {
            valid = false;
        }

        if (valid) {
            elButton.removeAttribute('disabled');
        } else {
            elButton.setAttribute('disabled', true);
        }
    }

    const container = dom.create({
        parent: elModal,
        cssClassName: 'modal-edit-image',
    })

    // Eingaben
    let inpTitle = CompInput({
        parent: container,
        value: watermark.get("title"),
        legend: lang.getPhrase('title'),
        onInput: (value) => {
            watermark.set('title', value);
            validate();
        }
    })

    let inpDescription = CompInput({
        parent: container,
        value: watermark.get("description").replaceAll('\r\n', '<br>').replaceAll('\n', '<br>'),
        legend: lang.getPhrase('description'),
        multiline: true,
        onInput: (value) => {
            watermark.set('description', value);
            validate();
        }
    })

    let inpTiling = CompCheckbox({
        parent: container,
        value: watermark.get("tiling") === 'true',
        legend: lang.getPhrase('tiling'),
        onChanged: (value) => {
            console.log('tiling', value);

            watermark.set('tiling', value);
            validate();
        }
    })

    let inpSize = CompRange({
        parent: container,
        value: +watermark.get("size"),
        legend: lang.getPhrase('size'),
        onInput: (value) => {
            watermark.set('size', value);
        }
    })

    let inpPosition = CompSelect({
        parent: container,
        legend: lang.getPhrase('position'),
        value: watermark.get("position"),
        options: [
            {value: 'topLeft', label: lang.getPhrase('topLeft')},
            {value: 'topRight', label: lang.getPhrase('topRight')},
            {value: 'bottomLeft', label: lang.getPhrase('bottomLeft')},
            {value: 'bottomRight', label: lang.getPhrase('bottomRight')},
            {value: 'centerCenter', label: lang.getPhrase('centerCenter')},
        ],
        onSelected: (value) => {
            console.log('position', value);

            watermark.set('position', value);
        }
    })

    let inpImage = CompInputFile({
        parent: container,
        legend: lang.getPhrase('image'),
        key: 'image',
        formData: watermark,
        // multiple: true,
        onChange: () => {
            validate();
        },
    })

    // Base-Infos
    dom.create({
        tagName: 'p',
        content: `${lang.getPhrase('changedAt')} : ${new Date(image.chDate).toLocaleString()}`,
        cssClassName: 'chDate smallInfo',
        parent: container,
    })

    let elButton = dom.create({
        tagName: 'button',
        content: lang.getPhrase('saveChanges'),
        parent: container,
        listeners: {
            click(evt) {
                evt.stopPropagation();
                console.log(watermark);

                /*
                ajax.updateMedia(watermark).then(
                    res => {
                        console.log(res);
                    }
                ).then(
                    () => elModal.closeModal()
                ).then(
                    () => onSaved()
                )
                */
            }
        }
    })
    elButton.setAttribute('disabled', true);

    // Bild-anzeigen
    const elImage = dom.create({
        parent: container,
        cssClassName: 'modal-edit-image__image',
        tagName: 'img',
        src: `/api/getImg/watermarks/${image.filename}`,
    })

    // Dateiname der JS-Datei durch den Namen der CSS-Datei ersetzen
    let localURL = new URL(import.meta.url).pathname;
    let indexLastSlash = localURL.lastIndexOf('/');
    localURL = localURL.substring(0, indexLastSlash + 1);
    localURL += 'EditWatermark.css';

    dom.create({
        tagName: 'link',
        attr: {
            rel: 'stylesheet',
            href: localURL,
        },
        parent: elModal,

    })

    validate();
    return elModal;
};

export default ModalEditWatermark;