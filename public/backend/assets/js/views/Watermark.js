'use strict';

import elements from "../elements.js";
import dom from "../dom.js";
import data from "../data.js";
import CompInput from "../components/Input/Input.js";
import lang from "../lang.js";
import CompInputFile from "../components/InputFile/InputFile.js";
import CompSelect from "../components/Select/Select.js";
import CompCheckbox from "../components/Checkbox/Checkbox.js";
import CompRange from "../components/Range/Range.js";
import ajax from "../ajax.js";

let containerOverview = null;

const selectAndUpload = () => {

    // Muss auch einen oder mehrere Watermarks wählen können

    // Der File-Input verlangt ein FormData-Objekt
    let watermark = new FormData();
    watermark.set('title', '');
    watermark.set('description', '');
    watermark.set('position', 'top-left');
    watermark.set('tiling', 'false');
    watermark.set('size', '20');

    const validate = () => {
        let valid = true;

        if (!inpTitle.get()) {
            valid = false;
        }
        if (inpImage.getFiles().length === 0) {
            valid = false;
        }
        // console.log(valid, !inpTitle.get(), inpImage.getFiles().length === 0);

        if (valid) {
            elButton.removeAttribute('disabled');
        } else {
            elButton.setAttribute('disabled', true);
        }
    }

    const containerUpload = dom.create({
        cssClassName: 'column column-left',
        parent: elements.main,
    })

    dom.create({
        tagName: 'h1',
        content: lang.getPhrase('uploadWatermark'),
        parent: containerUpload,
    })

    // Title
    let inpTitle = CompInput({
        parent: containerUpload,
        value: watermark.get("title"),
        legend: lang.getPhrase('title'),
        onInput: (value) => {
            watermark.set('title', value);
            validate();
        }
    })

    let inpDescription = CompInput({
        parent: containerUpload,
        value: watermark.get("description"),
        legend: lang.getPhrase('description'),
        multiline: true,
        onInput: (value) => {
            watermark.set('description', value);
            validate();
        }
    })

    // Position
    const selPosition = CompSelect({
        parent: containerUpload,
        legend: lang.getPhrase('position'),
        value: watermark.get("position"),
        options: [
            {value: 'top-left', label: lang.getPhrase('topLeft')},
            {value: 'top-right', label: lang.getPhrase('topRight')},
            {value: 'bottom-left', label: lang.getPhrase('bottomLeft')},
            {value: 'bottom-right', label: lang.getPhrase('bottomRight')},
            {value: 'center-center', label: lang.getPhrase('centerCenter')},
        ],
        onSelected: (value) => {
            watermark.set('position', value);
        }
    })

    // Tiling
    const cbTiling = CompCheckbox({
        parent: containerUpload,
        legend: lang.getPhrase('tiling'),
        checked: watermark.get("tiling") === 'true',
        onChanged: (value) => {
            watermark.set('tiling', value);
        }
    })

    // Size
    const rngSize = CompRange({
        legend: lang.getPhrase('size'),
        parent: containerUpload,
        value: watermark.get("size"),
        onInput: (value) => {
            watermark.set('size', value);
        }
    })

    // Image
    let inpImage = CompInputFile({
        parent: containerUpload,
        legend: lang.getPhrase('image'),
        key: 'image',
        formData: watermark,
        // multiple: true,
        onChange: () => {
            validate();
        },
    })

    // Upload-Button
    let elButton = dom.create({
        tagName: 'button',
        content: 'Upload',
        parent: containerUpload,
        listeners: {
            click(evt) {
                evt.stopPropagation();
                console.log(watermark);

                ajax.saveWatermark(watermark).then(
                    res => {
                        inpImage.clear();
                        inpTitle.clear();
                        inpDescription.clear();
                        inpAltName.clear();
                        inpTags.clear();
                        inpTitle.focus();
                        // console.log('res', res);
                        containerOverview.remove();
                        overview();
                        validate();
                    }
                )

            }
        }
    })
    elButton.setAttribute('disabled', true);

}
const viewWatermark = () => {

    elements.main.innerHTML = '';

    selectAndUpload();

    elements.allTopNavs['watermark']?.highlight()
}

export default viewWatermark;