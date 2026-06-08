'use strict';

import settingsFile from './settings.json' with {type: 'json'};
import {promises as fs} from 'fs';

const settings = settingsFile;

const storeSettings = () => {
    return fs.writeFile(
        './settings.json',
        JSON.stringify(settings)
    );
}

// Settings sollen immutable sein
export default {
    get(key) {
        return JSON.parse(JSON.stringify(settings[key]))
    },
    set(key, value) {
        settings[key] = JSON.parse(JSON.stringify(value));
        storeSettings().then(
            () => console.log('Settings saved'),
        ).catch(
            err => console.log(err)
        );
    },
};