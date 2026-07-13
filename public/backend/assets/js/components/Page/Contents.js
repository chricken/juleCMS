'use strict';

import dom from "../../dom.js";
import ajax from "../../ajax.js";
import CompContent from "../Content/Content.js";
import CompAddContent from "../AddContent/AddContent.js";
import CompDropContent from "../DropContent/DropContent.js";

import Page from "../Page/Page.js";

import lang from "../../lang.js";
import helpers, {collapse} from "../../helpers.js";
import data from "../../data.js";

const Contents = ({
                      page = {},
                      parent = null
                  }) => {

    console.log('page', page);

    const container = dom.create({
        cssClassName: 'meta container collapsable open transit',
        parent
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
        content: lang.getPhrase('contents'),
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

    CompDropContent({
        parent: inner,
        index: 0,
        page
    })

    CompAddContent({
        parent: inner,
        index: 0,
        page
    })
    console.log(page);

    page.content.forEach((contentID, index) => {

        const placeholder = dom.create({
            parent: inner,
            cssClassName: 'placeholder'
        })

        ajax.loadJSON(`/api/content/${contentID}`).then(
            result => {
                if (result.status === 'error') {
                    console.error('Error loading content:', result.message);
                    return false;
                } else {
                    let content = result.payload;
                    CompContent({
                        data: content,
                        index,
                        parent: placeholder,
                        onRemove: (content) => {
                            ajax.removeContent(content.id).then(
                                () => {
                                    console.log(data.pages);
                                    Page(data.pages.find(item => item.id === page.id));
                                    // Contents({page: data.pages.find(item => item.id === page.id), parent});
                                }
                            ).catch((err) => {
                                console.error('Error removing content:', err);
                            })
                        },
                        onDragStart: () => {
                            container.classList.add('dragging');
                        },
                        onDragEnd: () => {
                            container.classList.remove('dragging');
                        }
                    });

                    CompDropContent({
                        parent: placeholder,
                        index: index + 1,
                        page
                    })

                    CompAddContent({
                        parent: placeholder,
                        index: index + 1,
                        page
                    })
                }
            }
        )
    })


}


export default Contents;