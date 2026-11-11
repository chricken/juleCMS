'use strict';

import elements from "../elements.js";
import dom from "../dom.js";
import lang from "../lang.js";
import ajax from "../ajax.js";

const viewTheme = () => {

    elements.main.innerHTML = '';

    dom.create({
        tagName: 'h1',
        content: lang.getPhrase('theme'),
        parent: elements.main,
    })

    const listContainer = dom.create({
        cssClassName: 'theme-list',
        parent: elements.main,
    })

    const render = () => {
        listContainer.innerHTML = '';
        ajax.loadThemes().then(
            ({themes = [], current = 'default'}) => {
                themes.forEach(theme => {
                    const card = dom.create({
                        cssClassName: 'theme-card card transit' + (theme === current ? ' selected' : ''),
                        parent: listContainer,
                        listeners: {
                            click() {
                                ajax.selectTheme(theme).then(
                                    res => {
                                        if (res.status === 'success') render();
                                    }
                                )
                            }
                        }
                    })
                    dom.create({
                        tagName: 'h2',
                        content: theme,
                        parent: card,
                    })
                    if (theme === current) {
                        dom.create({
                            tagName: 'span',
                            cssClassName: 'theme-active',
                            content: '✓ aktiv',
                            parent: card,
                        })
                    }
                })
            }
        )
    }

    render();

    elements.allTopNavs['theme']?.highlight()
}

export default viewTheme;
