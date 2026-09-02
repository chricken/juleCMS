'use strict';

const lang = {
    currentLanguage: 'de',
    availableLanguages: ['de', 'en'],
    getPhrase(phrase) {
        // console.log(phrase);
        if (lang.translations[phrase])
            return lang.translations[phrase][lang.currentLanguage];
        else
            return phrase;
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
        saveChanges: {
            de: 'Änderungen Speichern',
            en: 'Save Changes',
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
        title: {
            de: 'Titel',
            en: 'Title',
        },
        text: {
            de: 'Text',
            en: 'Text',
        },
        desc: {
            de: 'Beschreibung',
            en: 'Description',
        },
        selectFile: {
            de: 'Datei auswählen',
            en: 'Select File',
        },
        createdAt: {
            de: 'Erstellt',
            en: 'Created',
        },
        changedAt: {
            de: 'Geändert',
            en: 'Changed',
        },
        sureDeletePage: {
            de: 'Wollen Sie diese Seite wirklich löschen?',
            en: 'Are you sure you want to delete this page?',
        },
        settings: {
            de: 'Einstellungen',
            en: 'Settings',
        },
        media: {
            de: 'Medien',
            en: 'Media',
        },
        pages: {
            de: 'Seiten',
            en: 'Pages',
        },
        watermark: {
            de: 'Wasserzeichen',
            en: 'Watermark',
        },
        theme: {
            de: 'Theme',
            en: 'Theme',
        },
        tags: {
            de: 'Tags',
            en: 'Tags',
        },
        description: {
            de: 'Beschreibung',
            en: 'Description',
        },
        slugline: {
            de: 'Slugline',
            en: 'Slugline',
        },
        image: {
            de: 'Bild',
            en: 'Image',
        },
        commaSeparated: {
            de: 'Komma getrennt',
            en: 'Comma separated',
        },
        alternativeName: {
            de: 'Alternative',
            en: 'Alternative',
        },
        delete: {
            de: 'Löschen',
            en: 'Delete',
        },
        edit: {
            de: 'Bearbeiten',
            en: 'Edit',
        },
        sureDeleteImage: {
            de: 'Sind Sie sicher, dass Sie dieses Bild löschen möchten?',
            en: 'Are you sure you want to delete this image?',
        },
        filter: {
            de: 'Filter',
            en: 'Filter',
        },
        sortBy: {
            de: 'Sortieren nach',
            en: 'Sort by',
        },
        editImage: {
            de: 'Bild bearbeiten',
            en: 'Edit Image',
        },
        editWatermark: {
            de: 'Wasserzeichen bearbeiten',
            en: 'Edit Watermark',
        },
        uploadMedia: {
            de: 'Medien hochladen',
            en: 'Upload Media',
        },
        uploadWatermark: {
            de: 'Wasserz. hochladen',
            en: 'Upload Watermark',
        },
        size: {
            de: 'Größe',
            en: 'Size',
        },
        sizePercent: {
            de: 'Größe in %',
            en: 'Size (%)',
        },
        position: {
            de: 'Position',
            en: 'Position',
        },
        tiling: {
            de: 'Kachelung',
            en: 'Tiling',
        },
        noTiling: {
            de: 'Keine Kachelung',
            en: 'No Tiling',
        },
        topLeft: {
            de: 'Oben links',
            en: 'Top Left',
        },
        topRight: {
            de: 'Oben rechts',
            en: 'Top Right',
        },
        bottomLeft: {
            de: 'Unten links',
            en: 'Bottom Left',
        },
        bottomRight: {
            de: 'Unten rechts',
            en: 'Bottom Right',
        },
        centerCenter: {
            de: 'Zentriert',
            en: 'Centered',
        },
        noWatermark: {
            de: 'Kein Wasserzeichen',
            en: 'No Watermark',
        },
        links: {
            de: 'Links',
            en: 'Links'
        },
        addLink: {
            de: 'Link hinzufügen',
            en: 'Add Link'
        },
        legend: {
            de: 'Beschriftung',
            en: 'Legend'
        },
        url: {
            de: 'URL',
            en: 'URL'
        },
        target: {
            de: 'Ziel',
            en: 'Target'
        },
        newWindow: {
            de: 'Neues Fenster',
            en: 'New Window'
        },
        sameWindow: {
            de: 'Gleiches Fenster',
            en: 'Same Window'
        }
    }
}

export default lang;