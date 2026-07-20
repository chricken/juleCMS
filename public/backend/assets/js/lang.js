'use strict';

const lang = {
    currentLanguage: 'de',
    availableLanguages: ['de', 'en'],
    getPhrase(phrase) {
        // console.log(phrase);
        return lang.translations[phrase][lang.currentLanguage];
    },
    translations: {
        newPageAfter: {
            de: 'Neue Seite Nach',
            en: 'New Page After',
        },
        newPageIn: {
            de: 'Neue Seite In',
            en: 'New Page In',
        },
        savePage: {
            de: 'Seite Speichern',
            en: 'Save Page',
        },
        removePage: {
            de: 'Seite Entfernen',
            en: 'Remove Page',
        },
        contents: {
            de: 'Inhalte',
            en: 'Contents',
        },
        meta: {
            de: 'Metadaten',
            en: 'Meta Data',
        },
        base: {
            de: 'Grundlagen',
            en: 'Base Data',
        },
        title:{
          de: 'Titel',
          en: 'Title',
        },
        desc:{
          de: 'Beschreibung',
          en: 'Description',
        },
        selectFile:{
            de: 'Datei auswählen',
            en: 'Select File',
        },
        createdAt: {
            de: 'Erstellt am',
            en: 'Created at',
        },
        changedAt: {
            de: 'Geändert am',
            en: 'Changed at',
        },
        sureDeletePage:{
            de: 'Wollen Sie diese Seite wirklich löschen?',
            en: 'Are you sure you want to delete this page?',
        },
        settings:{
            de: 'Einstellungen',
            en: 'Settings',
        },
        media:{
            de: 'Medien',
            en: 'Media',
        },
        pages:{
            de: 'Seiten',
            en: 'Pages',
        },
        watermark:{
            de: 'Wasserzeichen',
            en: 'Watermark',
        },
        theme:{
            de: 'Theme',
            en: 'Theme',
        },
        tags:{
            de: 'Tags',
            en: 'Tags',
        },
        description:{
            de: 'Beschreibung',
            en: 'Description',
        },
        image:{
            de: 'Bild',
            en: 'Image',
        },
        commaSeparated:{
            de: 'Komma getrennt',
            en: 'Comma separated',
        },
        alternativeName:{
            de: 'Alternative',
            en: 'Alternative',
        },
        delete:{
            de: 'Löschen',
            en: 'Delete',
        },
        sureDeleteImage:{
            de: 'Sind Sie sicher, dass Sie dieses Bild löschen möchten?',
            en: 'Are you sure you want to delete this image?',
        }
    }
}

export default lang;