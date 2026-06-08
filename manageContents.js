'use strict';

import {promises as fs} from 'fs';
import structure from './contents/structure.json' with {type: 'json'};

const necessaryContentFolders = ['images', 'items', 'pages'];

const manageContents = {
    pages:null,
    init() {
        return Promise.all(necessaryContentFolders.map(foldername =>
            fs.mkdir(`./contents/${foldername}`, {recursive: true})
        )).then(
            () => {
                manageContents.pages = structure;
            }
        )

    }
};

export default manageContents;