'use strict';

import helpers from "../../helpers.js";
import dom from "../../dom.js";
import elements from "../../elements.js";
import ajax from "../../ajax.js";

const checkbox = ({
                      parent = null,
                      legend = null,
                      value = false,
                      onChanged = () => {
                      },
                  }) => {

    const defaultValue = value;

    const container = dom.create({
        parent,
        cssClassName: `container-checkbox`,
    })

    dom.create({
        parent: container,
        // cssClassName: `legendInput ${nextToIndex ? 'nextToIndex' : ''}`,
        cssClassName: `legendInput ${value ? 'checked' : ''}`,
        content: legend,
        tagName: 'span',
    })

    const elChecker = dom.create({
        parent: container,
        cssClassName: 'checker transit',
        listeners: {
            click(evt) {
                evt.stopPropagation();
                value = !value;
                elChecker.classList.toggle('checked');
                onChanged(value);
            }
        }
    })

    const elSchieber = dom.create({
        parent: elChecker,
        cssClassName: 'schieber transit',
    })

    const elLegendOn = dom.create({
        parent: elChecker,
        cssClassName: 'legend legendOn transit',
        content: 'ON',
    })

    const elLegendOff = dom.create({
        parent: elChecker,
        cssClassName: 'legend legendOff transit',
        content: 'OFF',
    })

    let path = new URL(import.meta.url).pathname;
    path = `${path.substring(0, path.lastIndexOf('/') + 1)}Checkbox.css`;

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
            value = defaultValue;
            if (value) elChecker.classList.add('checked');
            else elChecker.classList.remove('checked');
            onChanged(value);
        },
        focus() {
            elInput.focus();
        },
        get() {
            return elInput.value;
        }
    }

};

export default checkbox;