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
import TranslationButtons from "../TranslationButtons/TranslationButtons.js";


const Page = (page) => {

    const saveDebounced = helpers.debouncer(ajax.savePage, 1000);

    elements.page.innerHTML = ``;

    const h2Wrap = dom.create({
        parent: elements.page,
        cssClassName: 'page-title-wrap',
    })

    dom.create({
        tagName: 'h2',
        content: page.title,
        parent: h2Wrap,
        attr: {
            contenteditable: true,
        },
        listeners: {
            input(evt) {
                page.title = evt.target.innerText;
                saveDebounced(page);
                TranslationButtons.markOutdatedFor(page, 'title', false, null);
            }
        }
    })

    TranslationButtons.addTranslationButtons({
        parent: h2Wrap,
        data: page,
        field: 'title',
        saveFn: (d) => saveDebounced(d),
    })
    // console.log('page', page);

    if (page.id !== 'root') {
        Contents({page, parent: elements.page});
    }
    Base({data: page, parent: elements.page});
    Meta({data: page, parent: elements.page});

}

export default Page;