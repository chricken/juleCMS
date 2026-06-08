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
                        console.log(file);
                        return fs.cp(
                            `./themes/${settings.get('theme')}/${file}`,
                            `./public/${file}`,
                            { recursive: true }
                        ).then(
                            () => console.log(`Theme ${file} kopiert`),
                        )
                    }
                )
            )
        );
    },
    init() {
        return new Promise((resolve, reject) => {
            themes.load();
            resolve();
        })
    }
}

export default themes;