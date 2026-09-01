import Modal from '../modal.js';
import dom from "../../dom.js";
import lang from "../../lang.js";
import CompInput from "../../components/Input/Input.js";
import CompInputFile from "../../components/InputFile/InputFile.js";
import ajax from "../../ajax.js";
import CompSelect from "../../components/Select/Select.js";

const ModalEditImage = ({
                            image = null,
                            legend = '',
                            onSaved = () => {
                            }
                        } = {}) => {
    // Modalfenster anlegen
    const elModal = Modal();

    let media = new FormData();
    media.set('title', image.title);
    media.set('description', image.description);
    media.set('altName', image.altName);
    media.set('tags', image.tags.join(','));
    media.set('watermark', image.watermark);
    media.set('crDate', image.crDate);
    media.set('chDate', Date.now());
    media.set('id', image.id);

    console.log('image', image);

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
        value: media.get("title"),
        legend: lang.getPhrase('title'),
        onInput: (value) => {
            media.set('title', value);
            validate();
        }
    })

    let inpDescription = CompInput({
        parent: container,
        value: media.get("description").replaceAll('\r\n', '<br>').replaceAll('\n', '<br>'),
        legend: lang.getPhrase('description'),
        multiline: true,
        onInput: (value) => {
            media.set('description', value);
            validate();
        }
    })

    let inpAltName = CompInput({
        parent: container,
        value: media.altName,
        legend: lang.getPhrase('alternativeName'),
        onInput: (value) => {
            media.set('altName', value);
            validate();
        }
    })


    let placeholderWatermark = dom.create({
        // content: 'Placeholder for Watermarks',
        parent: container,
    })

    ajax.loadWatermarkOverview().then(res => {
        let payload = Object.values(res);
        payload.sort((a, b) => b.chDate - a.chDate);
        console.log('got watermark',media.get('watermark') );

        CompSelect({
            parent: placeholderWatermark,
            legend: lang.getPhrase('watermark'),
            options: [
                {
                    value: 0,
                    label: lang.getPhrase('noWatermark')
                },
                ...payload.map(watermark => {
                    return {
                        value: watermark.id,
                        label: watermark.title
                    }
                })],
            value: media.get('watermark'),
            onSelected: (value) => {
                media.set('watermark', value);
                console.log('media', media);
                validate();
            }
        })


    })

    let inpTags = CompInput({
        parent: container,
        // Die Tags werden nicht als Array verarbeitet, da Array in einer Form kompliziert sind
        value: media.get("tags").replaceAll(',', ', '),
        toLowerCase: true,
        legend: `${lang.getPhrase('tags')}`,
        onInput: (value) => {
            media.set('tags', value);
            validate();
        }
    })

    let inpImage = CompInputFile({
        parent: container,
        legend: lang.getPhrase('image'),
        key: 'image',
        formData: media,
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
                console.log(media);

                ajax.updateMedia(media).then(
                    res => {
                        console.log(res);
                    }
                ).then(
                    () => elModal.closeModal()
                ).then(
                    () => onSaved()
                )
            }
        }
    })
    elButton.setAttribute('disabled', true);

    // Bild-anzeigen
    const elImage = dom.create({
        parent: container,
        cssClassName: 'modal-edit-image__image',
        tagName: 'img',
        src: `/api/getImg/media/${image.filename}`,
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

    validate();
    return elModal;
};

export default ModalEditImage;