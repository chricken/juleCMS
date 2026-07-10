'use strict';

import {promises as fs} from 'fs';
import structure from './contents/structure.json' with {type: 'json'};
import helpers from "./helpers.js";
import Item from "./classes/Item.js";

const necessaryContentFolders = ['images', 'items', 'pages'];

const manageContents = {
    pages: null,
    init() {
        return Promise.all(necessaryContentFolders.map(foldername =>
            fs.mkdir(`./contents/${foldername}`, {recursive: true})
        )).then(
            () => {
                manageContents.pages = structure.pages;
            }
        )

    },

    getContent(id) {
        return fs.readFile(`./contents/items/${id}.json`, 'utf-8').then(
            res => JSON.parse(res)
        )
    },

    addContent(pageID, index) {

        const item = new Item();

        // Neuen Content einhängen
        let page = manageContents.pages.find(page => page.id === pageID);
        page.content.splice(
            index,
            0,
            item.id
        );
        console.log(page);

        // Page speichern
        return manageContents.savePages().then(
            // Item speichern
            () => fs.writeFile(
                `./contents/items/${item.id}.json`,
                JSON.stringify(item)
            )
        ).then(
            // Debug-Ausgabe
            () => console.log('Content added')
        ).then(
            // Aktuelle Seitendaten zurückgeben
            () => manageContents.pages.find(page => page.id === pageID)
        ).catch(
            console.warn
        )
    },

    saveContent(data) {
        return fs.writeFile(
            `./contents/items/${data.id}.json`,
            JSON.stringify(data)
        )
    },

    removeContent(contentID) {
        manageContents.pages = manageContents.pages.map(page => {
            if (page.content)
                page.content = page.content.filter(item => item !== contentID);
            return page;
        })

        return fs.unlink(`./contents/items/${contentID}.json`).then(
            () => manageContents.savePages()
        )
    },

    moveContent({currentPage, dropIndex, dragID}) {

        // console.log('move content', currentPage, dropIndex, dragID);
        currentPage = manageContents.pages.find(page => page.id === currentPage);
        // console.log(currentPage);

        let currentIndex = currentPage.content.findIndex(item => item === dragID);
        currentPage.content.splice(currentIndex, 1);

        if (dropIndex > currentIndex) dropIndex--;
        currentPage.content.splice(dropIndex, 0, dragID);

        // console.log(currentPage);
        return manageContents.savePages().then(
            () => currentPage
        )
    },

    removePage(pageID){
        console.log('remove page', pageID);

        // Seite aus allen Kind-Listen entfernen
        manageContents.pages.forEach(
            page => {
                page.children = page.children.filter(child => child !== pageID);
            }
        );

        let page = manageContents.pages.find(page => page.id === pageID);
        console.log(page.id, page.children);

        manageContents.pages = manageContents.pages.filter(page => page.id !== pageID);

        page.children.forEach(child => manageContents.removePage(child));

    },

    savePages() {
        return fs.readFile(`./contents/structure.json`).then(
            payload => {
                payload = JSON.parse(payload.toString());
                payload.pages = manageContents.pages;
                return payload;
            }
        ).then(
            payload => fs.writeFile(
                `./contents/structure.json`,
                JSON.stringify(payload)
            )
        )
    }
}

export default manageContents;