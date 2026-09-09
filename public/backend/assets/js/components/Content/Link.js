'use strict';

import dom from "../../dom.js";
import CompInput from "../Input/Input.js";
import lang from "../../lang.js";
import CompSelect from "../Select/Select.js";

import CompModalLinkInternal from "../../modal/LinkInternal/LinkInternal.js";
import CompModalLinkExternal from "../../modal/LinkExternal/LinkExternal.js";
import data from "../../data.js";

const Link = ({
                  link,
                  parent,
                  index = 0,
                  numGesamt = 0,
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

    const parentURL = dom.create({
        parent: containerLink,
        cssClassName: 'container-input'
    })

    // Links
    dom.create({
        parent: parentURL,
        tagName: 'span',
        content: lang.getPhrase('url'),
        cssClassName: 'legendInput'
    })

    // console.log('pages', data.pages);

    if (link.url) {
        let linkContent = data.pages?.find(page => page.id === link.url)?.title || link.url;

        dom.create({
            parent: parentURL,
            tagName: 'span',
            content: linkContent,
            cssClassName: 'legendDescription'
        })
    }

    dom.create({
        parent: parentURL,
        tagName: 'button',
        content: lang.getPhrase('internalLink'),
        cssClassName: 'button button-small',
        listeners: {
            click: () => {
                CompModalLinkInternal({
                    onSelected(id) {
                        console.log('selected prent', id);
                        link.url = id;
                        saveContent();
                        renderLinks();
                    }
                })
            }
        }
    })

    dom.create({
        parent: parentURL,
        tagName: 'button',
        content: lang.getPhrase('externalLink'),
        cssClassName: 'button button-small',
        listeners: {
            click: () => {
                CompModalLinkExternal({
                    url: link.url,
                    onSelected(url) {
                        link.url = url;
                        // console.log('new URL', url, link);

                        saveContent();
                        renderLinks();
                    }
                })
            }
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


    // Buttons zum Löschen und verschieben
    const parentBtnInteractive = dom.create({
        parent: containerLink,
        cssClassName: 'buttons-interactive'
    })

    dom.create({
        parent: parentBtnInteractive,
        tagName: 'button',
        content: lang.getPhrase('delete'),
        cssClassName: 'button button-no-border',
        listeners: {
            click: () => {
                removeLink();
                saveContent();
                renderLinks();

            }
        }
    })

    if (index > 0) {
        dom.create({
            parent: parentBtnInteractive,
            tagName: 'button',
            content: lang.getPhrase('moveUp'),
            cssClassName: 'button button-no-border',
            listeners: {
                click: moveUp
            }
        })
    }

    if (index < numGesamt - 1) {
        dom.create({
            parent: parentBtnInteractive,
            tagName: 'button',
            content: lang.getPhrase('moveDown'),
            cssClassName: 'button button-no-border',
            listeners: {
                click: moveDown
            }
        })
    }


    // Abstand
    dom.create({
        parent: containerLink,
        tagName: 'hr'
    })

}

export default Link;