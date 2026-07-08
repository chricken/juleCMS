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
        content: 'Meta',
        tagName: 'h3',
        listeners: {
            click(evt) {
                evt.stopPropagation();
                // container.classList.toggle('open');
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
        legend: 'Titel',
        key: 'metaTitle',
        data,
        callback:ajax.savePage
    })

    compInput({
        parent: inner,
        legend: 'Beschreibung',
        key: 'metaDescription',
        data,
        callback:ajax.savePage
    })

    compInput({
        parent: inner,
        legend: 'Schlüsselwörter',
        key: 'metaKeywords',
        data,
        valueIsArray: true,
        callback:ajax.savePage
    })

}



export default Meta;