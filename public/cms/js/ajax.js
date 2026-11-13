'use strict';

// Theme-unabhängige Ajax-Schicht fürs Frontend.
// Öffentliche Endpunkte (getImg, später: öffentliche Content-APIs) brauchen
// keinen Token – alles andere läuft über /api und ist nur im Backend relevant.

const ajax = {

    loadJSON(url) {
        return fetch(url).then(res => res.json());
    },

    // Bild-URL zusammenbauen ( kleinstes resized >= minWidth, falls bekannt )
    getImg(folder, filename) {
        return `/api/getImg/${folder}/${filename}`;
    },

    // Kontaktformular ans Backend senden (oeffentlicher Endpunkt)
    sendContact(data) {
        return fetch('/api/contact', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        }).then(
            res => res.json()
        ).catch(
            err => ({status: 'err', msg: String(err)})
        )
    },
}

export default ajax;
