'use strict';

import {promises as fs} from 'fs';

const necessaryContentFolders = ['images', 'items', 'pages'];

const manageContents = {
    init() {

        return Promise.all(necessaryContentFolders.map(foldername =>
            fs.mkdir(`./contents/${foldername}`, {recursive: true})
        ))

    }
};

export default manageContents;