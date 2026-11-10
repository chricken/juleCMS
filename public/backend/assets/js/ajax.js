'use strict';

import data from "./data.js";
import elements from "./elements.js";

const ajax = {

    loadTestMailMessage() {
        return fetch('/api/testMailMessage').then(
            res => res.json()
        ).catch(
            () => ({testMailMessage: ''})
        )
    },

    saveTestMailMessage(msg) {
        return fetch('/api/saveTestMailMessage', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({testMailMessage: msg})
        }).then(
            res => res.json()
        ).catch(
            err => ({status: 'err', msg: String(err)})
        )
    },

    loadMaxImageResolution() {
        return fetch('/api/maxImageResolution').then(
            res => res.json()
        ).catch(
            () => ({maxImageResolution: 2200})
        )
    },

    saveMaxImageResolution(val) {
        return fetch('/api/saveMaxImageResolution', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({maxImageResolution: val})
        }).then(
            res => res.json()
        ).catch(
            err => ({status: 'err', msg: String(err)})
        )
    },

    saveMediaOrder(order) {
        return fetch('/api/saveMediaOrder', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({order})
        }).then(
            res => res.json()
        ).catch(
            err => ({status: 'err', msg: String(err)})
        )
    },

    loadSmtpSettings() {
        return fetch('/api/smtpSettings').then(
            res => res.json()
        ).catch(
            () => ({})
        )
    },

    saveSmtpSettings(smtp) {
        return fetch('/api/saveSmtpSettings', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(smtp)
        }).then(
            res => res.json()
        ).catch(
            err => ({status: 'err', msg: String(err)})
        )
    },

    loadLoginValidityDays() {
        return fetch('/api/loginValidityDays').then(
            res => res.json()
        ).catch(
            () => ({loginValidityDays: 3})
        )
    },

    saveLoginValidityDays(days) {
        return fetch('/api/saveLoginValidityDays', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({loginValidityDays: days})
        }).then(
            res => res.json()
        ).catch(
            err => ({status: 'err', msg: String(err)})
        )
    },

    sendTestMail() {
        return fetch('/api/sendTestMail', {
            method: 'POST'
        }).then(
            res => res.json()
        ).catch(
            err => ({status: 'err', msg: String(err)})
        )
    },

    loadAdminEmail() {
        return fetch('/api/adminEmail').then(
            res => res.json()
        ).catch(
            () => ({adminEmail: ''})
        )
    },

    saveAdminEmail(adminEmail) {
        return fetch('/api/saveAdminEmail', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({adminEmail})
        }).then(
            res => res.json()
        ).catch(
            err => ({status: 'err', msg: String(err)})
        )
    },

    checkAuth() {
        return fetch('/api/checkAuth').then(
            res => res.json()
        ).catch(
            () => ({authenticated: false})
        )
    },

    login(password) {
        return fetch('/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({password})
        }).then(
            res => res.json()
        )
    },

    logout() {
        return fetch('/api/logout', {
            method: 'POST'
        }).then(
            res => res.json()
        ).catch(
            console.warn
        )
    },

    loadJSON(url) {
        // console.log(url);
        return fetch(url).then(res => res.json());
    },

    saveContent(data) {
        // console.log('save content', data);

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

    saveMedia(formData) {
        // console.log('save media', formData);
        return fetch('/api/saveMedia', {
            method: 'POST',
            body: formData
        }).then(
            res => res.json()
        ).then(
            payload => {
                // Debug Ausgabe und Weiterleitung
                // console.log(payload);
                return payload;
            }
        )
    },

    saveWatermark(formData) {
        console.log('save Watermark', formData);
        return fetch('/api/saveWatermark', {
            method: 'POST',
            body: formData
        }).then(
            res => res.json()
        ).then(
            payload => {
                // Debug Ausgabe und Weiterleitung
                // console.log(payload);
                return payload;
            }
        )
    },

    updateMedia(formData) {
        console.log('update media', formData);
        return fetch('/api/updateMedia', {
            method: 'POST',
            body: formData
        }).then(
            res => res.json()
        ).then(
            payload => {
                // Debug Ausgabe und Weiterleitung
                // console.log(payload);
                return payload;
            }
        )
    },

    updateWatermark(formData) {
        console.log('update Watermark', formData);
        return fetch('/api/updateWatermark', {
            method: 'POST',
            body: formData
        }).then(
            res => res.json()
        ).then(
            payload => {
                return payload;
            }
        )
    },

    loadMediaOverview() {
        return fetch('/api/loadMediaOverview').then(
            res => res.json()
        )
    },

    loadImageMetaData(id) {
        // console.log('load image meta data', id);
        // /getImg/:folder/:filename',
        return fetch(`/api/getImgMetaData/media/${id}`).then(
            result => result.json()
        ).then(
            result => {
                // console.log('Load Media', result);
                if (result.status === 'error') throw result.error;
                return result.payload;
            }
        ).catch(
            err => {
                console.log(err);
                return {}
            }
        )
    },

    loadWatermarkOverview() {
        return fetch('/api/loadWatermarkOverview').then(
            res => res.json()
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

    movePage({dragID, targetID, position}) {

        return fetch('/api/movePage', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({dragID, targetID, position})
        }).then(
            res => res.json()
        ).then(
            result => {
                if (result.status === 'err') throw result.msg;
                data.pages = result.payload;
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

                elements.pages.innerHTML = '';
                window.dispatchEvent(new CustomEvent('jule:rerenderNav'))
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
                window.dispatchEvent(new CustomEvent('jule:rerenderNav'));
                window.dispatchEvent(new CustomEvent('jule:renderPage', {detail: data.pages.find(p => p.id === result.newID)}));
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
                window.dispatchEvent(new CustomEvent('jule:rerenderNav'));
                window.dispatchEvent(new CustomEvent('jule:renderPage', {detail: data.pages.find(p => p.id === result.newID)}));
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
                window.dispatchEvent(new CustomEvent('jule:rerenderNav'));
                elements.page.innerHTML = '';
            }
        ).catch(
            console.warn
        )
    },

    deleteMedia(image) {
        return fetch('/api/deleteMedia', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(image)
        }).then(
            res => res.json()
        ).then(
            res => res.payload
        ).catch(
            console.warn
        )
    },

    savePassword(password) {
        return fetch('/api/savePassword', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({password})
        }).then(
            res => res.json()
        ).catch(
            err => ({status: 'err', msg: String(err)})
        )
    },

    deleteWatermark(image) {
        return fetch('/api/deleteWatermark', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(image)
        }).then(
            res => res.json()
        ).then(
            res => res.payload
        ).catch(
            console.warn
        )
    }
}

export default ajax;