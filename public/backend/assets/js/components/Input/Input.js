'use strict';

import helpers from "../../helpers.js";
import dom from "../../dom.js";
import elements from "../../elements.js";
import TranslationButtons from "../TranslationButtons/TranslationButtons.js";
import lang from "../../lang.js";
import Modal from "../../modal/modal.js";


// Hilfe-Modal mit den grundlegenden Markdown-Syntaxen
const openMdHelp = () => {
    const elInner = Modal({legend: lang.getPhrase('mdHelp')});
    dom.create({tagName: 'p', cssClassName: 'md-help-intro', content: lang.getPhrase('mdHelpIntro'), parent: elInner});
    const rows = [
        {code: '**fett**', label: lang.getPhrase('mdBold')},
        {code: '*kursiv*', label: lang.getPhrase('mdItalic')},
        {code: '- Punkt 1<br>- Punkt 2', label: lang.getPhrase('mdList')},
        {code: '---', label: lang.getPhrase('mdHr')},
        {code: '## Ueberschrift', label: lang.getPhrase('mdHeading')},
        {code: '[Text](https://beispiel.de)', label: lang.getPhrase('mdLink')},
    ];
    rows.forEach(r => {
        const row = dom.create({parent: elInner, cssClassName: 'md-help-row'});
        dom.create({tagName: 'code', cssClassName: 'md-help-code', content: r.code, parent: row});
        dom.create({tagName: 'span', cssClassName: 'md-help-label', content: r.label, parent: row});
    });
    return elInner;
};

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
                   },
                   translation = null,
               }) => {

    // onInput wrappen: bei Änderung Ampel-Icons aktualisieren (rot wenn veraltet)
    const origOnInput = onInput;
    onInput = (val) => {
        origOnInput(val);
        // erst nach dem Original-Handler aktualisieren, damit data.field schon neu ist
        if (translation) TranslationButtons.markOutdatedFor(translation.data, translation.field, translation.isArray || false, translation.index ?? null);
    };

    const container = dom.create({
        parent,
        cssClassName: `container-input ${isTitle ? 'is-title' : ''} ${isPassword ? 'is-password' : ''}`,
    })

    if (multiline) {
        const legendWrap = dom.create({parent: container, cssClassName: 'legend-wrap'})
        dom.create({
            parent: legendWrap,
            cssClassName: `legendInput`,
            content: legend,
            tagName: 'span',
        })
        dom.create({
            tagName: 'button',
            type: 'button',
            parent: legendWrap,
            content: '?',
            cssClassName: 'md-help-btn',
            attr: {type: 'button', tabindex: '-1', title: lang.getPhrase('mdHelp')},
            listeners: {
                click(evt) {
                    evt.stopPropagation();
                    openMdHelp();
                }
            }
        })
    } else {
        dom.create({
            parent: container,
            cssClassName: `legendInput`,
            content: legend,
            tagName: 'span',
        })
    }

    let elInput;

    if (isPassword) {
        // Echtes <input type="password"> für Passwort-Modus
        elInput = dom.create({
            parent: container,
            tagName: 'input',
            cssClassName: 'input password-input',
            type: 'password',
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
        elInput.value = value;
    } else if (multiline) {
        // Echtes <textarea> für mehrzeilige Eingaben
        elInput = dom.create({
            parent: container,
            tagName: 'textarea',
            cssClassName: 'input textarea-input',
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
        elInput.value = value;
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

    if (translation) {
        TranslationButtons.addTranslationButtons({
            parent: container,
            data: translation.data,
            field: translation.field,
            saveFn: translation.saveFn,
            isArray: translation.isArray || false,
            index: translation.index !== undefined ? translation.index : null,
            setValue: (v) => {
                if (multiline) elInput.value = v;
                else elInput.innerText = v;
                value = v;
            },
        });
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
