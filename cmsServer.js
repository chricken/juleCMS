'use strict';

import settings from './settings.js';
import themes from './themes.js';
import manageContents from './manageContents.js';

import express from 'express';
import router from './router.js';
import opn from 'better-opn';

const server = express();

server.use(express.static('public', {
    extensions: ['html']
}));

server.use('/api', router);

server.get('/', (req, res) => {
    res.sendFile('theme/index.html', {root: './public'});
})

// SPA-Fallback: alle unbekannten GET-Pfade (nicht /api, /backend – die matchen vorher)
// liefern das Theme-Index, das clientseitig routet
server.get('/*splat', (req, res) => {
    res.sendFile('theme/index.html', {root: './public'});
})

const init = () => {
    manageContents.init().then(
        () => console.log('Inhalte initialisiert')
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
    ).then(
        () => {
            process.env.OPEN_MATCH_HOST_ONLY = 'true';
            // opn(`http://localhost:${settings.get('port')}`);
            opn(`http://localhost:${settings.get('port')}/backend`);
        }
    ).catch(
        console.warn
    )
}

init();