'use strict';

import helpers from "../../helpers.js";
import dom from "../../dom.js";
import elements from "../../elements.js";
import ajax from "../../ajax.js";

// Ein inputFile hat ein paar Voraussetzungen:
// Wir brauchen ein FormData-Objekt und ein Formular und ein FormData-Objekt
// Die ausgewählten files werden zunächst in einem Formular, das nur diesen input hat, ausgewählt.
// Wenn es ausgewählt ist, werden die Informationen in das "Eltern"-FormData-Objekt übergeben
// https://mammouth.ai/app/a/default/c/18113684

const inputFile = ({
                       parent = null,
                       legend = null,
                       formData = new FormData(),
                       key = null,
                       multiple = false,
                       callback = ajax.saveContent,
                   }) => {


    const container = dom.create({
        parent,
        cssClassName: `container-input`,
    })

    dom.create({
        parent: container,
        cssClassName: `legendInput`,
        content: legend,
        tagName: 'span',
    })

    let tempForm = dom.create({
        tagName: 'form',
        parent: container,
    })

    let elInput = dom.create({
        parent: tempForm,
        tagName: 'input',
        cssClassName: 'input-file',
        attr: {
            type: 'file',
            name: key
        },
        listeners: {
            change(evt) {
                let tempFileData = new FormData(tempForm);
                console.log(tempFileData);

            }
        }
    })

    multiple && elInput.setAttribute('multiple', true);

    let path = new URL(import.meta.url).pathname;
    path = `${path.substring(0, path.lastIndexOf('/') + 1)}inputFile.css`;

    dom.create({
        tagName: 'link',
        attr: {
            href: path,
            rel: 'stylesheet',
        },
        parent: container
    })

};

export default inputFile;