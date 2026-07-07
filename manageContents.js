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
        console.log(manageContents.pages);
        manageContents.pages = manageContents.pages.map(page => {
            if (page.content)
                page.content = page.content.filter(item => item !== contentID);
            return page;
        })
        console.log(manageContents.pages);

        return fs.unlink(`./contents/items/${contentID}.json`).then(
            () => manageContents.savePages()
        )
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