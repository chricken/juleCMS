'use strict';

import elements from "../../elements.js";
import dom from "../../dom.js";
import compInput from '../Input/Input.js';
import ajax from "../../ajax.js";
import CompContent from "../Content/Content.js";
import CompAddContent from "../AddContent/AddContent.js";

import lang from "../../lang.js";
import helpers, {collapse} from "../../helpers.js";

import Base from "./Base.js";
import Meta from "./Meta.js";
import Contents from "./Contents.js";


const Page = (page) => {

    const saveDebounced = helpers.debouncer(ajax.savePage, 1000);

    elements.page.innerHTML = ``;

    dom.create({
        tagName: 'h2',
        content: page.title,
        parent: elements.page,
        attr: {
            contenteditable: true,
        },
        listeners: {
            input(evt) {
                page.title = evt.target.innerText;
                saveDebounced(page);
            }
        }
    })

    Contents({page, parent: elements.page});
    Base({data: page, parent: elements.page});
    Meta({data: page, parent: elements.page});

/*
    dom.create({
        tagName: 'button',
        content: lang.getPhrase('savePage'),
        parent: elements.page,
        listeners: {
            click(evt) {
                evt.stopPropagation();
                console.log('Save Page', page);
            }
        }
    })

 */

    dom.create({
        tagName: 'button',
        content: lang.getPhrase('newPageAfter'),
        parent: elements.page,
        listeners: {
            click(evt) {
                evt.stopPropagation();
                console.log('New Page after', page);
                ajax.newPageAfter(page);
            }
        }
    })

    dom.create({
        tagName: 'button',
        content: lang.getPhrase('newPageIn'),
        parent: elements.page,
        listeners: {
            click(evt) {
                evt.stopPropagation();
                console.log('New Page In', page);
                ajax.newPageIn(page);
            }
        }
    })

    dom.create({
        tagName: 'button',
        content: lang.getPhrase('removePage'),
        parent: elements.page,
        listeners: {
            click(evt) {
                if(confirm(lang.getPhrase('sureDeletePage'))) {
                    evt.stopPropagation();
                console.log('Remove Page', page);
                ajax.removePage(page);
                }
            }
        }
    })


}

export default Page;