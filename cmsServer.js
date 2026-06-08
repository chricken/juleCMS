'use strict';

import settings from './settings.js';
import themes from './themes.js';
import manageContents from './manageContents.js';

import express from 'express';
import router from './router.js';

const server = express();

server.use(express.static('public', {
    extensions: ['html']
}));
server.use(router);

const init = () => {
    manageContents.init().then(
        () => console.log('Contents initialisiert'),
    ).then(
        themes.init
    ).then(
        () => console.log('Themes initialisiert'),
    ).then(
        () => {
            server.listen(settings.get('port'), err => {
                if (err) console.log(err);
                else console.log(`Server läuft auf Port ${settings.get('port')}`);
            });
        }
    )
}

init();