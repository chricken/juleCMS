'use strict';

import helpers from "../../helpers.js";
import dom from "../../dom.js";
import elements from "../../elements.js";
import ajax from "../../ajax.js";

// In dieser Komponenten muss unterschieden werden, ob ein
// bestimmter Value ("value")übergeben wird oder ob alle Daten
// in einem Objekt ("data") und dazu ein key übergeben werden,
const input = ({
                   parent = null,
                   legend = null,
                   data = null, // Das input-Element muss das Objekt bekommen, um es verändern zu können
                   key = null,  // Der Key dient dazu, das richtige Attribut aus data zu picken
                   value = null,
                   multiline = false,
                   valueIsArray = false,
                   callback = ajax.saveContent,
                   nextToIndex = false,
                   isInForm = false,
                   toLowerCase = false,
                   onInput = () => {
                   },
               }) => {


    callback = helpers.debouncer(callback, 1000);


    // Default-Inhalt definieren:
    // Wenn data nicht leer ist, entnimm den key
    // Wenn data leer ist (eigentlich wird ein Objekt erwartet), wird value genommen
    // Wenn value auch leer ist, wird ein leerer String genommen
    // Wenn der Inhalt als Array gedacht ist, bereite die Daten passend vor.

    let content;
    if (data && data[key]) {
        content = data[key];
    } else if (value) {
        content = valueIsArray ? value.split(',').map(el => el.trim()) : value;
    } else {
        content = valueIsArray ? [] : '';
    }


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
        attr: {
            contenteditable: true,
        },
        content,  // Wurde oben aufbereitet
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

                // Array
                if (isInForm) {
                    // In Formularen gilt:
                    // Komma-listen bleiben Komma-Listen
                    // form-data macht ein Array kompliziert
                    data.set(key, toLowerCase
                        ? evt.target.innerText.toLowerCase()
                        : evt.target.innerText
                    );
                } else {
                    if (valueIsArray) {
                        data[key] = evt.target.innerText
                            .split(',')
                            .map(el => el.trim())
                            .map(el => toLowerCase
                                ? el.toLowerCase()
                                : el
                            )
                    } else {
                        data[key] = toLowerCase
                            ? evt.target.innerText.toLowerCase()
                            : evt.target.innerText;
                    }
                }
                data.chDate = Date.now();

                // Leitet den Aufruf an den Debouncer weiter
                callback(data);
                onInput(evt.target.innerText);
                // ajax.saveContent(data);
            },

            click(evt) {
                evt.stopPropagation();

            }
        }
    })

    let path = new URL(import.meta.url).pathname;
    path = `${path.substring(0, path.lastIndexOf('/') + 1)}input.css`;

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

export default input;