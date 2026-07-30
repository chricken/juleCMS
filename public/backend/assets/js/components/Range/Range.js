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
        listeners: {
            mousedown(evt) {

                let rect = elSliderRail.getBoundingClientRect();
                evt.stopPropagation();
                isDragging = true;
                elSliderThumb.style.left = `${evt.clientX - rect.left - 10}px`;

                startXMouse = evt.clientX;
                startXThumb = elSliderThumb.offsetLeft;

                handleMove(evt)

                document.addEventListener('mousemove', handleMove);
                document.addEventListener('mouseup', handleUp);
                console.log('mousedown', handleMove)
            }
        }
    })

    const handleMove = (evt) => {
        evt.stopPropagation();

        let rect = elSliderRail.getBoundingClientRect();
        let currentX = evt.clientX - startXMouse;
        currentX = startXThumb + currentX;
        currentX = Math.min(Math.max(currentX, 0), rect.width - elSliderThumb.offsetWidth);

        let value = currentX / (rect.width - elSliderThumb.offsetWidth) * (max - min) + min;
        value = roundValue ? Math.round(value) : value;

        setValue(value);
    }

    const handleUp = (evt) => {
        evt.stopPropagation();
        isDragging = false;
        console.log('mouseup');

        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
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

                document.addEventListener('mousemove', handleMove);
                document.addEventListener('mouseup', handleUp);

                console.log('thumb down', handleUp, document);

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