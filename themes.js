'use strict';

import {promises as fs} from 'fs';
import settings from './settings.js';

const themes = {
    load() {
        return fs.readdir(
            `./themes/${settings.get('theme')}`
        ).then(
            res => Promise.all(
                res.map(
                    file => {
                        console.log(14, file);
                        return fs.cp(
                            `./themes/${settings.get('theme')}/${file}`,
                            `./public/${file}`,
                            {recursive: true}
                        ).then(
                            () => console.log(20, `Theme ${file} kopiert`),
                        )
                    }
                )
            )
        );
    },
    init() {
        return themes.load();
    }
}

export default themes;