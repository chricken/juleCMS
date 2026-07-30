'use strict';

import {promises as fs} from 'fs';
import structure from './contents/structure.json' with {type: 'json'};
import media from './contents/media.json' with {type: 'json'};
import watermarks from './contents/watermarks.json' with {type: 'json'};
import helpers from "./helpers.js";
import Item from "./classes/Item.js";
import Image from "./classes/Image.js";
import Watermark from "./classes/Watermark.js";
import settings from "./settings.js";
import {Jimp} from "jimp";

const necessaryContentFolders = ['items', 'pages', 'media', 'watermarks'];

const manageContents = {
    pages: null,
    media: null,
    watermarks: null,

    init() {
        return Promise.all(necessaryContentFolders.map(foldername =>
            fs.mkdir(`./contents/${foldername}`, {recursive: true})
        )).then(
            () => manageContents.pages = structure.pages
        ).then(
            () => manageContents.media = media
        ).then(
            () => manageContents.watermarks = watermarks
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
        console.log('manage save content', data);

        return fs.writeFile(
            `./contents/items/${data.id}.json`,
            JSON.stringify(data)
        )
    },

    removeContent(contentID) {
        manageContents.pages = manageContents.pages.map(page => {
            if (page.content)
                page.content = page.content.filter(item => item !== contentID);
            return page;
        })

        return fs.unlink(`./contents/items/${contentID}.json`).then(
            () => manageContents.savePages()
        )
    },

    moveContent({currentPage, dropIndex, dragID}) {

        // console.log('move content', currentPage, dropIndex, dragID);
        currentPage = manageContents.pages.find(page => page.id === currentPage);
        // console.log(currentPage);

        let currentIndex = currentPage.content.findIndex(item => item === dragID);
        currentPage.content.splice(currentIndex, 1);

        if (dropIndex > currentIndex) dropIndex--;
        currentPage.content.splice(dropIndex, 0, dragID);

        // console.log(currentPage);
        return manageContents.savePages().then(
            () => currentPage
        )
    },

    removePage(pageID) {
        // Seite aus allen Kind-Listen entfernen
        manageContents.pages.forEach(
            page => {
                page.children = page.children.filter(child => child !== pageID);
            }
        );

        let page = manageContents.pages.find(page => page.id === pageID);

        return Promise.all(
            // Wenn content kein Array ist, benutze dieses leere Array
            (page.content || []).map(
                contentID => manageContents.removeContent(contentID)
            )
        ).then(
            () => console.log('Content removed')
        ).then(
            () => {
                manageContents.pages = manageContents.pages.filter(page => page.id !== pageID);
                page.children.forEach(child => manageContents.removePage(child));
            }
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
    },

    saveMedia(payload) {
        // Größe anpassen
        return manageContents.convertImage({
            path: './contents/media/',
            filename: payload.filename,
            defRes: settings.get('defaultResolutions')
        }).then(
            res => payload.resized = res
        ).then(
            () => {
                manageContents.media[payload.id] = new Image(payload);
            }
        ).then(
            // Der Speichervorgang soll noch eine Sekunde warten, bevor er startet
            () => saveMediaFileDebouncer({
                payload: manageContents.media,
            })
        )
    },

    saveWatermark(payload) {
        return manageContents.convertImage({
            path: './contents/watermarks/',
            filename: payload.filename,
            defRes: settings.get('watermarkResolutions')
        }).then(
            res => payload.resized = res
        ).then(
            () => {
                manageContents.watermarks[payload.id] = new Watermark(payload);
            }
        ).then(
            // Der Speichervorgang soll noch eine Sekunde warten, bevor er startet
            () => saveWatermarksFileDebouncer({
                payload: manageContents.watermarks
            })
        )
    },

    updateMedia(payload) {
        const content = manageContents.media[payload.id];
        // console.log('payload', payload);

        // Daten an das gespeicherte Objekt übertragen (auch die Bild-ID)
        Object.entries(payload).forEach(([key, value]) => {
            content[key] = value;
        })
        // console.log('content after', content);

        if (payload.filename) {
            content.resized = [];
            return manageContents.convertImage({
                path: './contents/media/',
                filename: payload.filename,
            }).then(
                (res) => {
                    content.resized = res
                    console.log('content after resize', content);
                    // console.log(res);

                    // Der Speichervorgang soll noch eine Sekunde warten, bevor er startet
                    return saveMediaFileDebouncer({
                        payload:manageContents.media
                    })
                }
            ).catch(
                console.warn
            )
        } else {
            return new Promise(resolve => {
                resolve()
            })
        }
    },

    deleteMedia(payload) {
        let count = 0;

        return new Promise(resolve => {
            resolve()
        }).then(
            () => {
                delete manageContents.media[payload.id]
            }
        ).then(
            () => saveMediaFileDebouncer({payload: manageContents.media})
        ).then(
            () => {
                if (payload.filename) {
                    count++;
                    return fs.unlink(`./contents/media/${payload.filename}`)
                }
            }
        ).then(
            () => {
                if (payload.resized.length) {
                    count += payload.resized.length;
                    return Promise.all(
                        payload.resized.map(
                            file => fs.unlink(`./contents/media/${file.filename}`)
                        )
                    )
                }
            }
        ).then(
            () => {
                return {
                    status: 'success',
                    filesDeleted: count
                }
            }
        ).catch(
            err => {
                console.log('err 404', err);
                return {
                    status: 'err',
                    filesDeleted: 0,
                    msg: err
                }
            }
        )
    },

    deleteWatermark(payload) {
        let count = 0;

        return new Promise(resolve => {
            resolve()
        }).then(
            () => {
                delete manageContents.watermarks[payload.id]
            }
        ).then(
            () => saveWatermarksFileDebouncer({payload: manageContents.watermarks})
        ).then(
            () => {
                if (payload.filename) {
                    count++;
                    return fs.unlink(`./contents/watermarks/${payload.filename}`)
                }
            }
        ).then(
            () => {
                if (payload.resized.length) {
                    count += payload.resized.length;
                    return Promise.all(
                        payload.resized.map(
                            file => fs.unlink(`./contents/watermarks/${file.filename}`)
                        )
                    )
                }
            }
        ).then(
            () => {
                return {
                    status: 'success',
                    filesDeleted: count
                }
            }
        ).catch(
            err => {
                console.log('err 404', err);
                return {
                    status: 'err',
                    filesDeleted: 0,
                    msg: err
                }
            }
        )
    },

    // IIFE Function für jeden einzelnen Debouncer
    // Der Rückgabewert ist die Funktion mit dem fertigen Scope
    saveFileDebouncer: ({fileURL = null,}) => {
        let timerID = null;

        return ({
                    payload = null,
                }) => {

            if (timerID) clearTimeout(timerID);
            timerID = setTimeout(() => {
                fs.writeFile(
                    fileURL,
                    JSON.stringify(payload)
                ).then(
                    () => console.log('File saved')
                ).catch(
                    err => console.log(`file "${fileURL}" could not be saved`, err)
                )
            }, settings.get('delayDebouncersFileSave'));
        }
    },

    convertImage({
                     path = './',
                     filename = null,
                     defRes = []
                 }) {
        // Die ID wird aus dem Bildnamen gezogen. So kann jedes Bild unabhängig von der
        // ID des Mutter-Datensatzes konvertiert werden
        const id = filename.split('.')[0];

        // Diese Funktion scheint mir kein Promise zu sein.

        return Jimp.read(`${path}${filename}`).then(
            // Daher bin ich nicht ganz sicher, ob das Timing später Probleme bereitet
            image => {
                let img = image.clone();
                let w = img.bitmap.width;
                let filenames = []
                return Promise.all(
                    defRes
                        // Das Bild soll nicht vergrößert werden
                        .filter(val => val <= w)
                        .map(res => {
                            // console.log(`${path}${id}_${res}.png`);
                            filenames.push({
                                filename: `${id}_${res}.png`,
                                width: res
                            })

                            return image.clone()
                                .resize({w: res, h: Jimp.AUTO})
                                .write(`${path}${id}_${res}.png`);
                        })
                ).then(
                    () => {
                        // Rückgabe der Variable
                        // console.log(filenames)
                        return filenames;
                    }
                )
            }
        ).then(
            res => {
                // Debugausgabe und Weiterleitung
                // console.log('done')
                return res;
            }
        )
    }
}

let saveMediaFileDebouncer = manageContents.saveFileDebouncer({
    fileURL: './contents/media.json',
});
let saveWatermarksFileDebouncer = manageContents.saveFileDebouncer({
    fileURL: './contents/watermarks.json',
});

export default manageContents;