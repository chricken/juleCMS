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
    crateContent(){
        console.log('create content');
    }
}

export default ajax;