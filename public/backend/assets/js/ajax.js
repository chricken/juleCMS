'use strict';

import data from "./data.js";
import compPage from "./components/Page/Page.js";

const ajax = {
    loadJSON(url) {
        console.log(url);
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
            console.log
        ).catch(
            console.warn
        )
    },
    createContent(pageID, index) {
        console.log('create content');
        fetch('/api/createContent', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({pageID, index})
        }).then(
            res => res.json()
        ).then(
            payload => {
                console.log(payload)
                data.pages = [
                    ...data.pages.filter(page => page.id !== payload.id),
                    payload
                ]
                // compPage(payload);
            }
        ).catch(
            console.warn
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