'use strict';

import helpers from "../../helpers.js";
import dom from "../../dom.js";
import elements from "../../elements.js";
import ajax from "../../ajax.js";

// Diese Komponente soll verwendet werden, wenn es sich um ein Input-Element für ein Formular handelt
// Hier wird das ganze formData übergeben und direkt editiert
// Das mache ich so, damit die Referenz nicht gebrochen wird.
const inputForm = ({
                       parent = null,
                       legend = null,
                       formData = null, // Das input-Element muss das Objekt bekommen, um es verändern zu können
                       key = null,  // Der Key dient dazu, das richtige Attribut aus data zu picken
                       multiline = false,
                       nextToIndex = false,
                       toLowerCase = false,
                       hasClearButton = true,
                       onInput = () => {
                       },
                   }) => {

    const container = dom.create({
        parent,
        cssClassName: `container-input ${nextToIndex ? 'nextToIndex' : ''}`,
    })

    dom.create({
        parent: container,
        cssClassName: `legendInput ${nextToIndex ? 'nextToIndex' : ''}`,
        content: legend,
        tagName: 'span',
    })

    let elInput = dom.create({
        parent: container,
        tagName: 'span',
        cssClassName: 'input',
        content: formData.get(key),  // Wurde oben aufbereitet
        attr: {
            contenteditable: true,
        },
        listeners: {
            keydown(evt) {
                evt.stopPropagation();
                // Enter abbrechen, wenn nicht multiline
                if (!multiline && evt.key === 'Enter') {
                    evt.preventDefault();
                }
            },

            keyup(evt) {
                evt.stopPropagation();

                formData.set(key, toLowerCase
                    ? evt.target.innerText.toLowerCase()
                    : evt.target.innerText
                );

                // Datum aktualisiseren
                formData.set('chDate', Date.now());

                // Leitet den Aufruf an den Debouncer weiter
                onInput(formData);
            },

            click(evt) {
                evt.stopPropagation();
            }
        }
    })

    if (hasClearButton) {
        dom.create({
            tagName: 'button',
            content: 'X',
            parent: container,
            cssClassName: 'clear-button',
            listeners: {
                click() {
                    elInput.innerText = '';
                    formData.set(key, '');
                    elInput.focus();
                }
            }
        })
    }

    let path = new URL(import.meta.url).pathname;
    path = `${path.substring(0, path.lastIndexOf('/') + 1)}inputForm.css`;

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
            elInput.innerText = '';
        },
        focus() {
            elInput.focus();
        },
        get() {
            return elInput.innerText;
        }
    }

};

export default inputForm;