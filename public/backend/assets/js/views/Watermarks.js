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
// import ImageInOverview from "../components/ImageInOverview/ImageInOverview.js";
import WatermarkInOverview from "../components/WatermarkInOverview/WatermarkInOverview.js";
import viewMedia from "./Media.js";

let containerOverview = null;


const overview = () => {

    let payload = [];
    let allImages = [];

    if (containerOverview) containerOverview.remove();

    containerOverview = dom.create({
        cssClassName: 'column column-right',
        parent: elements.main,
    })

    // Content
    const containerContent = dom.create({
        tagName: 'div',
        parent: containerOverview,
    })


    const render = () => {

        // console.log('loaded and render', payload);

        containerContent.innerHTML = '';

        const colsNarrow = [
            dom.create({
                cssClassName: 'colNarrow',
                parent: containerContent,
            }),
            dom.create({
                cssClassName: 'colNarrow',
                parent: containerContent,
            }),
            dom.create({
                cssClassName: 'colNarrow',
                parent: containerContent,
            }),
        ];

        let slot = 0;
        allImages = payload.map((image, index) => {
            let elImage = WatermarkInOverview({
                image,
                parent: colsNarrow[slot],
                onDeleted: () => {
                    containerOverview.remove();
                    overview();
                },
                onEdited: () => {
                    viewMedia();
                }
            });
            slot = (slot + 1) % 3;

            return {
                image,
                elImage,
            }
        })

        return {
            clear() {
                containerOverview.innerHTML = '';
            }
        }
    }

    ajax.loadWatermarkOverview().then(res => {
        // console.log('loaded and render', res);

        payload = Object.values(res);
        payload.sort((a, b) => b.chDate - a.chDate);
        return render();

    })


}

const selectAndUpload = () => {

    // Muss auch einen oder mehrere Watermarks wählen können

    // Der File-Input verlangt ein FormData-Objekt
    let watermark = new FormData();
    watermark.set('title', '');
    watermark.set('description', '');
    watermark.set('position', 'bottomRight');
    watermark.set('tiling', 'false');
    watermark.set('size', '20');
    watermark.set('opacity', '80');     // Deckung in Prozent
    watermark.set('blendmode', 'normal');   // Deckungsmodus (normal, multiply, screen, darken, lighten)

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
            {value: 'topLeft', label: lang.getPhrase('topLeft')},
            {value: 'topRight', label: lang.getPhrase('topRight')},
            {value: 'bottomLeft', label: lang.getPhrase('bottomLeft')},
            {value: 'bottomRight', label: lang.getPhrase('bottomRight')},
            {value: 'centerCenter', label: lang.getPhrase('centerCenter')},
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
                        selPosition.clear();
                        cbTiling.clear();
                        rngSize.clear();
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

const viewWatermarks = () => {

    elements.main.innerHTML = '';

    selectAndUpload();
    overview();

    elements.allTopNavs['watermark']?.highlight()
}

export default viewWatermarks;