'use strict';

import {promises as fs} from 'fs';
import settings from './settings.js';

const themes = {

    // Alle Theme-Ordner in ./themes auflisten
    list() {
        return fs.readdir('./themes', {withFileTypes: true}).then(
            entries => entries
                .filter(e => e.isDirectory())
                .map(e => e.name)
        )
    },

    // Selektiertes Theme nach public/theme kopieren (vorher leeren)
    load() {
        const theme = settings.get('theme');
        return fs.rm('./public/theme', {recursive: true, force: true}).then(
            () => fs.mkdir('./public/theme', {recursive: true})
        ).then(
            () => fs.readdir(`./themes/${theme}`)
        ).then(
            res => Promise.all(
                res.map(
                    file => fs.cp(
                        `./themes/${theme}/${file}`,
                        `./public/theme/${file}`,
                        {recursive: true}
                    ).then(
                        () => console.log(`Theme-Datei ${file} kopiert`),
                    )
                )
            )
        ).then(
            () => console.log(`Theme "${theme}" nach public/theme kopiert`)
        )
    },

    init() {
        return themes.load();
    }
}

export default themes;
