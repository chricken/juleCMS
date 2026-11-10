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
        movePageTo: {
            de: 'Verschieben',
            en: 'Move Page',
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
        confirmDeleteImage: {
            de: 'Wollen Sie dieses Bild wirklich löschen?',
            en: 'Are you sure you want to delete this image?',
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
            de: '×',
            en: '×',
            // de: 'Löschen',
            // en: 'Delete',
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
        images: {
            de: 'Bilder',
            en: 'Images'
        },
        addImage: {
            de: 'Bild hinzufügen',
            en: 'Add Image'
        },
        moveUp: {
            de: '⇑',
            en: '⇑'
        },
        moveDown: {
            de: '⇓',
            en: '⇓'
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
        },
        internalLink: {
            de: 'Interner Link',
            en: 'Internal Link'
        },
        externalLink: {
            de: 'Externer Link',
            en: 'External Link'
        },
        internalLinkDescription: {
            de: 'Seite anklicken, um sie als Link zu verknüpfen.',
            en: 'Click on the page to link to it.'
        },
        externalLinkDescription: {
            de: 'URL eintragen oder einkopieren, um sie als Link zu verknüpfen.',
            en: 'Enter or paste the URL to link to it.'
        },
        textOnly: {
            de: 'Text',
            en: 'Text'
        },
        titleOnly: {
            de: 'Titel',
            en: 'Title'
        },
        textImageRight: {
            de: 'Text-Bild-Rechts',
            en: 'Text-Image-Right'
        },
        textImageLeft: {
            de: 'Text-Bild-Links',
            en: 'Text-Image-Left'
        },
        textImageBottom: {
            de: 'Text-Bild-Unten',
            en: 'Text-Image-Bottom'
        },
        slideshow: {
            de: 'Slideshow',
            en: 'Slideshow'
        },
        gallery: {
            de: 'Galerie',
            en: 'Gallery'
        }, contactForm: {
            de: 'Kontaktformular',

            en: 'contactForm',
        },
        type:{
            de: 'Typ',
            en: 'Type'
        },
        password: {
            de: 'Passwort',
            en: 'Password'
        },
        newPassword: {
            de: 'Neues Passwort',
            en: 'New Password'
        },
        repeatPassword: {
            de: 'Passwort wiederholen',
            en: 'Repeat Password'
        },
        savePassword: {
            de: 'Passwort speichern',
            en: 'Save Password'
        },
        passwordsMatch: {
            de: 'Passwörter stimmen überein',
            en: 'Passwords match'
        },
        passwordsDontMatch: {
            de: 'Passwörter stimmen nicht überein',
            en: 'Passwords do not match'
        },
        passwordSaved: {
            de: 'Passwort wurde gespeichert.',
            en: 'Password has been saved.'
        },
        passwordSaveError: {
            de: 'Fehler beim Speichern des Passworts.',
            en: 'Error saving the password.'
        },
        loginTitle: {
            de: 'Anmelden',
            en: 'Login'
        },
        loginButton: {
            de: 'Einloggen',
            en: 'Log in'
        },
        wrongPassword: {
            de: 'Falsches Passwort.',
            en: 'Wrong password.'
        },
        loginError: {
            de: 'Fehler beim Anmelden.',
            en: 'Login error.'
        },
        logout: {
            de: 'Abmelden',
            en: 'Log out'
        },
        adminEmail: {
            de: 'Admin E-Mail',
            en: 'Admin Email'
        },
        emailSaved: {
            de: 'E-Mail gespeichert.',
            en: 'Email saved.'
        },
        emailSaveError: {
            de: 'Fehler beim Speichern der E-Mail.',
            en: 'Error saving the email.'
        },
        loginValidity: {
            de: 'Login gültig für (Tage)',
            en: 'Login valid for (days)'
        },
        loginValiditySaved: {
            de: 'Login-Gültigkeit gespeichert.',
            en: 'Login validity saved.'
        },
        sendTestMail: {
            de: 'Testmail senden',
            en: 'Send test mail'
        },
        testMailSent: {
            de: 'Testmail wurde versendet.',
            en: 'Test mail has been sent.'
        },
        testMailSaved: {
            de: 'Testmail wurde als Datei gespeichert (kein SMTP konfiguriert).',
            en: 'Test mail saved as file (no SMTP configured).'
        },
        testMailError: {
            de: 'Fehler beim Senden der Testmail.',
            en: 'Error sending test mail.'
        },
        noAdminEmail: {
            de: 'Bitte zuerst eine Admin-E-Mail eintragen.',
            en: 'Please enter an admin email first.'
        },
        smtpSettings: {
            de: 'SMTP (Mailversand)',
            en: 'SMTP (Mail Server)'
        },
        smtpHost: {
            de: 'SMTP-Host',
            en: 'SMTP Host'
        },
        smtpPort: {
            de: 'Port',
            en: 'Port'
        },
        smtpUser: {
            de: 'Benutzername',
            en: 'Username'
        },
        smtpPass: {
            de: 'Passwort',
            en: 'Password'
        },
        smtpPassHint: {
            de: '(leer lassen = unverändert)',
            en: '(leave empty = unchanged)'
        },
        smtpSecure: {
            de: 'SSL/TLS',
            en: 'SSL/TLS'
        },
        smtpSaved: {
            de: 'SMTP-Einstellungen gespeichert.',
            en: 'SMTP settings saved.'
        },
        testMailMessage: {
            de: 'Zusätzliche Test-Nachricht',
            en: 'Additional test message'
        },
        testMailMessageHint: {
            de: 'Wird zusätzlich zum Standardtext in die Testmail eingefügt.',
            en: 'Added to the default text in the test mail.'
        },
        testMailMessageSaved: {
            de: 'Test-Nachricht gespeichert.',
            en: 'Test message saved.'
        },
        settingsCMS: {
            de: 'CMS',
            en: 'CMS'
        },
        settingsPersonal: {
            de: 'Persönlich',
            en: 'Personal'
        },
        settingsTech: {
            de: 'Tech',
            en: 'Tech'
        },
        maxImageResolution: {
            de: 'Maximale Bild-Auflösung bei Upload',
            en: 'Max image resolution on upload'
        },
        maxImageResolutionHint: {
            de: 'Bilder werden beim Upload auf max. diese Breite skaliert (in px).',
            en: 'Images are scaled down to max. this width on upload (in px).'
        },
        maxImageResolutionSaved: {
            de: 'Max. Auflösung gespeichert:',
            en: 'Max. resolution saved:'
        },
        uploadImages: {
            de: 'Bilder hochladen',
            en: 'Upload images'
        },
        uploadImagesHint: {
            de: 'Mehrere Bilder von der Festplatte auswählen. Pro Bild können Titel, Beschreibung, Alt-Name und Tags vergeben werden.',
            en: 'Select multiple images from disk. Title, description, alt name and tags can be set per image.'
        },
        saveUploads: {
            de: 'Hochladen & Speichern',
            en: 'Upload & Save'
        },
        remove: {
            de: '✖',
            en: '✖'
        },
        uploading: {
            de: 'Bilder werden hochgeladen...',
            en: 'Uploading images...'
        },
        uploadsDone: {
            de: 'Hochladen fertig',
            en: 'Upload complete'
        },
        uploadError: {
            de: 'Fehler beim Hochladen:',
            en: 'Upload error:'
        }
    }
}

export default lang;