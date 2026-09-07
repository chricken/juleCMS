'use strict';

import dom from "../../dom.js";
import CompInput from "../Input/Input.js";
import lang from "../../lang.js";
import CompSelect from "../Select/Select.js";

const Link = ({
                  link,
                  parent,
                  saveContent, // darf keinen Default haben, damit es beim Aufruf eine Fehlermeldung gibt
                  renderLinks, // darf keinen Default haben, damit es beim Aufruf eine Fehlermeldung gibt
                  removeLink, // darf keinen Default haben, damit es beim Aufruf eine Fehlermeldung gibt
    moveUp,
    moveDown,
              }) => {

    const containerLink = dom.create({
        parent,
        cssClassName: 'container-link'
    })

    CompInput({
        parent: containerLink,
        legend: lang.getPhrase('legend'),
        value: link.legend,
        onInput(value) {
            link.legend = value;
            saveContent();
        }
    })

    CompInput({
        parent: containerLink,
        legend: lang.getPhrase('url'),
        value: link.url,
        onInput(value) {
            link.url = value;
            saveContent();
        }
    })

    CompSelect({
        parent: containerLink,
        legend: lang.getPhrase('target'),
        value: link.target,
        options: [
            {value: '_blank', label: lang.getPhrase('newWindow')},
            {value: '_self', label: lang.getPhrase('sameWindow')}
        ],
        onSelected(value) {
            link.target = value;
            saveContent();
        }
    })

    dom.create({
        parent: containerLink,
        tagName: 'button',
        content: lang.getPhrase('delete'),
        cssClassName: 'button button-small',
        listeners: {
            click: () => {
                removeLink();
                saveContent();
                renderLinks();

            }
        }
    })

    dom.create({
        parent: containerLink,
        tagName: 'button',
        content: lang.getPhrase('moveUp'),
        cssClassName: 'button button-small',
        listeners: {
            click:moveUp
        }
    })

    dom.create({
        parent: containerLink,
        tagName: 'button',
        content: lang.getPhrase('moveDown'),
        cssClassName: 'button button-small',
        listeners: {
            click: moveDown
        }
    })

    // Abstand
    dom.create({
        parent: containerLink,
        tagName: 'br'
    })
    dom.create({
        parent: containerLink,
        tagName: 'hr'
    })

}

export default Link;