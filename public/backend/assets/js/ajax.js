'use strict';

import data from "./data.js";
import compPage from "./components/Page/Page.js";

const ajax = {
    loadJSON(url) {
        // console.log(url);
        return fetch(url).then(res => res.json());
    },
    saveContent(data) {

        fetch('/api/saveContent', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        }).then(
            res => res.json()
        ).then(
            // console.log
        ).catch(
            console.warn
        )
    },
    createContent(pageID, index) {
        console.log('create content');
        return fetch('/api/createContent', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({pageID, index})
        }).then(
            res => res.json()
        ).then(
            payload => {
                data.pages = [
                    ...data.pages.filter(page => page.id !== payload.id),
                    payload
                ]
                return payload;
            }
        )
    },
    removeContent(contentID) {
        return fetch('/api/removeContent', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({contentID})
        }).then(
            res => res.json()
        ).then(
            (pages) => {
                data.pages = pages;
            }
        )
    },
    savePage(data) {
        console.log('Save Page', data);
        fetch('/api/savePage', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        }).then(
            res => res.json()
        ).then(
            console.log
        ).catch(
            console.warn
        )

    }
}

export default ajax;