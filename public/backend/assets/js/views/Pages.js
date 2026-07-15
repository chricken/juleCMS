'use strict';

import elements from "../elements.js";
import dom from "../dom.js";
import CompNavPage from "../components/NavPage/NavPage.js";
import data from "../data.js";
import compDetailsPage from "../components/Page/Page.js";

const viewPages = () =>{

    elements.main.innerHTML = '';
    const pageRoot = data.pages.find(page => page.id === 'root');

    elements.pages = dom.create({
        tagName:'pages',
        parent:elements.main,
    });

    elements.page = dom.create({
        tagName:'page',
        parent:elements.main,
    })

    data.currentPage = pageRoot.id;

    CompNavPage({page: pageRoot, index: 0, parent: elements.pages});

    compDetailsPage(pageRoot);

}

export default viewPages;