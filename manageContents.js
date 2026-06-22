'use strict';

import {promises as fs} from 'fs';
import structure from './contents/structure.json' with {type: 'json'};

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
    saveContent(data) {
        return fs.writeFile(
            `./contents/items/${data.id}.json`,
            JSON.stringify(data)
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