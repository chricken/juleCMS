'use strict';

import helpers from "../../helpers.js";
import dom from "../../dom.js";
import elements from "../../elements.js";
import ajax from "../../ajax.js";

const select = ({
                    parent = null,
                    legend = null,
                    value = '',
                    options = [{value: 'dummy', label: 'Default'}],
                    size = 1,
                    onSelected = () => {
                    },
                }) => {


    const container = dom.create({
        parent,
        // cssClassName: `container-input ${nextToIndex ? 'nextToIndex' : ''}`,
        cssClassName: `container-select`,
    })

    dom.create({
        parent: container,
        // cssClassName: `legendInput ${nextToIndex ? 'nextToIndex' : ''}`,
        cssClassName: `legendInput`,
        content: legend,
        tagName: 'span',
    })

    let elSelect = dom.create({
        parent: container,
        tagName: 'select',
        size,
        listeners: {
            click(evt) {
                evt.stopPropagation();
            },
            change(evt) {
                let value = evt.target.value;
                onSelected(value);
            }
        }
    })

    options.forEach(option => {
        dom.create({
            parent: elSelect,
            tagName: 'option',
            value: option.value,
            content: option.label,
        })
    })

    elSelect.value = value;

    let path = new URL(import.meta.url).pathname;
    path = `${path.substring(0, path.lastIndexOf('/') + 1)}Select.css`;

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
            elSelect.value = value;
        },
        focus() {
            elSelect.focus();
        },
        get() {
            return elSelect.value;
        }
    }

};

export default select;