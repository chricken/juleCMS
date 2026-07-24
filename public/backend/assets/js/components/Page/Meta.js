'use strict';

import elements from "../../elements.js";
import dom from "../../dom.js";
import compInput from '../Input/Input.js';
import ajax from "../../ajax.js";
import CompContent from "../Content/Content.js";
import CompAddContent from "../AddContent/AddContent.js";

import lang from "../../lang.js";
import helpers, {collapse} from "../../helpers.js";

const Meta = ({
                  data = {},
                  parent = null
              }) => {

    const savePage = helpers.debouncer(ajax.savePage, 1000);

    const container = dom.create({
        cssClassName: 'meta container collapsable transit',
        parent,
        styles: {
            height: '50px',
        }
    })

    dom.create({
        parent: container,
        cssClassName: 'border transit',
    })

    const containerInner = dom.create({
        cssClassName: 'containerInner transit',
        parent: container,
    })
    dom.create({
        content: '⯈',
        cssClassName: 'indicatorOpen',
        parent: containerInner,
    })

    // Header
    dom.create({
        parent: containerInner,
        content: lang.getPhrase('meta'),
        tagName: 'h3',
        listeners: {
            click(evt) {
                evt.stopPropagation();
                collapse(container, inner);
            }
        }
    })

    const inner = dom.create({
        parent: containerInner,
        cssClassName: 'inner',
    })

    compInput({
        parent: inner,
        legend: lang.getPhrase('title'),
        value: data.metaTitle,
        onInput(value) {
            console.log('metaTitel', value);
            data.metaTitle = value;
            savePage(data);
        }
    })

    compInput({
        parent: inner,
        legend: 'Beschreibung',
        value: data.metaDescription,
        onInput(value) {
            console.log('metaDescription', value);
            data.metaDescription = value;
            savePage(data);
        }
    })

    compInput({
        parent: inner,
        legend: 'Schlüsselwörter',
        value: data.metaKeywords,
        valueIsArray: true,
        onInput(value) {
            console.log('metaKeywords', value);
            data.metaKeywords = value;
            savePage(data);
        }
    })

}


export default Meta;