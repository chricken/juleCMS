'use strict';

import dom from "../../dom.js";
import CompInput from "../Input/Input.js";
import elements from "../../elements.js";
import ajax from "../../ajax.js";
import settings from "../../data.js";

import compDetailsPage from "../Page/Page.js";
import lang from "../../lang.js";

const BtnSort = ({
                     parent = null,
                     legend = 'default',
                     asc = true,
                     onSort = () => {
                     },
                 } = {}
    ) => {

        const container = dom.create({
            tagName: 'span',
            parent,
            cssClassName: 'container-btn container-btn-sort transit',
        })

        const btn = dom.create({
            tagName: 'button',
            parent: container,
            content: `${lang.getPhrase('sortBy')}: ${lang.getPhrase(legend)} ${asc ? '▲' : '▼'}`,
            listeners: {
                click() {
                    asc = !asc;
                    btn.innerHTML = `${lang.getPhrase('sortBy')}: ${lang.getPhrase(legend)} ${asc ? '▲' : '▼'}`;
                    onSort(asc);
                }
            }
        })

        let path = new URL(import.meta.url).pathname;
        path = `${path.substring(0, path.lastIndexOf('/') + 1)}DropContent.css`;

        dom.create({
            tagName: 'link',
            attr: {
                href: path,
                rel: 'stylesheet',
            },
            parent: elements.page
        })


    }
;

export default BtnSort;