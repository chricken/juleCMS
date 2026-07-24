'use strict';

import helpers from "../../helpers.js";
import dom from "../../dom.js";
import elements from "../../elements.js";
import ajax from "../../ajax.js";

const input = ({
                   parent = null,
                   legend = null,
                   value = '',
                   multiline = false,
                   // valueIsArray = false,
                   // nextToIndex = false,
                   toLowerCase = false,
                   hasClearButton = true,
                   onInput = () => {
                   },
                   onClear = () => {
                   }
               }) => {

    // console.log(legend, value);


    const container = dom.create({
        parent,
        // cssClassName: `container-input ${nextToIndex ? 'nextToIndex' : ''}`,
        cssClassName: `container-input`,
    })

    dom.create({
        parent: container,
        // cssClassName: `legendInput ${nextToIndex ? 'nextToIndex' : ''}`,
        cssClassName: `legendInput`,
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
        content: value,  // Wurde oben aufbereitet
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
                /*
                if (valueIsArray) {
                    value = evt.target.innerText
                        .split(',')
                        .map(el => el.trim())
                        .map(el => toLowerCase
                            ? el.toLowerCase()
                            : el
                        )
                } else {
                */
                value = toLowerCase
                    ? evt.target.innerText.toLowerCase()
                    : evt.target.innerText;
                // }

                onInput(value);
            },

            click(evt) {
                evt.stopPropagation();

            }
        }
    })

    const elButtons = dom.create({
        parent: container,
        cssClassName: 'buttons',
    })
    if (hasClearButton) {
        dom.create({
            tagName: 'button',
            content: 'X',
            parent: elButtons,
            cssClassName: 'clear-button',
            listeners: {
                click() {
                    elInput.innerText = '';
                    elInput.focus();
                    onClear();
                }
            }
        })
    }

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