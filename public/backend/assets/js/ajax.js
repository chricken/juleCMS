'use strict';

import data from "./data.js";
import compPage from "./components/Page/Page.js";
// import compPages from "./components/Pages/Pages.js";
import elements from "./elements.js";

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
    moveContent() {
        console.log(data);
        return fetch('/api/moveContent', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                currentPage: data.currentPage,
                dropIndex: data.dropIndex,
                dragID: data.dragID,
            })
        }).then(
            res => res.json()
        ).then(
            result => {
                data.pages = [
                    ...data.pages.filter(page => page.id !== result.payload.id),
                    result.payload
                ]
                return result.payload;
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
            result => {
                data.pages = result.payload;
                compPages()
            }
        ).catch(
            console.warn
        )

    },
    newPageAfter(page) {
        fetch('/api/newPageAfter', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(page)
        }).then(
            res => res.json()
        ).then(
            result => {
                data.pages = result.payload;
                data.currentPage = result.newID;
                compPages()
                compPage(data.pages.find(p => p.id === result.newID));
            }
        ).catch(
            console.warn
        )

    },
    newPageIn(page) {
        fetch('/api/newPageIn', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(page)
        }).then(
            res => res.json()
        ).then(
            result => {
                data.pages = result.payload;
                data.currentPage = result.newID;
                compPages()
                compPage(data.pages.find(p => p.id === result.newID));
            }
        ).catch(
            console.warn
        )

    },
    removePage(page) {
        fetch('/api/removePage', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(page)
        }).then(
            res => res.json()
        ).then(
            result => {
                data.pages = result.payload;
                compPages();
                elements.page.innerHTML = '';
            }
        ).catch(
            console.warn
        )
    }
}

export default ajax;