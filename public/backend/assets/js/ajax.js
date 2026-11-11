'use strict';

import data from "./data.js";
import elements from "./elements.js";

const TOKEN_KEY = 'juleToken';

const authHeaders = () => {
    const t = localStorage.getItem(TOKEN_KEY);
    return t ? {Authorization: 'Bearer ' + t} : {};
};

const apiFetch = (url, options = {}) => {
    options.headers = Object.assign({}, authHeaders(), options.headers || {});
    return fetch(url, options);
};

const ajax = {

    loadTestMailMessage() {
        return apiFetch('/api/testMailMessage').then(
            res => res.json()
        ).catch(
            () => ({testMailMessage: ''})
        )
    },

    saveTestMailMessage(msg) {
        return apiFetch('/api/saveTestMailMessage', {
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
        return apiFetch('/api/maxImageResolution').then(
            res => res.json()
        ).catch(
            () => ({maxImageResolution: 2200})
        )
    },

    saveMaxImageResolution(val) {
        return apiFetch('/api/saveMaxImageResolution', {
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
        return apiFetch('/api/saveMediaOrder', {
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
        return apiFetch('/api/smtpSettings').then(
            res => res.json()
        ).catch(
            () => ({})
        )
    },

    saveSmtpSettings(smtp) {
        return apiFetch('/api/saveSmtpSettings', {
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
        return apiFetch('/api/loginValidityDays').then(
            res => res.json()
        ).catch(
            () => ({loginValidityDays: 3})
        )
    },

    saveLoginValidityDays(days) {
        return apiFetch('/api/saveLoginValidityDays', {
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
        return apiFetch('/api/sendTestMail', {
            method: 'POST'
        }).then(
            res => res.json()
        ).catch(
            err => ({status: 'err', msg: String(err)})
        )
    },

    loadAdminEmail() {
        return apiFetch('/api/adminEmail').then(
            res => res.json()
        ).catch(
            () => ({adminEmail: ''})
        )
    },

    saveAdminEmail(adminEmail) {
        return apiFetch('/api/saveAdminEmail', {
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
        return apiFetch('/api/checkAuth').then(
            res => res.json()
        ).catch(
            () => ({authenticated: false})
        )
    },

    login(password) {
        return apiFetch('/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({password})
        }).then(
            res => res.json()
        ).then(
            result => {
                if (result.token) localStorage.setItem(TOKEN_KEY, result.token);
                return result;
            }
        )
    },

    logout() {
        localStorage.removeItem(TOKEN_KEY);
        return apiFetch('/api/logout', {
            method: 'POST'
        }).then(
            res => res.json()
        ).catch(
            console.warn
        )
    },

    loadJSON(url) {
        // console.log(url);
        return apiFetch(url).then(res => res.json());
    },

    saveContent(data) {
        // console.log('save content', data);

        apiFetch('/api/saveContent', {
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
        return apiFetch('/api/saveMedia', {
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
        return apiFetch('/api/saveWatermark', {
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
        return apiFetch('/api/updateMedia', {
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
        return apiFetch('/api/updateWatermark', {
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
        return apiFetch('/api/loadMediaOverview').then(
            res => res.json()
        )
    },

    loadImageMetaData(id) {
        // console.log('load image meta data', id);
        // /getImg/:folder/:filename',
        return apiFetch(`/api/getImgMetaData/media/${id}`).then(
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
        return apiFetch('/api/loadWatermarkOverview').then(
            res => res.json()
        )
    },

    createContent(pageID, index) {
        console.log('create content');
        return apiFetch('/api/createContent', {
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
        return apiFetch('/api/removeContent', {
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
        return apiFetch('/api/moveContent', {
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

        return apiFetch('/api/movePage', {
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
        apiFetch('/api/savePage', {
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
        apiFetch('/api/newPageAfter', {
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
        apiFetch('/api/newPageIn', {
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
        apiFetch('/api/removePage', {
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
        return apiFetch('/api/deleteMedia', {
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
        return apiFetch('/api/savePassword', {
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
        return apiFetch('/api/deleteWatermark', {
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

    loadThemes() {
        return apiFetch('/api/themes').then(
            res => res.json()
        ).catch(
            () => ({themes: [], current: 'default'})
        )
    },

    selectTheme(theme) {
        return apiFetch('/api/selectTheme', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({theme})
        }).then(
            res => res.json()
        )
    }
}

export default ajax;