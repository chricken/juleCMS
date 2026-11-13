'use strict';

import elements from "../elements.js";
import dom from "../dom.js";
import CompNavPage from "../components/NavPage/NavPage.js";
import data from "../data.js";
import compDetailsPage from "../components/Page/Page.js";

const viewPages = () => {

    elements.main.innerHTML = '';
    const pageRoot = data.pages.find(page => page.id === 'root');

    elements.pages = dom.create({
        tagName: 'pages',
        parent: elements.main,
    });

    elements.page = dom.create({
        tagName: 'page',
        parent: elements.main,
    })

    data.currentPage = localStorage.getItem('jule:currentPage') || pageRoot.id;
    // gespeicherte Seite existiert noch?
    if (!data.pages.find(pg => pg.id === data.currentPage)) data.currentPage = pageRoot.id;

    elements.pages.innerHTML = '';
    CompNavPage();

    compDetailsPage(data.pages.find(pg => pg.id === data.currentPage) || pageRoot);

    elements.allTopNavs['pages']?.highlight()
}

export default viewPages;