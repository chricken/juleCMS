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
                   toLowerCase = false,
                   hasClearButton = true,
                   isTitle = false,
                   isPassword = false,
                   onInput = () => {
                   },
                   onClear = () => {
                   }
               }) => {

    const container = dom.create({
        parent,
        cssClassName: `container-input ${isTitle ? 'is-title' : ''} ${isPassword ? 'is-password' : ''}`,
    })

    dom.create({
        parent: container,
        cssClassName: `legendInput`,
        content: legend,
        tagName: 'span',
    })

    let elInput;

    if (isPassword) {
        // Echtes <input type="password"> für Passwort-Modus
        elInput = dom.create({
            parent: container,
            tagName: 'input',
            cssClassName: 'input password-input',
            type: 'password',
            value: value,
            listeners: {
                keydown(evt) {
                    evt.stopPropagation();
                    if (evt.key === 'Enter') {
                        evt.preventDefault();
                    }
                },
                keyup(evt) {
                    evt.stopPropagation();
                    value = evt.target.value;
                    onInput(value);
                },
                input(evt) {
                    evt.stopPropagation();
                    value = evt.target.value;
                    onInput(value);
                },
                click(evt) {
                    evt.stopPropagation();
                }
            }
        })
    } else if (multiline) {
        // Echtes <textarea> für mehrzeilige Eingaben
        elInput = dom.create({
            parent: container,
            tagName: 'textarea',
            cssClassName: 'input textarea-input',
            value: value,
            listeners: {
                keydown(evt) {
                    evt.stopPropagation();
                },
                keyup(evt) {
                    evt.stopPropagation();
                    value = evt.target.value;
                    onInput(value);
                },
                input(evt) {
                    evt.stopPropagation();
                    value = toLowerCase
                        ? evt.target.value.toLowerCase()
                        : evt.target.value;
                    onInput(value);
                },
                click(evt) {
                    evt.stopPropagation();
                }
            }
        })
    } else {
        elInput = dom.create({
            parent: container,
            tagName: 'span',
            cssClassName: 'input',
            attr: {
                contenteditable: true,
            },
            content: value,
            listeners: {
                keydown(evt) {
                    evt.stopPropagation();
                    if (evt.key === 'Enter') {
                        evt.preventDefault();
                    }
                },
                keyup(evt) {
                    evt.stopPropagation();
                    value = toLowerCase
                        ? evt.target.innerText.toLowerCase()
                        : evt.target.innerText;
                    onInput(value);
                },
                click(evt) {
                    evt.stopPropagation();
                }
            }
        })
    }

    const elButtons = dom.create({
        parent: container,
        cssClassName: 'buttons',
    })

    if (isPassword) {
        // Auge-Button: wechselt zwischen password und text (nicht per Tab erreichbar)
        const eyeButton = dom.create({
            tagName: 'button',
            content: '\u{1F441}',
            parent: elButtons,
            cssClassName: 'eye-button',
            attr: {
                type: 'button',
                tabindex: '-1',
                title: 'Passwort anzeigen/verbergen'
            },
            listeners: {
                click(evt) {
                    evt.stopPropagation();
                    if (elInput.type === 'password') {
                        elInput.type = 'text';
                        eyeButton.classList.add('visible');
                    } else {
                        elInput.type = 'password';
                        eyeButton.classList.remove('visible');
                    }
                    elInput.focus();
                }
            }
        })
    }

    if (hasClearButton) {
        dom.create({
            tagName: 'button',
            content: 'X',
            parent: elButtons,
            cssClassName: 'clear-button',
            attr: {
                type: 'button',
                tabindex: '-1'
            },
            listeners: {
                click() {
                    if (isPassword) {
                        elInput.value = '';
                    } else {
                        elInput.innerText = '';
                    }
                    value = '';
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
            if (isPassword || multiline) {
                elInput.value = '';
            } else {
                elInput.innerText = '';
            }
            value = '';
        },
        focus() {
            elInput.focus();
        },
        get() {
            return (isPassword || multiline) ? elInput.value : elInput.innerText;
        },
        set(newValue) {
            if (isPassword || multiline) {
                elInput.value = newValue;
            } else {
                elInput.innerText = newValue;
            }
            value = newValue;
        }
    }

};

export default input;
