'use strict';

import elements from "../../elements.js";
import dom from "../../dom.js";
import compInput from '../Input/Input.js';
import ajax from "../../ajax.js";
import CompContent from "../Content/Content.js";
import CompAddContent from "../AddContent/AddContent.js";

import lang from "../../lang.js";
import helpers, {collapse} from "../../helpers.js";


const Base = ({
                  data = {},
                  parent = null
              }) => {


    const saveDebounced = helpers.debouncer(ajax.savePage, 1000);

    const container = dom.create({
        cssClassName: 'base container collapsable transit',
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
        cssClassName: 'indicatorOpen transit',
        parent: containerInner,
    })

    // Header
    dom.create({
        parent: containerInner,
        content: 'Base',
        tagName: 'h3',
        cssClassName: 'transit',
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

    dom.create({
        parent: inner,
        content: `ID: ${data.id}`,
        cssClassName: 'info',
    })

    compInput({
        parent: inner,
        legend: 'Slug',
        key: 'slug',
        data,
        callback: ajax.savePage
    })

    dom.create({
        parent: inner,
        content: `Created: ${new Date(data.crDate).toLocaleDateString()}`,
        cssClassName: 'info',

    })
    dom.create({
        parent: inner,
        content: `Last Changed: ${new Date(data.chDate).toLocaleDateString()}`,
        cssClassName: 'info',
    })

}



export default Base;