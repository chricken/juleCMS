'use strict';

import dom from "../../dom.js";
import elements from "../../elements.js";

const input = ({
                   parent = null,
                   legend = null,
                   data = {},
                   key = null,
                   multiline = false,
                   valueIsArray = false,
               }) => {

    // Das input-Element muss das Objekt bekommen, um es verändern zuu können
    // Der Key dient dazu, das richtige Element zu picken

    const container = dom.create({
        parent,

    })

    dom.create({
        parent: container,
        cssClassName: 'legendInput',
        content: legend,
        tagName: 'span',
    })

    // Wenn der Inhalt als Array gedacht ist, bereite die Daten passend vor.
    let content = data[key] || (valueIsArray ? [] : '');

    dom.create({
        parent: container,
        tagName: 'span',
        cssClassName: 'input',
        attr: {
            contenteditable: true,
        },
        content: valueIsArray ? content.join(', ') : content,
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
                if (valueIsArray)
                    data[key] = evt.target.innerText
                        .split(',')
                        .map(el => el.trim())
                        .map(el => el.toLowerCase());
                else
                    data[key] = evt.target.innerText;

            },
            click(evt){
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
        parent: elements.page
    })

};

export default input;