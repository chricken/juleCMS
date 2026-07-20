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
                       onChange = ajax.saveContent,
                   }) => {


    const container = dom.create({
        parent,
        cssClassName: `container-input container-input-file`,
    })

    if (legend)
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
            name: key,

        },
        listeners: {
            change(evt) {
                let tempFileData = new FormData(tempForm);
                elPreview.innerHTML = '';
                // console.log(tempFileData);
                const files = tempFileData.getAll(key); // Array mit allen Dateien aus form1

                // vorhandene Bilddaten entfernen
                let index = 0;
                while (formData.has(`${key}[${index}]`)) {
                    formData.delete(`${key}[${index}]`);
                    index++;
                }
                // Neue Bilddaten hinzufügen
                files.forEach((file, index) => {
                    formData.append(`${key}[${index}]`, file); // z. B. "form1_files[0]", "form1_files[1]"
                    let fileReader = new FileReader();
                    fileReader.readAsDataURL(file);
                    fileReader.addEventListener('load', () => {
                        dom.create({
                            tagName: 'img',
                            src: fileReader.result,
                            parent: elPreview,
                            cssClassName: 'preview-img',
                        })
                    });
                });
                // console.log('formdata', formData);

                onChange(tempFileData);
            }
        }
    })

    multiple && elInput.setAttribute('multiple', true);

    // Preview
    const elPreview = dom.create({
        parent: container,
        cssClassName: 'preview',
    })


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
    return {
        clear() {
            elInput.value = '';
            elPreview.innerHTML = '';
        }
    }
};

export default inputFile;