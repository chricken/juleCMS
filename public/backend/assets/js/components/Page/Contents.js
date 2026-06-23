'use strict';

import elements from "../../elements.js";
import dom from "../../dom.js";
import compInput from '../Input/Input.js';
import ajax from "../../ajax.js";
import CompContent from "../Content/Content.js";
import CompAddContent from "../AddContent/AddContent.js";

import lang from "../../lang.js";
import helpers, {collapse} from "../../helpers.js";

const Contents = ({
                      data = {},
                      parent = null
                  }) => {

    console.log('mage-data', data);

    const container = dom.create({
        cssClassName: 'meta container collapsable open transit',
        parent
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
        content: 'Content',
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

    CompAddContent({
        parent: inner,
        index: 0,
        page: data
    })

    data.content.forEach((contentID, index) => {

        const placeholder = dom.create({
            parent: inner,
            cssClassName: 'placeholder'
        })

        ajax.loadJSON(`/api/content/${contentID}`).then(
            content => {
                CompContent({
                    data: content,
                    index,
                    parent: placeholder
                });
                CompAddContent({
                    parent: placeholder,
                    index: index + 1,
                    page: data
                })
            }
        )
    })


}


export default Contents;