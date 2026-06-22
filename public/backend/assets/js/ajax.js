'use strict';

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
    createContent(){
        console.log('create content');
        fetch('/api/createContent', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
        }).then(
            res => res.json()
        ).then(
            console.log
        ).catch(
            console.warn
        )
    },
    savePage(data){
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