'use strict';

const lang = {
    currentLanguage: 'de',
    availableLanguages: ['de', 'en'],
    getPhrase(phrase) {
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
        }
    }
}

export default lang;