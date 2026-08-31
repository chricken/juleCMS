'use strict';

import helpers from "../../helpers.js";
import dom from "../../dom.js";
import elements from "../../elements.js";
import ajax from "../../ajax.js";

const range = ({
                   parent = null,
                   legend = null,
                   value = 0,
                   min = 0,
                   max = 100,
                   step = 1,
                   roundValue = true,
                   onInput = () => {
                   },
               }) => {

    // console.log(legend, value);
    let defaultValue = value;

    let isDragging = false;
    let startXMouse = 0;
    let startXThumb = 0;

    const container = dom.create({
        parent,
        // cssClassName: `container-input ${nextToIndex ? 'nextToIndex' : ''}`,
        cssClassName: `container-range`,
    })

    const elInteract = dom.create({
        parent: container,
        cssClassName: 'interact',
        listeners: {
            mousemove(evt) {
                console.log('click', evt);
            },
            mouseup(evt) {

            }
        }
    })

    const elLegend = dom.create({
        parent: container,
        // cssClassName: `legendInput ${nextToIndex ? 'nextToIndex' : ''}`,
        cssClassName: `legendInput`,
        content: `${legend} (${value})`,
        tagName: 'span',
    })

    const elSliderRail = dom.create({
        parent: container,
        cssClassName: 'slider-rail',

    })

    const handleMove = (evt, parent) => {
        evt.stopPropagation();
        console.log('evt Move', parent);

        let rect = elSliderRail.getBoundingClientRect();
        let currentX = evt.clientX - startXMouse;
        currentX = startXThumb + currentX;
        currentX = Math.min(Math.max(currentX, 0), rect.width - elSliderThumb.offsetWidth);

        let value = currentX / (rect.width - elSliderThumb.offsetWidth) * (max - min) + min;
        value = roundValue ? Math.round(value) : value;

        setValue(value);
    }

    const handleUp = (evt, parent) => {
        evt.stopPropagation();
        isDragging = false;
        console.log('mouseup', parent);

        parent.removeEventListener('mousemove', handleMove);
        parent.removeEventListener('mouseup', handleUp);
    }

    const elSliderThumb = dom.create({
        parent: elSliderRail,
        cssClassName: 'slider-thumb',
        styles: {
            left: `${100 / max * value}%`,
        },
        listeners: {
            mousedown(evt) {
                evt.stopPropagation();
                isDragging = true;

                startXMouse = evt.clientX;
                startXThumb = elSliderThumb.offsetLeft;

                elInteract.classList.add('is-interacting');

                elInteract.addEventListener('mousemove', handleMove);
                elInteract.addEventListener('mouseup', handleUp);

                let parent = evt.target.closest('.modalBG') || document;
                console.log('thumb down', parent);
            },
        }
    })

    let path = new URL(import.meta.url).pathname;
    path = `${path.substring(0, path.lastIndexOf('/') + 1)}Range.css`;

    dom.create({
        tagName: 'link',
        attr: {
            href: path,
            rel: 'stylesheet',
        },
        parent: container
    })

    const setValue = (updateValue = 0) => {
        // console.log('updateValue', updateValue);

        value = updateValue;
        let rect = elSliderRail.getBoundingClientRect();
        let currentX = (rect.width - elSliderThumb.offsetWidth) / max * value;
        elSliderThumb.style.left = `${currentX}px`;
        elLegend.innerText = `${legend} (${value})`;
        onInput(value);
    }

    return {
        clear() {
            setValue(defaultValue);
        },
        set: setValue,

        get() {
            return value;
        }
    }

};

export default range;